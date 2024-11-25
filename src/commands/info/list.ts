import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	Guild,
	SlashCommandBuilder
} from "discord.js"
import { ColorTheme, GeneralData } from '../../data'
import { Mentionable } from "../../data/orm/mentionables"
import { getTimeDisplay, getTimestamp, hexToBit } from "../../utils"
import { validateEmbed } from "../../utils/embedUtils"

export type ListType = 'all'|'cooldowns';

export default {
	command: {
		data: new SlashCommandBuilder()
			.setName("list")
			.setDescription("Displays a list of mentionables")
			.addSubcommand(sub => sub
				.setName("all" as ListType)
				.setDescription("Display a list of all registered mentionable roles along with their cooldown")
			)
			.addSubcommand(sub => sub
				.setName("cooldowns" as ListType)
				.setDescription("Display a list of all roles currently on cooldown along with their remaining cooldown time")
			),
		async execute(interaction: ChatInputCommandInteraction) {
			if (!interaction.guild) {
				throw new Error(`Interaction did not contain a guild`);
			}

			const subCommand = interaction.options.getSubcommand() as ListType;
			// switch (subCommand) {
			// 	case 'cooldowns': embed = await getCurrentCooldownsEmbed(interaction.guild,); break;
			// 	case 'all': embed = await getCurrentCooldownsEmbed(interaction.guild,); break;
			// 	default: throw new Error(`Invalid subcommand provided: ${subCommand ?? undefined}`);
			// }
			
			await interaction.reply({
				embeds: [validateEmbed(await getCurrentCooldownsEmbed(interaction.guild, subCommand))],
				ephemeral: !GeneralData.development
			})
			return true;
		},

	},
}

export async function getCurrentCooldownsEmbed(guild: Guild, type: ListType): Promise<EmbedBuilder> {
	// let stats: {roleId: string, timeRemaining: number}[] = []
	let stats: [string, string][] = []
	const mentionables = await Mentionable.getAll(guild.id);
	if (!mentionables) {
		throw new Error(`Could not find the mentionables of guild ${guild.id ?? undefined}`)
	}

	for (const roleId in mentionables) {
		switch (type) {
			case 'all': {
				stats.push([
					roleId,
					`\`${getTimeDisplay(mentionables[roleId].cooldown)}\``
				])
			} break;
			case 'cooldowns': {
				if (Mentionable.isOncooldown(mentionables[roleId])) {
					stats.push([
						roleId,
						`<t:${getTimestamp(Date.now() + Mentionable.remainingCooldown(mentionables[roleId]))}:R>`
					])
				}
			} break;
			default: break;
		}
	}

	switch (type) {
		case 'all': 
			stats.sort((a, b) => mentionables[a[0]].cooldown - mentionables[b[0]].cooldown); 
		break;
		case 'cooldowns':
			stats.sort((a, b) => (Date.now() + Mentionable.remainingCooldown(mentionables[a[0]])) - (Date.now() + Mentionable.remainingCooldown(mentionables[b[0]]))); 
		break;
		default: break;
	}

	const fields = [];
	
	return new EmbedBuilder({
		title: 'Role Mention Cooldowns',
		fields: [
			{name: `Role`, value: stats.map(s => `<@&${s[0]}>`).join('\n'), inline: true},
			{name: `Cooldown`, value: stats.map(s => s[1]).join('\n'), inline: true},
		],
		color: hexToBit(ColorTheme.embeds.info.asHex),
	})
}
