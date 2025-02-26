 
import {
	AnySelectMenuInteraction,
	APIApplicationCommandGuildInteraction,
	BaseInteraction,
	ChatInputCommandInteraction,
	CommandInteraction,
	CommandInteractionOption,
	ContextMenuCommandInteraction,
	EmbedBuilder,
	Events,
	Interaction,
	InteractionReplyOptions,
	InteractionType,
	MessageFlags,
	PermissionsBitField
} from 'discord.js';

import { ConsoleInstance } from 'better-console-utilities';

import { EmitError } from '.';
import { client } from '..';
import { ColorTheme, GeneralData } from '../data';
import type {
	BaseButtonCollection,
	BaseEmbedCollection,
	BaseMethodCollection,
	BaseSelectMenuCollection,
	CommandInteractionData,
	IButtonCollectionField,
	ICommandObjectContent,
	IContextMenuObjectContent,
	ISelectMenuCollectionField,
	TLogEnvironment,
	TLogLevel
} from '../handlers/commandBuilder';
import {
	LOG_ENVIRONMENT,
	LOG_LEVEL
} from '../handlers/commandBuilder';
import { ComponentValueStorage } from '../handlers/componentValueStorage';
import type { ErrorObject } from '../handlers/errorHandler';
import { errorConsole } from '../handlers/errorHandler';
import { hexToBit, removeDuplicates } from '../utils';
import { validateEmbed } from '../utils/embedUtils';
import type { IInteractionTypeData } from '../utils/interactionUtils';
import { getHoistedOptions, getInteractionType } from '../utils/interactionUtils';

const thisConsole = new ConsoleInstance();

function lackingPermissionEmbed(interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction, neededPerms: PermissionsBitField): EmbedBuilder {
	const selfMember = interaction.guild!.members.me!;
	const missingRole: string[] = selfMember.permissions.missing(neededPerms);
	const missingChannel: string[] = [];
	
	if (interaction.channel?.isTextBased() && !interaction.channel.isDMBased()) {
		missingChannel.push(...selfMember.permissionsIn(interaction.channel).missing(neededPerms));
	}

	const missingPerms = removeDuplicates([...missingRole, ...missingChannel]);
	
	const embed = new EmbedBuilder({
		title:       'Lacking Permission',
		description: [
			'To be able to perform this action, I need the following permission(s):',
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
			errorConsole.log('No Command Key || PING Interaction Received');
			thisConsole.logDefault(interaction);
			return;
		}
		await this.executeInteraction(interaction, interactionType.commandKey);
	},

	async executeInteraction(interaction: Interaction, nameKey: string) {
		let response: null | string | boolean = null;

		const getInteractionData = (): CommandInteractionData<BaseButtonCollection, BaseSelectMenuCollection, BaseEmbedCollection, BaseMethodCollection> | IButtonCollectionField | ISelectMenuCollectionField | null | undefined => {
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
		};

		let commandErrored = false;
		let interactionData: ICommandObjectContent | IContextMenuObjectContent | IButtonCollectionField | ISelectMenuCollectionField | undefined;
		let interactionObject: CommandInteractionData<BaseButtonCollection, BaseSelectMenuCollection, BaseEmbedCollection, BaseMethodCollection> | IButtonCollectionField | ISelectMenuCollectionField | null | undefined;
		
		try {
			interactionObject = getInteractionData();

			if (!interactionObject) {
				throw new Error(`Unknown interaction: "${interaction[nameKey]}"`);
			}

			if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
				interactionData = (interactionObject as CommandInteractionData<BaseButtonCollection, BaseSelectMenuCollection, BaseEmbedCollection, BaseMethodCollection>).command;
				
				if (interaction.inGuild()) {
					const data = interactionData.data;
					const perms = data.requiredPermissionBitField;
					const selfMember = interaction.guild!.members.me;

					if (!selfMember?.permissions.has(perms)) {
						await interaction.reply({
							content: 'I am lacking the required permission(s) to perform this action.',
							embeds:  [validateEmbed(lackingPermissionEmbed(interaction, perms))],
							flags:   [((!GeneralData.development) ? MessageFlags.Ephemeral : MessageFlags.SuppressNotifications)]
						});

						response = 'Lacking the required permission(s) to perform this action';
					}
				}
			}
			else {
				interactionData = (interactionObject as IButtonCollectionField | ISelectMenuCollectionField);

				if (!interaction.isAutocomplete() && !interaction.isModalSubmit()) {
					if (!ComponentValueStorage.storageIncludesMessage(interaction.message.id)) {
						ComponentValueStorage.registerMessage(interaction.message.id, interaction);
					}
					if (interaction.isAnySelectMenu()) {
						ComponentValueStorage.setValue(interaction.message.id, interaction.customId, interaction.values);
					}
				}
			}

			if (response === null) {
				response = await interactionData.execute(interaction as never);
			}
		} catch (err) {
			commandErrored = true;
			const errorObject: ErrorObject = await EmitError((err instanceof Error) ? err : new Error(err as string), interaction);

			let content = 'There was an error while executing this interaction';
			if (GeneralData.development) {
				content += '\n```ts\n' + errorObject.formatError({shortenPaths: true, colorize: false}) + '\n```';
			}

			const replyContent: InteractionReplyOptions = {
				content: content,
				flags:   [((!GeneralData.development) ? MessageFlags.Ephemeral : MessageFlags.SuppressNotifications)],
			};
			
			if (interaction.isRepliable()) {
				if (!interaction.replied) { //?? does this need "&& !interaction.deferred"?
					await interaction.reply(replyContent).catch(EmitError);
				}
				else await interaction.followUp(replyContent).catch(EmitError);
			}

			response = err as string;
		}

		const logLevel = 
			(interactionObject && interactionObject.logLevel !== undefined) ? 
			  interactionObject.logLevel : LOG_LEVEL.ALWAYS;

		const logEnvironment = 
			(interactionObject && interactionObject.logEnvironment !== undefined) ? 
			  interactionObject.logEnvironment : LOG_ENVIRONMENT.ALL;

		const commandState: TLogLevel = (commandErrored === true) ? LOG_LEVEL.ERROR : (response === true) ? LOG_LEVEL.SUCCESS : LOG_LEVEL.FAIL;
		const commandEnvironment: TLogEnvironment = (GeneralData.production) ? LOG_ENVIRONMENT.PRODUCTION : (GeneralData.beta) ? LOG_ENVIRONMENT.BETA : LOG_ENVIRONMENT.DEVELOPMENT; 

		const logLevelState = (
			logLevel !== LOG_LEVEL.NEVER &&
			logLevel === LOG_LEVEL.ALWAYS ||
			(logLevel & commandState) === commandState
		);
		const logEnvironmentState = (
			logEnvironment === LOG_ENVIRONMENT.ALL ||
			(logEnvironment & commandEnvironment) === commandEnvironment
		);

		if (GeneralData.logging.interaction.enabled && logLevelState && logEnvironmentState) {
			this.outputLog(interaction, response as string);
		}
	},

	outputLog(interaction: BaseInteraction, response: string | null = null) {
		const interactionType: IInteractionTypeData = getInteractionType(interaction);
		const logFields = {
			commandName:     '',
			subCommand:      '',
			subCommandGroup: '',
			commandOptions:  '',
			commandValues:   '',
			commandType:     interactionType.display,
			channelName:     (interaction as unknown as APIApplicationCommandGuildInteraction).channel?.name,
			channelId:       interaction.channelId,
			userId:          interaction.user.id,
			userName:        interaction.user.username,
			response:        (response) ? response : null,
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
		
		if ((interaction as ChatInputCommandInteraction).options?.data && (interaction as ChatInputCommandInteraction).options.data.length > 0) {
			const hoistedOptions = getHoistedOptions((interaction as CommandInteraction).options.data as CommandInteractionOption[]);
			logFields.commandOptions = hoistedOptions.map(option => `[fg=${ColorTheme.colors.orange.asHex}]${option.name}[/>]:${option.value}`).join(' [st=dim,bold]|[/>] ');
		}
		if ((interaction as AnySelectMenuInteraction).values && (interaction as AnySelectMenuInteraction).values.length > 0) {
			logFields.commandValues = `[ ${(interaction as AnySelectMenuInteraction).values.join('[st=dim,bold], [/>]')} ]`;
		}


		const logMessage: string[] = [];
		logMessage.push([
			`[fg=${ColorTheme.colors.blue.asHex}]${logFields.commandType}[/>]: [fg=${ColorTheme.colors.green.asHex} st=bold]${logFields.commandName}[/>]`,
			`${(logFields.subCommandGroup) ? `[st=dim]>[/>] [fg=${ColorTheme.colors.green.asHex}]${logFields.subCommandGroup}[/>]` : ''}`,
			`${(logFields.subCommand) ? `[st=dim]>[/>] [fg=${ColorTheme.colors.green.asHex}]${logFields.subCommand}[/>]` : ''}`
		].join(' '));

		if (logFields.commandOptions) logMessage.push(`[fg=${ColorTheme.colors.blue.asHex}]options[/>]: ${logFields.commandOptions}`);
		if (logFields.commandValues) logMessage.push(`[fg=${ColorTheme.colors.blue.asHex}]values[/>]: ${logFields.commandValues}`);

		logMessage.push(`[fg=${ColorTheme.colors.blue.asHex}]user[/>]: [fg=${ColorTheme.colors.cyan.asHex}]${logFields.userName}[/>] (${logFields.userId})`);
		if (interaction.guild) {
			logMessage.push(`[fg=${ColorTheme.colors.blue.asHex}]guild[/>]: [fg=${ColorTheme.colors.yellow.asHex}]${interaction.guild.name}[/>] (${interaction.guild.id})`);
			logMessage.push(`[fg=${ColorTheme.colors.blue.asHex}]channel[/>]: [fg=${ColorTheme.colors.purple.asHex}]${logFields.channelName}[/>] (${logFields.channelId})`);
		} else {
			logMessage.push(`[fg=${ColorTheme.colors.blue.asHex}]guild[/>]: [fg=${ColorTheme.colors.yellow.asHex}]USER_DM[/>]`);
		}

		if (logFields.response !== '') {
			logMessage.push(`[fg=${ColorTheme.colors.blue.asHex}]Response[/>]:`);
			if (typeof response === 'object') {
				thisConsole.log('\n' + logMessage.join('\n'), response);
			} else {
				thisConsole.log('\n' + logMessage.join('\n') + ' ' + response);
			}
		}
		else {
			thisConsole.log('\n' + logMessage.join('\n') + '\n');
		}
	}
};