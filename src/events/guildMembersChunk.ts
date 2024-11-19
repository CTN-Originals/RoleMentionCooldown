import { Events, GuildMember, Guild } from "discord.js";
import { eventConsole } from ".";
import { client } from "..";



export default {
	name: Events.GuildMembersChunk,
	once: false,

	async execute(members: GuildMember[], guild: Guild, chunk: any) {
		// eventConsole.logDefault({members, chunk})

		// if (guild.id === process.env.DEV_GUILD_ID) {
		// 	client.guilds.cache.get(process.env.DEV_GUILD_ID)?.members
		// }
	},
}