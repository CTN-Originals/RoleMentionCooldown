import type { ChatInputCommandInteraction, Role } from 'discord.js';
import { ApplicationCommandOptionType, EmbedBuilder, InteractionContextType } from 'discord.js';
import type { IButtonCollection, ISelectMenuCollection} from '../../handlers/commandBuilder';
import { BaseButtonCollection, BaseEmbedCollection, BaseMethodCollection, BaseSelectMenuCollection, CommandInteractionData, LOG_LEVEL } from '../../handlers/commandBuilder';
import { Mentionable } from '../../data/orm/mentionables';
import { ColorTheme, GeneralData } from '../../data';
import { getTimeDisplay, getTimestamp, hexToBit } from '../../utils';
import type { IMentionableItem } from '../../data/orm/schemas/mentionableData';
import { cons } from '../..';

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
}
class MethodCollection extends BaseMethodCollection {
	public onUsedLog(interaction: ChatInputCommandInteraction, role: Role, response: string) {
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
					embeds:    [command.embeds.roleNotRegistered(role.id)],
					ephemeral: !GeneralData.development,
				});

				command.methods.onUsedLog(interaction, role, `[fg=${ColorTheme.colors.red.asHex}]Rejected[/>][fg=${ColorTheme.colors.grey.asHex}] - Role is not registered[/>]`);

				return 'Role is not registered as mentionable';
			}

			const activeCooldown = Mentionable.getActiveCooldown(mentionable, interaction.channelId, interaction.user.id);

			if (Mentionable.isOncooldown(mentionable, interaction.channelId, interaction.user.id) === true) {
				await interaction.reply({
					embeds:    [command.embeds.roleOnCooldown(role.id, mentionable, interaction)],
					ephemeral: !GeneralData.development,
				});

				command.methods.onUsedLog(interaction, role, [
					`[fg=${ColorTheme.colors.red.asHex}]Rejected[/>][fg=${ColorTheme.colors.grey.asHex}]`,
					` - Mentionable on[/>] [fg=${ColorTheme.colors.orange.asHex}]${activeCooldown}-cooldown[/>]: `,
					`[fg=${ColorTheme.colors.green.asHex}]${getTimeDisplay(Mentionable.remainingCooldown(mentionable, interaction.channelId, interaction.user.id))}[/>]`
				].join(''));

				return 'Role is on cooldown';
			}

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