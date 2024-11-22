import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { ColorTheme, GeneralData } from '../../data'
import { hexToBit, PeriodOfTime } from "../../utils";
import { Mentionable } from "../../data/orm/mentionables";
import { EmitError } from "../../events";
import { ConsoleInstance } from "better-console-utilities";
import { validateEmbed } from "../../utils/embedUtils";
import { client } from "../..";

const thisConsole = new ConsoleInstance();

export default {
	command: {
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
					.setDescription('The cooldown to apply to the mention once its used (seperate with spaces). 8s 28h 1d = 2d 04:00:08')
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

			return false;
		},
		async addRole(interaction: ChatInputCommandInteraction) {
			if (!interaction.guild) {
				throw new Error(`Interaction did not contain guild`)
			}
			const roleId = interaction.options.get('role', true).value;
			const cooldown = new PeriodOfTime(interaction.options.get('cooldown', true).value as string);

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
				thisConsole.log(`[fg=green]${interaction.guild.name}[/>] Added new mentionable ${roleId}: ${res}`)
	
				await role.setMentionable(true, 'RoleMentionCooldown - Registered'); //? set the role to mentionable so its able to be used
				await interaction.reply({
					embeds: [validateEmbed(new EmbedBuilder({
						title: "Registered New Role Cooldown",
						fields: [
							{name: 'role', value: `<@&${roleId}>`, inline: true},
							{name: 'cooldown', value: `\`${cooldown.toString()}\``, inline: true},
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
					content: `<@&${roleId}> is not included in the mention cooldown list.`,
					ephemeral: true
				});
				return false;
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
					content: `Successfully removed <@&${roleId}> from the list.\n<@&${roleId}> is now set to not being mentionable.`,
					ephemeral: true
				});
			} else {
				throw new Error(`"${interaction.guild.name}" Attempted to remove mentionable (${roleId}) and was unsuccessfull`)
			}

			return true
		},
	},
}