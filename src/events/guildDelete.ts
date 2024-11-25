import { Events, Guild } from "discord.js"
import { eventConsole } from "."
import { GuildConfig } from "../data/orm/guildConfig"
import { Mentionable } from "../data/orm/mentionables"

export default {
	name: Events.GuildDelete,
	once: false,

	async execute(guild: Guild) {
		eventConsole.log(`\nOn: [fg=green]${this.name}[/>]\nName: ${guild.name}\nID: ${guild.id}\nMembers: ${guild.memberCount}\n`)

		await Mentionable.onGuildDelete(guild)
		delete Mentionable.mentionablesCache[guild.id] //? Delete the guilds cache

		await GuildConfig.onGuildDelete(guild)
	},
}
