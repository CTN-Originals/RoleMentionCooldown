import { EmbedBuilder, SlashCommandBuilder, CommandInteraction, MessageFlags } from "discord.js";

export default {
	command: {
		data: new SlashCommandBuilder()
			.setName("ping")
			.setDescription("Replies with Pong! [Test Command]")
			.addStringOption(option => 
				option.setName('string')
				.setDescription('Some description')
				.setRequired(false)
				.addChoices(
					{name: 'Hello', value: 'hello'},
					{name: 'World', value: 'world'},
				)
			)
			.addUserOption(option =>
				option.setName('user')
				.setDescription('Some user')
				.setRequired(false)
			),
		async execute(interaction: CommandInteraction) {
			// const nonMember = await interaction.guild?.members.fetch('713586058107414558'); //? cause an error
			// console.log(nonMember?.displayName);

			await interaction.reply({
				content: "Pong! <@479936093047750659>",
				embeds: [new EmbedBuilder({
					title: "Pong!",
					description: "ping pong!",
				})],
				ephemeral: true
			});

			// await interaction.reply('<@568245462293938196> is the real npc here...')

			await interaction.followUp({
				content: "poing",
			});

			await interaction.editReply({
				content: "uped ping down pong",
				embeds: [],
				// embeds: [new EmbedBuilder({
				// 	title: "Pong!",
				// 	description: "uped ping down pong!",
				// })],
			});

			// console.log(interaction.token);
			
			return true;
		},
	}
}