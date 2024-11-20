import { Events, CommandInteraction, Guild } from "discord.js";
import { cons, errorConsole } from "..";
import { ErrorObject } from "../handlers/errorHandler";

import mentionableData from "../data/orm/schemas/mentionableData";
import { Mentionable } from "../data/orm/mentionables";

export default {
	name: Events.GuildDelete,
	once: false,

	async execute(guild: Guild) {
		cons.log(`\nOn: [fg=green]${this.name}[/>]\nName: ${guild.name}\nID: ${guild.id}\nMembers: ${guild.memberCount}\n`)
	},
}