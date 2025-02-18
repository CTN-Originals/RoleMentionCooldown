import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder, InteractionContextType } from 'discord.js';

import { ColorTheme } from '../../data';
import type { IButtonCollection, ISelectMenuCollection } from '../../handlers/commandBuilder';
import { BaseButtonCollection, BaseEmbedCollection, BaseSelectMenuCollection, CommandInteractionData } from '../../handlers/commandBuilder';
import { hexToBit } from '../../utils';
import { validateEmbed } from '../../utils/embedUtils';


class ButtonCollection extends BaseButtonCollection implements IButtonCollection<ButtonCollection> {}
class SelectMenuCollection extends BaseSelectMenuCollection implements ISelectMenuCollection<SelectMenuCollection> {}
class EmbedCollection extends BaseEmbedCollection {
	public pingDisplay(commandPing: number, apiPing: number) {
		return new EmbedBuilder({
			title:       'Pong!',
			description: `Command Latency: \`${commandPing}ms\`\nAPI Latency: \`${apiPing}ms\``,
			color:       hexToBit(ColorTheme.embeds.reply)
		});
	}
}

const command = new CommandInteractionData<ButtonCollection, SelectMenuCollection, EmbedCollection>({
	command: {
		content: {
			name:        'ping',
			description: 'Replies with latency stats',
			contexts:    [InteractionContextType.Guild, InteractionContextType.BotDM],
		},
		execute: async function (interaction: ChatInputCommandInteraction) {
			const commandPing = Date.now() - interaction.createdTimestamp;
			const apiPing = interaction.client.ws.ping;

			await interaction.reply({
				embeds: [validateEmbed(command.embeds.pingDisplay(commandPing, apiPing))],
				flags:  [((!GeneralData.development) ? MessageFlags.Ephemeral : MessageFlags.SuppressNotifications)]
			});
			
			return `${commandPing}ms | ${apiPing}ms`;
		},
	},
	buttons:     new ButtonCollection(),
	selectMenus: new SelectMenuCollection(),
	embeds:      new EmbedCollection()
});

export default command;
