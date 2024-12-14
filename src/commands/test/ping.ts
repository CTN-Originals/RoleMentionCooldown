import { ChatInputCommandInteraction, InteractionContextType, ButtonInteraction, EmbedBuilder, PermissionFlagsBits } from "discord.js";

import { hexToBit } from "../../utils";
import { ColorTheme } from "../../data";
import { validateEmbed } from "../../utils/embedUtils";
import { BaseButtonCollection, BaseEmbedCollection, BaseSelectMenuCollection, CommandInteractionData, IButtonCollection, ISelectMenuCollection } from "../../handlers/commandBuilder";


class ButtonCollection extends BaseButtonCollection implements IButtonCollection<ButtonCollection> {}
class SelectMenuCollection extends BaseSelectMenuCollection implements ISelectMenuCollection<SelectMenuCollection> {}
class EmbedCollection extends BaseEmbedCollection {
	public pingDisplay(commandPing: number, apiPing: number) {
		return new EmbedBuilder({
			title: "Pong!",
			description: `Command Latency: \`${commandPing}ms\`\nAPI Latency: \`${apiPing}ms\``,
			color: hexToBit(ColorTheme.embeds.reply)
		})
	}
}

const command = new CommandInteractionData<ButtonCollection, SelectMenuCollection, EmbedCollection>({
	command: {
		data: {
			name: 'ping',
			description: 'Replies with latency stats',
			contexts: [InteractionContextType.Guild],
		},
		execute: async function (interaction: ChatInputCommandInteraction) {
			const commandPing = Date.now() - interaction.createdTimestamp;
			const apiPing = interaction.client.ws.ping;

			await interaction.reply({
				embeds: [validateEmbed(command.embeds.pingDisplay(commandPing, apiPing))],
				ephemeral: true
			});
			
			return `${commandPing}ms | ${apiPing}ms`;
		},
	},
	buttons: new ButtonCollection(),
	selectMenus: new SelectMenuCollection(),
	embeds: new EmbedCollection()
});

export default command;
