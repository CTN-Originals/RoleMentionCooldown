import { 
	CommandInteraction,
	InteractionType,
	Events,
	CommandInteractionOption,
	ChatInputCommandInteraction,
	Interaction,
	EmbedBuilder,
	ContextMenuCommandInteraction,
	PermissionsBitField,
} from 'discord.js';

import { ConsoleInstance } from 'better-console-utilities';

import { BaseButtonCollection,
	BaseEmbedCollection,
	BaseMethodCollection,
	BaseSelectMenuCollection,
	CommandInteractionData,
	IButtonCollectionField,
	ICommandObjectContent,
	IContextMenuObjectContent,
	ISelectMenuCollectionField
} from '../handlers/commandBuilder';
import { EmitError } from '.';
import { IInteractionTypeData, getHoistedOptions, getInteractionType } from '../utils/interactionUtils';
import { ColorTheme, GeneralData } from '../data';
import { errorConsole, ErrorObject } from '../handlers/errorHandler';
import { client } from '..';
import { validateEmbed } from '../utils/embedUtils';
import { getUniqueItems, hexToBit, removeDuplicates } from '../utils';

const thisConsole = new ConsoleInstance();

function lackingPermissionEmbed(interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction, neededPerms: PermissionsBitField) {
	const selfMember = interaction.guild!.members.me!;
	const missingRole: string[] = selfMember.permissions.missing(neededPerms);
	const missingChannel: string[] = [];
	
	if (interaction.channel?.isTextBased() && !interaction.channel.isDMBased()) {
		missingChannel.push(...selfMember.permissionsIn(interaction.channel).missing(neededPerms));
	}

	const missingPerms = removeDuplicates([...missingRole, ...missingChannel]);
	
	const embed = new EmbedBuilder({
		title: `Lacking Permission`,
		description: [
			`To be able to perform this action, I need the following permission(s):`,
			`**${missingPerms.join('**\n**')}**`,
		].join('\n'),
		color: hexToBit(ColorTheme.embeds.notice)
	});

	return embed;
}

export default {
	name: Events.InteractionCreate,
	once: false,

	async execute(interaction: Interaction) {
		const interactionType = getInteractionType(interaction);
		
		if (!interactionType.commandKey || interactionType.type == InteractionType.Ping) {
			errorConsole.log(`No Command Key || PING Interaction Received`);
			thisConsole.logDefault(interaction);
			return;
		}
		await this.executeInteraction(interaction, interactionType.commandKey);
	},

	async executeInteraction(interaction: Interaction, nameKey: string) {
		let response: any = null;

		const getInteractionData = () => {
			if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
				return interaction.client.commands.get(interaction[nameKey]);
			}
			else if (interaction.isButton() || interaction.isAnySelectMenu()) {
				const componentType = (interaction.isButton()) ? 'button' : 'selectMenu';
				const parent = client[componentType + 's'].get(interaction.customId);
				if (!parent) {
					throw new Error(`Unknown component interaction: "${interaction.customId}"`);
				}
				
				const command = client.commands.get(parent);
				if (!command) {
					throw new Error(`Component origin unknown: "${parent}" > "${interaction.customId}"`);
				}

				const componentCollection: BaseButtonCollection | BaseSelectMenuCollection = command.collection[componentType + 's'];

				for (const key in componentCollection) {
					const component: IButtonCollectionField | ISelectMenuCollectionField = componentCollection[key];
					if (component.content.customId === interaction.customId) {
						return component;
					}
				}
			}

			return null;
		}

		try {
			let interactionObject = getInteractionData();
			let interactionData: ICommandObjectContent | IContextMenuObjectContent | IButtonCollectionField | ISelectMenuCollectionField;

			if (!interactionObject) {
				throw new Error(`Unknown interaction: "${interaction[nameKey]}"`);
			}

			if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
				interactionData = (interactionObject as CommandInteractionData<BaseButtonCollection, BaseSelectMenuCollection, BaseEmbedCollection, BaseMethodCollection>).command;
				//TODO check required permissions
				
				if (interaction.inGuild()) {
					const data = interactionData.data;
					const perms = data.requiredPermissionBitField;
					const selfMember = interaction.guild!.members.me;

					if (!selfMember?.permissions.has(perms)) {
						await interaction.reply({
							content: `I am lacking the required permission(s) to perform this action.`,
							embeds: [validateEmbed(lackingPermissionEmbed(interaction, perms))],
							ephemeral: !GeneralData.development
						});

						response = `Lacking the required permission(s) to perform this action`
					}
				}
			}
			else {
				interactionData = (interactionObject as IButtonCollectionField | ISelectMenuCollectionField);
			}

			if (response === null) {
				response = await interactionData.execute(interaction as any);
			}
			
		} catch (err) {
			const errorObject: ErrorObject = await EmitError(err as Error, interaction);

			let content = `There was an error while executing this interaction`
			if (GeneralData.development) {
				content += '\n```ts\n' + errorObject.formatError({shortenPaths: true, colorize: false}) + '\n```';
			}

			const replyContent = {
				content: content,
				ephemeral: true,
			};
			
			if (interaction.isRepliable()) {
				if (!interaction.replied) { //?? does this need "&& !interaction.deferred"?
					await interaction.reply(replyContent).catch(EmitError);
				}
				else await interaction.followUp(replyContent).catch(EmitError);
			}

			response = err;
		}

		this.outputLog(interaction, response);
	},

	outputLog(interaction, response = null) {
		if (GeneralData.logging.interaction.enabled) {
			const interactionType: IInteractionTypeData = getInteractionType(interaction)
			const logFields = {
				commandName: '',
				subCommand: '',
				subCommandGroup: '',
				commandOptions: '',
				commandValues: '',
				commandType: interactionType.display,
				channelName: interaction.channel.name,
				channelId: interaction.channelId,
				userId: interaction.user.id,
				userName: interaction.user.username,
				response: (response) ? response : null,
			};

			if (interaction[interactionType.commandKey!] !== undefined) {
				logFields.commandName = interaction[interactionType.commandKey!] as string;
				
				if (interaction instanceof ChatInputCommandInteraction) {
					const subCommandGroup = interaction.options.getSubcommandGroup(false);
					const subCommand = interaction.options.getSubcommand(false);
					logFields.subCommandGroup += (subCommandGroup) ? subCommandGroup : '';
					logFields.subCommand += (subCommand) ? subCommand : '';
				}
			}
			
			if (interaction.options?.data && interaction.options.data.length > 0) {
				const hoistedOptions = getHoistedOptions((interaction as CommandInteraction).options.data as CommandInteractionOption[]);
				logFields.commandOptions = hoistedOptions.map(option => `[fg=${ColorTheme.colors.orange.asHex}]${option.name}[/>]:${option.value}`).join(' [st=dim,bold]|[/>] ');
			}
			if (interaction.values && interaction.values.length > 0) {
				logFields.commandValues = `[ ${interaction.values.join('[st=dim,bold], [/>]')} ]`
			}


			const logMessage: string[] = [];
			logMessage.push([
				`[fg=${ColorTheme.colors.blue.asHex}]${logFields.commandType}[/>]: [fg=${ColorTheme.colors.green.asHex} st=bold]${logFields.commandName}[/>]`,
				`${(logFields.subCommandGroup) ? `[st=dim]>[/>] [fg=${ColorTheme.colors.green.asHex}]${logFields.subCommandGroup}[/>]` : ''}`,
				`${(logFields.subCommand) ? `[st=dim]>[/>] [fg=${ColorTheme.colors.green.asHex}]${logFields.subCommand}[/>]` : ''}`
			].join(' '));

			if (logFields.commandOptions) logMessage.push(`[fg=${ColorTheme.colors.blue.asHex}]options[/>]: ${logFields.commandOptions}`);
			if (logFields.commandValues) logMessage.push(`[fg=${ColorTheme.colors.blue.asHex}]values[/>]: ${logFields.commandValues}`);

			logMessage.push(`[fg=${ColorTheme.colors.blue.asHex}]guild[/>]: [fg=${ColorTheme.colors.yellow.asHex}]${interaction.guild.name}[/>] (${interaction.guild.id})`);
			logMessage.push(`[fg=${ColorTheme.colors.blue.asHex}]user[/>]: [fg=${ColorTheme.colors.cyan.asHex}]${logFields.userName}[/>] (${logFields.userId})`);
			logMessage.push(`[fg=${ColorTheme.colors.blue.asHex}]channel[/>]: [fg=${ColorTheme.colors.purple.asHex}]${logFields.channelName}[/>] (${logFields.channelId})`);

			if (logFields.response !== '') {
				logMessage.push(`[fg=${ColorTheme.colors.blue.asHex}]Response[/>]:`);
				thisConsole.log('\n' + logMessage.join('\n'), response);
			}
			else {
				thisConsole.log('\n' + logMessage.join('\n') + '\n');
			}
		}
	}
};