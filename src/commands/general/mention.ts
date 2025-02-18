import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, MessageFlags, Role } from 'discord.js';
import { cons } from '../..';
import { ColorTheme, GeneralData } from '../../data';
import { Mentionable } from '../../data/orm/mentionables';
import type { IMentionableItem } from '../../data/orm/schemas/mentionableData';
import type { IButtonCollection, ISelectMenuCollection } from '../../handlers/commandBuilder';
import { BaseButtonCollection, BaseEmbedCollection, BaseMethodCollection, BaseSelectMenuCollection, CommandInteractionData, LOG_LEVEL } from '../../handlers/commandBuilder';
import { getTimeDisplay, getTimestamp, hexToBit, includesAny } from '../../utils';

import RoleCooldownCommand from '../configuration/manageRoles';

class ButtonCollection extends BaseButtonCollection implements IButtonCollection<ButtonCollection> {}
class SelectMenuCollection extends BaseSelectMenuCollection implements ISelectMenuCollection<SelectMenuCollection> {}
class EmbedCollection extends BaseEmbedCollection {
	public roleNotRegistered(roleId: string): EmbedBuilder {
		return new EmbedBuilder({
			description: [
				`The role you entered (<@&${roleId}>) is not registered as a cooldown role.`,
				'Consider using the `/list all` command to see which roles can be used with this command.'
			].join('\n'),
			color: hexToBit(ColorTheme.embeds.notice)
		});
	}

	public roleOnCooldown(roleId: string, mentionable: IMentionableItem, interaction: ChatInputCommandInteraction): EmbedBuilder {
		const remainingTime = Mentionable.remainingCooldown(mentionable, interaction.channelId, interaction.user.id);
		const activeCooldown = Mentionable.getActiveCooldown(mentionable, interaction.channelId, interaction.user.id);

		return new EmbedBuilder({
			description: [
				`The role you entered (<@&${roleId}>) is currently on cooldown.`,
				`The \`${activeCooldown}\` cooldown expires <t:${getTimestamp(Date.now() + remainingTime)}:R>.`
			].join('\n'),
			color: hexToBit(ColorTheme.embeds.notice)
		});
	}

	public usageScopeConflict(mentionable: IMentionableItem, text: string): EmbedBuilder[] {
		return [
			new EmbedBuilder({
				description: text,
				color:       hexToBit(ColorTheme.embeds.notice)
			}),
			new EmbedBuilder({
				fields: Object.values(RoleCooldownCommand.embeds.getMentionableUsageScopeFields(mentionable)),
				color:  hexToBit(ColorTheme.embeds.info)
			})
		];
	}
}
class MethodCollection extends BaseMethodCollection {
	public onUsedLog(interaction: ChatInputCommandInteraction, role: Role, response: string): void {
		cons.log([
			`[fg=${ColorTheme.colors.yellow.asHex}]${interaction.guild!.name}[/>]:`,
			`[fg=${ColorTheme.colors.cyan.asHex}]${interaction.user.username}[/>] mentioned`,
			`[fg=${(role.hexColor != '#000000') ? role.hexColor : ColorTheme.colors.grey.asHex}]@${role.name}[/>] |`,
			`${response}`
		].join(' '));
	}
}

const command = new CommandInteractionData<ButtonCollection, SelectMenuCollection, EmbedCollection, MethodCollection>({
	command: {
		logLevel: LOG_LEVEL.ERROR,
		content:  {
			name:                'mention',
			description:         'Mention a role in the current channel',
			contexts:            [InteractionContextType.Guild],
			requiredPermissions: ['MentionEveryone'],
			options:             [
				{
					type:        ApplicationCommandOptionType.Role,
					name:        'role',
					description: 'The role to mention',
					required:    true
				},
				{ //TODO add syntax to allow the user to place the role somewhere inside the message
					type:        ApplicationCommandOptionType.String,
					name:        'message',
					description: 'A message you would like to be included',
				}
			]
		},
		execute: async function (interaction: ChatInputCommandInteraction) {
			const role: Role = interaction.options.getRole('role', true) as Role;
			const message: string | null = interaction.options.getString('message');
			const mentionable = await Mentionable.get(interaction.guildId!, role.id);

			if (!mentionable) {
				await interaction.reply({
					embeds: [command.embeds.roleNotRegistered(role.id)],
					flags:  [((!GeneralData.development) ? MessageFlags.Ephemeral : MessageFlags.SuppressNotifications)],
				});

				command.methods.onUsedLog(interaction, role, `[fg=${ColorTheme.colors.red.asHex}]Rejected[/>][fg=${ColorTheme.colors.grey.asHex}] - Role is not registered[/>]`);

				return 'Role is not registered as mentionable';
			}

			//#region Usage Scope
			if (mentionable.usageScope.channelScopeType !== 'none') {
				const scopeState = (mentionable.usageScope.channelScopeType === 'allow');
				if (mentionable.usageScope.channelScope.includes(interaction.channelId) !== scopeState) {
					await interaction.reply({
						embeds: command.embeds.usageScopeConflict(mentionable, `The rolecooldown you selected (<@&${role.id}>) is not allowed to be used in this channel`),
						flags:  [((!GeneralData.development) ? MessageFlags.Ephemeral : MessageFlags.SuppressNotifications)]
					});

					return 'Conflicting channel scope';
				}
			}
			
			if (mentionable.usageScope.roleScopeType !== 'none') {
				const roles = interaction.member!.roles;

				let roleList: string[] = [];
				if (Array.isArray(roles)) {
					roleList = roles;
				} else {
					roles.cache.each((_, key) => roleList.push(key));
				}

				const scopeState = (mentionable.usageScope.roleScopeType === 'allow');
				if (includesAny(mentionable.usageScope.roleScope, roleList) !== scopeState) {
					await interaction.reply({
						embeds: command.embeds.usageScopeConflict(mentionable, `You do not have the correct roles to be able to use the rolecooldown that you selected (<@&${role.id}>)`),
						flags:  [((!GeneralData.development) ? MessageFlags.Ephemeral : MessageFlags.SuppressNotifications)]
					});

					return 'Conflicting role scope';
				}
			}
			//#endregion

			//#region Cooldown
			const activeCooldown = Mentionable.getActiveCooldown(mentionable, interaction.channelId, interaction.user.id);

			if (Mentionable.isOncooldown(mentionable, interaction.channelId, interaction.user.id) === true) {
				await interaction.reply({
					embeds: [command.embeds.roleOnCooldown(role.id, mentionable, interaction)],
					flags:  [((!GeneralData.development) ? MessageFlags.Ephemeral : MessageFlags.SuppressNotifications)],
				});

				command.methods.onUsedLog(interaction, role, [
					`[fg=${ColorTheme.colors.red.asHex}]Rejected[/>][fg=${ColorTheme.colors.grey.asHex}]`,
					` - Mentionable on[/>] [fg=${ColorTheme.colors.orange.asHex}]${activeCooldown}-cooldown[/>]: `,
					`[fg=${ColorTheme.colors.green.asHex}]${getTimeDisplay(Mentionable.remainingCooldown(mentionable, interaction.channelId, interaction.user.id))}[/>]`
				].join(''));

				return 'Role is on cooldown';
			}
			//#endregion

			await interaction.reply({
				content:         `<@&${role.id}>${(message) ? ` ${message}` : ''}`,
				allowedMentions: {roles: [role.id]}
			});

			Mentionable.onUsed(interaction.guild!, role.id, interaction.channelId, interaction.user.id);
			command.methods.onUsedLog(interaction, role, [
				`[fg=${ColorTheme.colors.green.asHex}]Cooldown Started[/>]: `,
				`[fg=${ColorTheme.colors.grey.asHex}]${getTimeDisplay(mentionable.cooldownTime[activeCooldown ?? 'global'])}[/>]`,
				`${(message) ? ` - [fg=${ColorTheme.colors.orange.asHex}]message[/>]: [fg=white]${message}[/>]` : ''}`
			].join(''));

			return true;
		},
	},
	buttons:     new ButtonCollection(),
	selectMenus: new SelectMenuCollection(),
	embeds:      new EmbedCollection(),
	methods:     new MethodCollection(),
});

export default command;