import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";

import generalData from '../../data'
import { PeriodOfTime } from "../../utils";

export default {
	command: {
		data: new SlashCommandBuilder()
			.setName("register-role")
			.setDescription("Register a new mention role and configure its behaviour")
			.addRoleOption(option => option
				.setName('role')
				.setDescription('The role to be registered')
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('cooldown')
				.setDescription('The cooldown to apply to the mention once its used (seperate with spaces). 8s 28h 1d = 2d 04:00:08')
				.setRequired(true)
				.setMinLength(2)
			),
		async execute(interaction: CommandInteraction) {
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
		}
	},
}