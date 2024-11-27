import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder
} from "discord.js"
import { ColorTheme, GeneralData } from "../../data"
import { hexToBit } from "../../utils"
import { validateEmbed } from "../../utils/embedUtils"

export default {
	command: {
		data: new SlashCommandBuilder()
			.setName("ping")
			.setDescription("Replies with latency stats"),
		async execute(interaction: ChatInputCommandInteraction) {
			const commandPing = (GeneralData.development) ? interaction.createdTimestamp - Date.now() : Date.now() - interaction.createdTimestamp
			const apiPing = interaction.client.ws.ping

			await interaction.reply({
				embeds: [validateEmbed(new EmbedBuilder({
					title: "Pong!",
					description: `Command Latency: \`${commandPing}ms\`\nAPI Latency: \`${apiPing}ms\``,
					color: hexToBit(ColorTheme.embeds.reply)
				}))],
				ephemeral: true
			})

			return `${commandPing}ms | ${apiPing}ms`
		},
	}
}
