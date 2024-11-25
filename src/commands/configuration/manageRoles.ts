
import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { ColorTheme, GeneralData } from '../../data'
import { hexToBit, PeriodOfTime, includesAll, includesAny } from "../../utils";
import { Mentionable } from "../../data/orm/mentionables";
import { EmitError } from "../../events";
import { ConsoleInstance } from "better-console-utilities";
import { validateEmbed } from "../../utils/embedUtils";
import { client } from "../..";
import { PermissionObject } from "../../handlers/permissionHandler";

const thisConsole = new ConsoleInstance();

export default {
	command: {
		permissions: new PermissionObject({
			guildAdmin: true,
			configAdmin: true,
		}),
		data: new SlashCommandBuilder()
			.setName("rolecooldown")
			.setDescription("Manage role cooldowns")
			.addSubcommand(sub => sub
				.setName("add")
				.setDescription("Add a new role to the list, or edit an existing one")
				.addRoleOption(option => option
					.setName('role')
					.setDescription('The role to add')
					.setRequired(true)
				)
				.addStringOption(option => option
					.setName('cooldown')
					.setDescription('The cooldown to apply to the this once its used (seperate with spaces). 8s 69m 28h 1d = 2d 05:09:08')
					.setRequired(true)
					.setMinLength(2)
				)
			)
			.addSubcommand(sub => sub
				.setName("remove")
				.setDescription("Remove a role from the list")
				.addRoleOption(option => option
					.setName('role')
					.setDescription('The role to remove')
					.setRequired(true)
				)
			),
		async execute(interaction: ChatInputCommandInteraction) {
			const subCommand = interaction.options.getSubcommand();
			switch (subCommand) {
				case 'add': return await this.addRole(interaction);
				case 'remove': return await this.removeRole(interaction);
				default: break;
			}

			//? if code reaches here, that means that all subcommands and groups fell through somehow...
			throw new Error(`Unknown command command:${interaction.commandName} sub:${subCommand}`);
		},
		async addRole(interaction: ChatInputCommandInteraction) {
			if (!interaction.guild) {
				throw new Error(`Interaction did not contain guild`)
			}
			const roleId = interaction.options.get('role', true).value;

			let cooldownInput = interaction.options.getString('cooldown', true);
			if (!includesAny(cooldownInput, ['s', 'm', 'h', 'd'])) {
				if (cooldownInput.split(' ').length == 1) { //- is the input just a single number
					cooldownInput += 's' //? convert it to seconds for ease of use
				}
				else if (cooldownInput.split(' ').length > 1) {
					await interaction.reply({
						embeds: [validateEmbed(new EmbedBuilder({
							title: `Invalid Cooldown Input: \`${cooldownInput}\``,
							description: [
								`This cooldown input is invalid.`,
								`The cooldown input should be seperated with spaces for each time frame entered.`,
								`Each time frame should end in any of these letters:`,
								`\`s\` = \`seconds\``,
								`\`m\` = \`minutes\``,
								`\`h\` = \`hours\``,
								`\`d\` = \`days\``,
								``,
								`**Examples**:`,
								`\`8s 69m 28h 1d\` = \`2d 05:09:08\``,
								`\`600s\` = \`0d 00:10:00\``
							].join('\n'),
							color: hexToBit(ColorTheme.embeds.notice)
						}))],
						ephemeral: true
					});

					return `Invalid cooldown input`;
				}
			}
			
			const cooldown = new PeriodOfTime(cooldownInput);

			const role = interaction.guild.roles.cache.find(r => r.id == roleId);
			if (!role) {
				throw new Error(`Unable to find role (${roleId})`);
			}
			else {
				const botMember = interaction.guild.members.cache.get(client.user!.id);
				if (!botMember?.roles.highest.position || botMember?.roles.highest.position < role.position) {
					await interaction.reply({
						embeds: [validateEmbed(new EmbedBuilder({
							title: 'Unable to add role',
							description: [
								`My highest role (<@&${botMember?.roles.highest.id}>)`,
								`is positioned below the role you tried to add (<@&${role.id}>)`,
								`I can not manage roles that are placed above my own.\n`,
								`If you still like to add this role to this list,`,
								`you have to raise my highest role (<@&${botMember?.roles.highest.id}>)`,
								`above the role you want to add (<@&${role.id}>) or vise versa.`,
							].join('\n'),
							color: hexToBit(ColorTheme.embeds.notice)
						}))],
						ephemeral: true
					});

					return `Selected role is above my highest role`
				}
			}

			const res = await Mentionable.add(interaction.guild?.id, roleId as string, {
				cooldown: cooldown.time,
				lastUsed: -1
			})

			if (res) {
				// thisConsole.log(`[fg=green]${interaction.guild.name}[/>] Added new mentionable ${roleId}: ${res}`)
	
				await role.setMentionable(true, 'RoleMentionCooldown - Registered'); //? set the role to mentionable so its able to be used
				await interaction.reply({
					embeds: [validateEmbed(new EmbedBuilder({
						title: "Registered New Role Cooldown",
						description: [
							`**Note:** If I dont have permission to view a channel,`,
							`I will also not be able to detect the usage of these roles.`,
							`Make sure to add my role to any channel that you want to monitor for role usage.`,
						].join('\n'),
						fields: [
							{name: 'role', value: `<@&${roleId}>`, inline: true},
							{name: 'cooldown', value: `\`${cooldown.toString()}\``, inline: true},
							{name: '\u200B', value: `\u200B`, inline: true},
						],
						color: hexToBit(ColorTheme.embeds.reply),
					}))],
					ephemeral: !GeneralData.development
				});
			} else {
				throw new Error(`"${interaction.guild.name}" Attempted to add new mentionable (${roleId}) and was unsuccessfull`)
			}

			return true;
		},
		async removeRole(interaction: ChatInputCommandInteraction) {
			if (!interaction.guild) {
				throw new Error(`Interaction did not contain guild`)
			}
			
			const roleId = interaction.options.get('role', true).value;
			const mentionable = await Mentionable.get(interaction.guild.id, roleId as string);
			
			if (mentionable === undefined) {
				await interaction.reply({
					embeds: [validateEmbed(new EmbedBuilder({
						description: `<@&${roleId}> is not included in the mention cooldown list.`,
						color: hexToBit(ColorTheme.embeds.notice)
					}))],
					ephemeral: true
				});
				return 'Role not present in list';
			}

			const role = interaction.guild.roles.cache.find(r => r.id == roleId);
			if (!role) {
				throw new Error(`Unable to find role (${roleId})`);
			}

			const res = await Mentionable.remove(interaction.guild?.id, roleId as string)

			if (res) {
				thisConsole.log(`[fg=green]${interaction.guild.name}[/>] Removed mentionable ${roleId}: ${res}`)
				
				await role.setMentionable(false, 'RoleMentionCooldown - Removed'); //? set the role to mentionable so its able to be used
				await interaction.reply({
					embeds: [validateEmbed(new EmbedBuilder({
						description: `Successfully removed <@&${roleId}> from the list.\nDisabled the ability to mention <@&${roleId}> for everyone.`,
						color: hexToBit(ColorTheme.embeds.reply)
					}))],
					ephemeral: true
				});
			} else {
				throw new Error(`"${interaction.guild.name}" Attempted to remove mentionable (${roleId}) and was unsuccessfull`)
			}

			return true
		},
	},
}
