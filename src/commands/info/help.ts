import { EmbedBuilder, SlashCommandBuilder, ChatInputCommandInteraction, APIEmbedField, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, APISelectMenuOption, ActionRowBuilder, ActionRow, ActionRowComponent, StringSelectMenuInteraction, InteractionContextType, ComponentType } from "discord.js";
import { BaseButtonCollection, BaseEmbedCollection, BaseSelectMenuCollection, CommandInteractionData, IButtonCollection, ISelectMenuCollection, ISelectMenuCollectionField } from "../../handlers/commandBuilder";

import { getExecutableCommands, hexToBit } from "../../utils";
import { ColorTheme, GeneralData } from "../../data";
import { validateEmbed } from "../../utils/embedUtils";



class ButtonCollection extends BaseButtonCollection implements IButtonCollection<ButtonCollection> {}
class SelectMenuCollection extends BaseSelectMenuCollection implements ISelectMenuCollection<SelectMenuCollection> {
	public helpSection: ISelectMenuCollectionField<ComponentType.StringSelect> = {
		data: {
			type: ComponentType.StringSelect,
			customId: 'help_command-select',
		},
		execute: async function (interaction: StringSelectMenuInteraction) {
			await interaction.deferUpdate();
				
			const value = interaction.values[0]; //? there can only be one
			const commandInfo = getExecutableCommands();

			if (value === 'all') {
				await interaction.editReply({
					embeds: [command.embeds.getHelpEmbed(commandInfo)]
				});
				return true;
			}

			const cmd = commandInfo.find(c => c.command === value.replaceAll('_', ' '));
			const fields: {name: string, value: string}[] = [];

			for (const opt of cmd?.options!) {
				let value = [
					`${opt.description}`,
					`Required: \`${opt.required}\``
				];

				if (opt.min_length) {
					value.push(`Minimum Length: \`${opt.min_length}\``);
				}
				if (opt.max_length) {
					value.push(`Minimum Length: \`${opt.max_length}\``);
				}

				fields.push({
					name: opt.name,
					value: value.join('\n')
				})
			}
			
			await interaction.editReply({
				embeds: [validateEmbed(new EmbedBuilder({
					title: `/${cmd?.command}`,
					description: cmd?.description,
					fields: fields,
					color: hexToBit(ColorTheme.embeds.info)
				}))]
			})
			return true;
		},
	}
}
class EmbedCollection extends BaseEmbedCollection {
	public getHelpEmbed(commandInfo?: ReturnType<typeof getExecutableCommands>) {
		if (commandInfo == undefined || commandInfo == null) {
			commandInfo = getExecutableCommands();
		}
	
		const fields: APIEmbedField[] = []
	
		for (const cmd of commandInfo) {
			let options = '';
			for (const opt of cmd.options.sort((a,b) => (a.required ? 1 : 0) - (b.required ? 1 : 0))) {
				options += `  ${(opt.required) ? `<\`${opt.name}\`>` : `[\`${opt.name}\`]`}`
			}
			fields.push({
				name: `/${cmd.command}${(cmd.options.length > 0) ? options : ''}`,
				value: cmd.description
			})
		}
	
		return validateEmbed(new EmbedBuilder({
			title: `${GeneralData.appName} - Help`,
			description: `Feel free to join my official support [discord server](${GeneralData.supportServerInvite}) for more help and support.`,
			fields: fields,
			color: hexToBit(ColorTheme.embeds.info),
			footer: { text: `< > = required  |  [ ] = optional` },
			url: `${GeneralData.supportServerInvite}`
		}));
	}
}

const command = new CommandInteractionData<ButtonCollection, SelectMenuCollection, EmbedCollection>({
	command: {
		data: {
			name: 'help',
			description: 'Displays an embed with all commands and their description',
			contexts: [InteractionContextType.Guild],
		},
		execute: async function (interaction: ChatInputCommandInteraction) {
			const commandInfo = getExecutableCommands();
			const commandSelect = new StringSelectMenuBuilder({
				custom_id: `help_command-select`,
				max_values: 1,
				placeholder: 'Select any command for more info',
				options: [
					{
						label: 'All',
						description: 'A list of all commands',
						value: 'all',
					},
					...commandInfo.map(c => ({
						label: `/${c.command}`,
						description: `${c.description}`,
						value: `${c.command.replaceAll(' ', '_')}`,
					}))
				]
			})

			const row: any = new ActionRowBuilder().addComponents(commandSelect);

			await interaction.reply({
				embeds: [command.embeds.getHelpEmbed(commandInfo)],
				components: [row],
				ephemeral: !(GeneralData.development)
			});
			
			return true;
		},
	},
	buttons: new ButtonCollection(),
	selectMenus: new SelectMenuCollection(),
	embeds: new EmbedCollection()
})

export default command;

// const old = {
// 	command: {
// 		data: new SlashCommandBuilder()
// 			.setName("help")
// 			.setDescription("Displays an embed with all commands and their description"),
// 		async execute(interaction: ChatInputCommandInteraction) {
// 			//! this currently also includes any message component that has both a name and description
// 			const commandInfo = getExecutableCommands();
// 			const commandSelect = new StringSelectMenuBuilder({
// 				custom_id: `help_command-select`,
// 				max_values: 1,
// 				placeholder: 'Select any command for more info',
// 				options: [
// 					{
// 						label: 'All',
// 						description: 'A list of all commands',
// 						value: 'all',
// 					},
// 					...commandInfo.map(c => ({
// 						label: `/${c.command}`,
// 						description: `${c.description}`,
// 						value: `${c.command.replaceAll(' ', '_')}`,
// 					}))
// 				]
// 			})

// 			const row: any = new ActionRowBuilder().addComponents(commandSelect);

// 			await interaction.reply({
// 				embeds: [getHelpEmbed(commandInfo)],
// 				components: [row],
// 				ephemeral: !(GeneralData.development)
// 			});
			
// 			return true;
// 		},
// 	},
// 	selectMenus: [
// 		{
// 			data: new SlashCommandBuilder().setName('help_command-select'),
// 			async execute(interaction: StringSelectMenuInteraction) {
// 				await interaction.deferUpdate();
				
// 				const value = interaction.values[0]; //? there can only be one
// 				const commandInfo = getExecutableCommands();

// 				if (value === 'all') {
// 					await interaction.editReply({
// 						embeds: [getHelpEmbed(commandInfo)]
// 					});
// 					return true;
// 				}

// 				const command = commandInfo.find(c => c.command === value.replaceAll('_', ' '));
// 				const fields: {name: string, value: string}[] = [];

// 				for (const opt of command?.options!) {
// 					let value = [
// 						`${opt.description}`,
// 						`Required: \`${opt.required}\``
// 					];

// 					if (opt.min_length) {
// 						value.push(`Minimum Length: \`${opt.min_length}\``);
// 					}
// 					if (opt.max_length) {
// 						value.push(`Minimum Length: \`${opt.max_length}\``);
// 					}

// 					fields.push({
// 						name: opt.name,
// 						value: value.join('\n')
// 					})
// 				}
				
// 				await interaction.editReply({
// 					embeds: [validateEmbed(new EmbedBuilder({
// 						title: `/${command?.command}`,
// 						description: command?.description,
// 						fields: fields,
// 						color: hexToBit(ColorTheme.embeds.info)
// 					}))]
// 				})
// 				return true;
// 			}
// 		}
// 	]
// }

// function getHelpEmbed(commandInfo?: ReturnType<typeof getExecutableCommands>) {
// 	if (commandInfo == undefined || commandInfo == null) {
// 		commandInfo = getExecutableCommands();
// 	}

// 	const fields: APIEmbedField[] = []

// 	for (const cmd of commandInfo) {
// 		let options = '';
// 		for (const opt of cmd.options.sort((a,b) => (a.required ? 1 : 0) - (b.required ? 1 : 0))) {
// 			options += `  ${(opt.required) ? `<\`${opt.name}\`>` : `[\`${opt.name}\`]`}`
// 		}
// 		fields.push({
// 			name: `/${cmd.command}${(cmd.options.length > 0) ? options : ''}`,
// 			value: cmd.description
// 		})
// 	}

// 	return validateEmbed(new EmbedBuilder({
// 		title: `${GeneralData.appName} - Help`,
// 		description: `Feel free to join my official support [discord server](${GeneralData.supportServerInvite}) for more help and support.`,
// 		fields: fields,
// 		color: hexToBit(ColorTheme.embeds.info),
// 		footer: { text: `< > = required  |  [ ] = optional` },
// 		url: `${GeneralData.supportServerInvite}`
// 	}));
// }
