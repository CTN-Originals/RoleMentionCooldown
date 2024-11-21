import { EmbedBuilder, SlashCommandBuilder, CommandInteraction, Guild } from "discord.js";
import { validateEmbed } from "../../utils/embedUtils";

export default {
	command: {
		data: new SlashCommandBuilder()
			.setName("list")
			.setDescription("Displays a list of role mention cooldowns"),
		async execute(interaction: CommandInteraction) {
			if (!interaction.guild) {
				throw new Error(`Interaction did not contain a guild`);
			}
			
			await interaction.reply({
				embeds: [await getListEmbed(interaction.guild)]
			})
			return true;
		},

	},
}

export async function getListEmbed(guild: Guild): Promise<EmbedBuilder> {
	return validateEmbed(new EmbedBuilder({
		title: 'Role Mention Cooldowns',
		timestamp: Date.now()
	}))
}