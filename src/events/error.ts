import {
	ChannelType,
	ChatInputCommandInteraction,
	Colors,
	CommandInteraction,
	CommandInteractionOption,
	EmbedBuilder,
	Events
} from 'discord.js'
import 'dotenv/config'
import { client, errorConsole, logWebhook } from '..'
import { ErrorObject } from '../handlers/errorHandler'
import { validateEmbed } from '../utils/embedUtils'
import {
	getHoistedOptions,
	getInteractionType
} from '../utils/interactionUtils'

export default {
	name: Events.Error,
	once: false,

	async execute(error: Error, interaction?: CommandInteraction | ChatInputCommandInteraction): Promise<ErrorObject> {
		const errorObject = new ErrorObject(error)

		errorConsole.log(errorObject.formatError({
			colorize: true
		}))

		if (interaction) this.outputLog(errorObject, interaction)

		return errorObject
	},

	outputLog(errorObject: ErrorObject, interaction: CommandInteraction | ChatInputCommandInteraction) {
		const interactionType = getInteractionType(interaction)

		const descriptionLines = [`### ${errorObject.errorMessage}`]
		if (interaction[interactionType.commandKey!] !== undefined) {
			let commandName = `\`${interaction[interactionType.commandKey!] as string}\``
			if (interaction instanceof ChatInputCommandInteraction) {
				const subCommandGroup = interaction.options.getSubcommandGroup(false)
				const subCommand = interaction.options.getSubcommand(false)
				commandName += (subCommandGroup) ? ` > \`${subCommandGroup}\`` : ''
				commandName += (subCommand) ? ` > \`${subCommand}\`` : ''
			}
			descriptionLines.push(`**Command**: ${commandName}`)
		}

		if (interaction.options && interaction.options.data.length > 0) {
			const hoistedOptions = getHoistedOptions((interaction as CommandInteraction).options.data as CommandInteractionOption[])
			descriptionLines.push(`**Options**: ${hoistedOptions.map(option => `${option.name}:\`${option.value}\``).join(', ')}`)
		}
		if (interaction['values'] && interaction['values'].length > 0) {
			descriptionLines.push(`**Values**: [ \`${interaction['values'].join('\`, \`')}\` ]`)
		}

		descriptionLines.push(`**Type**: \`${interactionType.display}\``)
		descriptionLines.push(`**Guild Name**: \`${interaction.guild?.name ?? 'None'}\``)
		descriptionLines.push(`**Interaction ID**: \`${interaction.id}\``)
		if (interaction.command) descriptionLines.push(`**Command ID**: \`${interaction.command?.id}\``)
		descriptionLines.push(`**Guild ID**: \`${interaction.guildId ?? 'None'}\``)
		descriptionLines.push('```ts\n' + errorObject.formatStack({
			shortenPaths: true,
			ignoreInternals: true,
			excludeDirectories: (errorObject.formattedError.length >= 1000) ? ['node_modules'] : [],
			colorize: false,
			inlineSeperator: '\n',
			linePrefix: '//'
		}) + '\n```')

		const embed = new EmbedBuilder({
			title: errorObject.errorType,
			description: descriptionLines.join('\n'),
			fields: [
				// {name: '\u200b', value: '\u200b', inline: true},
				{
					name: '-- Channel --',
					value: [
						`**Name**: <#${interaction.channelId}>`,
						`**Type**: ${ChannelType[interaction.channel?.type ?? 0]}`,
						`**ID**: ${interaction.channelId}`,
					].join('\n'),
					inline: true,
				},
				{
					name: '-- User --',
					value: [
						`**Name**: <@${interaction.user.id}>`,
						`**Is Member**: ${(interaction.member) ? 'true' : 'false'}`,
						`**ID**: ${interaction.user.id}`,
					].join('\n'),
					inline: true,
				},
			],
			color: client.user?.accentColor ?? Colors.Red,
			timestamp: interaction.createdTimestamp,
		})

		//TODO Add user config options to add webhooks for logging these errors
		logWebhook.send({
			username: `${client.user!.username} Error`,
			avatarURL: client.user!.displayAvatarURL(),
			embeds: [validateEmbed(embed)]
		})
	}
}
