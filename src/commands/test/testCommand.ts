import { ChatInputCommandInteraction, InteractionContextType, ButtonInteraction, EmbedBuilder, PermissionFlagsBits, ApplicationCommandOptionType, ComponentType, StringSelectMenuInteraction, ActionRow, ActionRowBuilder } from "discord.js";

import { hexToBit } from "../../utils";
import { ColorTheme, GeneralData } from "../../data";
import { validateEmbed } from "../../utils/embedUtils";
import { BaseButtonCollection, BaseEmbedCollection, BaseSelectMenuCollection, CommandInteractionData, IButtonCollection, IButtonCollectionField, ISelectMenuCollection, ISelectMenuCollectionField } from "../../handlers/commandBuilder";
import { IStringSelectComponentObject } from "../../handlers/commandBuilder/components";


class ButtonCollection extends BaseButtonCollection implements IButtonCollection<ButtonCollection> {
	public butt: IButtonCollectionField = {
		content: {
			customId: 'butt',
			label: 'BUTT'
		},
		execute: (interaction: ButtonInteraction) => {
			return true;
		}
	}
}
class SelectMenuCollection extends BaseSelectMenuCollection implements ISelectMenuCollection<SelectMenuCollection> {
	public str: ISelectMenuCollectionField<ComponentType.StringSelect> = {
		content: {
			type: ComponentType.StringSelect,
			customId: 'ping-str',
		},
		execute: (interaction: StringSelectMenuInteraction) => {
			return true;
		}
	}
}
class EmbedCollection extends BaseEmbedCollection {
	public availableInDevelopent() {
		return new EmbedBuilder({
			description: 'This command is only available during development',
			color: hexToBit(ColorTheme.embeds.notice)
		});
	}

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
		content: {
			name: 'test',
			description: 'This command is for testing only',
			contexts: [InteractionContextType.Guild],
			requiredPermissions: ['CreateGuildExpressions', 'ManageChannels', 'ManageWebhooks'],
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'str',
					description: 'awdugsaef kj'
				}
			]
		},
		execute: async function (interaction: ChatInputCommandInteraction) {
			if (!GeneralData.development) {
				await interaction.reply({
					embeds: [validateEmbed(command.embeds.availableInDevelopent())],
					ephemeral: true
				})
			}
			const commandPing = Date.now() - interaction.createdTimestamp;
			const apiPing = interaction.client.ws.ping;

			const row: any = new ActionRowBuilder().setComponents(command.buildButtons())

			await interaction.reply({
				embeds: [validateEmbed(command.embeds.pingDisplay(commandPing, apiPing))],
				components: [row],
				ephemeral: true,
			});
			
			return `${commandPing}ms | ${apiPing}ms`;
		},
	},
	buttons: new ButtonCollection(),
	selectMenus: new SelectMenuCollection(),
	embeds: new EmbedCollection()
});

export default command;
