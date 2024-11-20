import { Events, Guild } from "discord.js";

import { Mentionable } from "../data/orm/mentionables";
import { eventConsole } from ".";

export default {
	name: Events.GuildDelete,
	once: false,

	async execute(guild: Guild) {
		eventConsole.log(`\nOn: [fg=green]${this.name}[/>]\nName: ${guild.name}\nID: ${guild.id}\nMembers: ${guild.memberCount}\n`)
		Mentionable.onGuildDelete(guild);
	},
}