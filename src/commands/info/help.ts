import { EmbedBuilder, ChatInputCommandInteraction, APIEmbedField, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuInteraction, InteractionContextType, ComponentType, Client } from "discord.js";
import { AnyDiscordCommandOption, BaseButtonCollection, BaseEmbedCollection, BaseMethodCollection, BaseSelectMenuCollection, CommandInteractionData, IBaseInteractionType, IButtonCollection, ISelectMenuCollection, ISelectMenuCollectionField } from "../../handlers/commandBuilder";

import { hexToBit } from "../../utils";
import { ColorTheme, GeneralData } from "../../data";
import { validateEmbed } from "../../utils/embedUtils";
import { client } from "../..";

type CommandInfo = {
	name: string;
	description: string;
	options: AnyDiscordCommandOption[];
};



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
			const commandInfo = command.methods.getExecutableCommands();

			if (value === 'all') {
				await interaction.editReply({
					embeds: [command.embeds.getHelpEmbed(commandInfo)]
				});
				return true;
			}

			const cmd = commandInfo.find(c => c.name === value.replaceAll('_', ' '));
			const fields: {name: string, value: string}[] = [];

			for (const opt of cmd?.options!) {
				let value = [
					`${opt.description}`,
					`Required: \`${opt.required}\``
				];

				if (Object.keys(opt).includes('minLength')) {
					value.push(`Minimum Length: \`${opt['minLength']}\``);
				}
				if (Object.keys(opt).includes('maxLength')) {
					value.push(`Minimum Length: \`${opt['maxLength']}\``);
				}

				fields.push({
					name: opt.name,
					value: value.join('\n')
				})
			}
			
			await interaction.editReply({
				embeds: [validateEmbed(new EmbedBuilder({
					title: `/${cmd?.name}`,
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
	public getHelpEmbed(commandInfo?: ReturnType<typeof command.methods.getExecutableCommands>) {
		if (commandInfo == undefined || commandInfo == null) {
			commandInfo = command.methods.getExecutableCommands();
		}
	
		const fields: APIEmbedField[] = []
	
		for (const cmd of commandInfo) {
			let options = '';
			for (const opt of cmd.options.sort((a,b) => (a.required ? 1 : 0) - (b.required ? 1 : 0))) {
				options += `  ${(opt.required) ? `<\`${opt.name}\`>` : `[\`${opt.name}\`]`}`
			}
			fields.push({
				name: `/${cmd.name}${(cmd.options.length > 0) ? options : ''}`,
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
class MethodCollection extends BaseMethodCollection {
	//? this is not my best function... but it works and i dont wanna do more recursion stuff so f it
	public getExecutableCommands(commands: Client['commands'] = client.commands) {	
		const commandList: CommandInfo[] = []

		function addCommandInfo(data: RequiredFields<Partial<CommandInfo>, 'name' | 'description'>, prefix?: string) {
			commandList.push({
				name: `${(prefix !== undefined) ? prefix + ' ' : ''}${data.name}`,
				description: data.description,
				options: data.options ?? []
			});
		}

		for (const [key, value] of commands.entries()) {
			if ((value.interactionType as IBaseInteractionType) === IBaseInteractionType.ContextMenu) { continue; }

			if ((!value.data.subcommands || value.data.subcommands.length === 0) && (!value.data.subcommandGroups || value.data.subcommandGroups.length === 0)) {
				addCommandInfo(value.data);
			}
			else {
				if (value.data.subcommands && value.data.subcommands.length > 0) {
					for (const sub of value.data.subcommands) {
						addCommandInfo(sub, value.data.name)
					}
				}

				if (value.data.subcommandGroups && value.data.subcommandGroups.length > 0) {
					for (const group of value.data.subcommandGroups) {
						for (const sub of group.subcommands!) {
							addCommandInfo(sub, `${value.data.name} ${group.name}`)
						}
					}
				}
			}
		}

		return commandList;
	}
}

const command = new CommandInteractionData<ButtonCollection, SelectMenuCollection, EmbedCollection, MethodCollection>({
	command: {
		data: {
			name: 'help',
			description: 'Displays an embed with all commands and their description',
			contexts: [InteractionContextType.Guild],
		},
		execute: async function (interaction: ChatInputCommandInteraction) {
			const commandInfo = command.methods.getExecutableCommands();
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
						label: `/${c.name}`,
						description: `${c.description}`,
						value: `${c.name.replaceAll(' ', '_')}`,
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
	embeds: new EmbedCollection(),
	methods: new MethodCollection()
});

export default command;
