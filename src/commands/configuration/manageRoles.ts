import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";

import generalData from '../../data'
import { PeriodOfTime } from "../../utils";

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
			const role = interaction.options.get('role', true).value;
			const cooldown = new PeriodOfTime(interaction.options.get('cooldown', true).value as string)

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
		},
		async removeRole(interaction: ChatInputCommandInteraction) {},
	},
}