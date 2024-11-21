import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";

import generalData from '../../data'
import { PeriodOfTime } from "../../utils";
import { Mentionable } from "../../data/orm/mentionables";
import { EmitError } from "../../events";
import { ConsoleInstance } from "better-console-utilities";

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
				case 'add': this.addRole(interaction); break;
				case 'remove': this.removeRole(interaction); break;
				default: break;
			}
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

			const res = await Mentionable.add(interaction.guild?.id, roleId as string, {
				cooldown: cooldown.time,
				lastUsed: -1
			})

			if (res) {
				thisConsole.log(`[fg=green]${interaction.guild.name}[/>] Added new mentionable ${roleId}: ${res}`)
	
				await role.setMentionable(true, 'RoleMentionCooldown - Registered'); //? set the role to mentionable so its able to be used
				await interaction.reply({
					embeds: [new EmbedBuilder({
						title: "Registered New Role Cooldown",
						fields: [
							{name: 'role', value: `<@&${roleId}>`, inline: true},
							{name: 'cooldown', value: `\`${cooldown.toString()}\``, inline: true},
						]
					})],
					ephemeral: !generalData.development
				});

			} else {
				throw new Error(`[fg=green]${interaction.guild.name}[/>] Attempted to add new mentionable ${roleId} and was unsuccessfull`)
			}
		},
		async removeRole(interaction: ChatInputCommandInteraction) {
			if (!interaction.guild) {
				throw new Error(`Interaction did not contain guild`)
			}
			const roleId = interaction.options.get('role', true).value;

			const role = interaction.guild.roles.cache.find(r => r.id == roleId);
			if (!role) {
				throw new Error(`Unable to find role (${roleId})`);
			}

			const res = await Mentionable.remove(interaction.guild?.id, roleId as string)

			if (res) {
				thisConsole.log(`[fg=green]${interaction.guild.name}[/>] Removed mentionable ${roleId}: ${res}`)
				
				await role.setMentionable(false, 'RoleMentionCooldown - Removed'); //? set the role to mentionable so its able to be used
				await interaction.reply({
					content: `Successfully removed mention from the list.\nRole is now set to not being mentionable.`,
					ephemeral: !generalData.development
				});
			} else {
				throw new Error(`[fg=green]${interaction.guild.name}[/>] Attempted to remove mentionable ${roleId} and was unsuccessfull`)
			}
		},
	},
}