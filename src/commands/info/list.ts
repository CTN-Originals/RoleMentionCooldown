import { EmbedBuilder, Guild, ChatInputCommandInteraction, InteractionContextType } from "discord.js";
import { BaseButtonCollection, BaseEmbedCollection, BaseSelectMenuCollection, CommandInteractionData, IButtonCollection, ISelectMenuCollection } from "../../handlers/commandBuilder";

import { Mentionable } from "../../data/orm/mentionables";
import { ColorTheme, GeneralData } from '../../data'
import { validateEmbed } from "../../utils/embedUtils";
import { getTimeDisplay, getTimestamp, hexToBit } from "../../utils";

export type ListType = 'all'|'cooldowns';


class ButtonCollection extends BaseButtonCollection implements IButtonCollection<ButtonCollection> {}
class SelectMenuCollection extends BaseSelectMenuCollection implements ISelectMenuCollection<SelectMenuCollection> {}
class EmbedCollection extends BaseEmbedCollection {
	public async getCurrentCooldownsEmbed(guild: Guild, type: ListType): Promise<EmbedBuilder> {
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
			
		return new EmbedBuilder({
			title: 'Role Mention Cooldowns',
			fields: [
				{name: `Role`, value: stats.map(s => `<@&${s[0]}>`).join('\n'), inline: true},
				{name: `Cooldown`, value: stats.map(s => s[1]).join('\n'), inline: true},
			],
			color: hexToBit(ColorTheme.embeds.info.asHex),
		})
	}
}

const command = new CommandInteractionData<ButtonCollection, SelectMenuCollection, EmbedCollection>({
	command: {
		data: {
			name: 'list',
			description: 'Displays a list of mentionables',
			contexts: [InteractionContextType.Guild],
			subcommands: [
				{
					name: 'all',
					description: 'Display a list of all registered mentionable roles along with their cooldown',
				},
				{
					name: 'cooldowns',
					description: 'Display a list of all roles currently on cooldown along with their remaining cooldown time',
				}
			]
		},
		execute: async function (interaction: ChatInputCommandInteraction) {
			if (!interaction.guild) {
				throw new Error(`Interaction did not contain a guild`);
			}

			const subCommand = interaction.options.getSubcommand() as ListType;
			
			await interaction.reply({
				embeds: [validateEmbed(await command.embeds.getCurrentCooldownsEmbed(interaction.guild, subCommand))],
				ephemeral: !GeneralData.development
			})
			return true;
		},
	},
	buttons: new ButtonCollection(),
	selectMenus: new SelectMenuCollection(),
	embeds: new EmbedCollection()
});

export default command;
