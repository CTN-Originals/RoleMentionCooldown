import { 
	BaseInteraction,
	CommandInteraction,
	Client,
	InteractionType,
	ComponentType,
	Events,
	TextChannel,
	CommandInteractionOption,
	ChatInputCommandInteraction,
} from 'discord.js';

import { ConsoleInstance } from 'better-console-utilities';

import { EmitError, eventConsole } from '.';
import { errorConsole } from '..';
import { IInteractionTypeData, getHoistedOptions, getInteractionType } from '../utils/interactionUtils';
import generalData from '../data';
import { ErrorObject } from '../handlers/errorHandler';

const thisConsole = new ConsoleInstance();

export default {
	name: Events.InteractionCreate,
	once: false,

    /** @param {CommandInteraction} interaction The command interaction */
	async execute(interaction: BaseInteraction) {
		// thisConsole.logDefault(interaction);
		const interactionType = getInteractionType(interaction);
		
		if (!interactionType.commandKey || interactionType.type == InteractionType.Ping) {
			errorConsole.log(`No Command Key || PING Interaction Received`);
			thisConsole.logDefault(interaction);
			return;
		}
		await this.executeInteraction(interaction, interactionType.commandKey);
	},

	async executeInteraction(interaction: BaseInteraction, nameKey: string) {
		let response: any = null;
		try {
			const command = interaction.client.commands.get(interaction[nameKey]);
			response = await command.execute(interaction);
		} catch (err) {
			const errorObject: ErrorObject = await EmitError(err as Error, interaction); //?? does "as Error" fuck this? ever??

			let content = `There was an error while executing this interaction`
			if (generalData.development) {
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
		if (generalData.logging.interaction.enabled) {
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
				logFields.commandOptions = hoistedOptions.map(option => `[fg=dd8000]${option.name}[/>]:${option.value}`).join(' [st=dim,bold]|[/>] ');
			}
			if (interaction.values && interaction.values.length > 0) {
				logFields.commandValues = `[ ${interaction.values.join('[st=dim,bold], [/>]')} ]`
			}


			const logMessage: string[] = [];
			logMessage.push([
				`[fg=0080ff]${logFields.commandType}[/>]: [fg=00cc00 st=bold]${logFields.commandName}[/>]`,
				`${(logFields.subCommandGroup) ? `[st=dim]>[/>] [fg=00cc66]${logFields.subCommandGroup}[/>]` : ''}`,
				`${(logFields.subCommand) ? `[st=dim]>[/>] [fg=00cc66]${logFields.subCommand}[/>]` : ''}`
			].join(' '));

			if (logFields.commandOptions) logMessage.push(`[fg=0080ff]options[/>]: ${logFields.commandOptions}`);
			if (logFields.commandValues) logMessage.push(`[fg=0080ff]values[/>]: ${logFields.commandValues}`);

			logMessage.push(`[fg=0080ff]user[/>]: [fg=cyan]${logFields.userName}[/>] (${logFields.userId})`);
			logMessage.push(`[fg=0080ff]channel[/>]: [fg=ad1b70]${logFields.channelName}[/>] (${logFields.channelId})`);

			if (logFields.response) {
				logMessage.push(`[fg=0080ff]Response[/>]:`);
				thisConsole.log('\n' + logMessage.join('\n'), response);
			}
			else {
				thisConsole.log('\n' + logMessage.join('\n') + '\n'); '#ad1b70'
			}
		}
	}
};