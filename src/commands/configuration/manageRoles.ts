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
				EmitError(new Error(`Interaction did not contain a guild`))
				return;
			}
			const role = interaction.options.get('role', true).value;
			const cooldown = new PeriodOfTime(interaction.options.get('cooldown', true).value as string)

			const res = await Mentionable.add(interaction.guild?.id, role as string, {
				cooldown: cooldown.time,
				lastUsed: -1
			})

			if (res) {
				thisConsole.log(`[fg=green]${interaction.guild.name}[/>] Added new mentionable ${role}: ${res}`)
	
				await interaction.reply({
					embeds: [new EmbedBuilder({
						title: "Registered New Role Cooldown",
						fields: [
							{name: 'role', value: `<@&${role}>`, inline: true},
							{name: 'cooldown', value: `\`${cooldown.toString()}\``, inline: true},
						]
					})],
					ephemeral: !generalData.development
				});
			} else {
				EmitError(new Error(`[fg=green]${interaction.guild.name}[/>] Attempted to add new mentionable ${role} and was unsuccessfull`))
			}
		},
		async removeRole(interaction: ChatInputCommandInteraction) {},
	},
}