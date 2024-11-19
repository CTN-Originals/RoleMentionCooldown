import { BaseChannel, Client, Collection, Guild, GuildMember, REST, User } from "discord.js"


export const devEnvironment = {
	clientId: process.env.DEV_CLIENT_ID as string,
	guildId: process.env.DEV_GUILD_ID as string,
	channelId: process.env.DEV_TEST_CHANNEL_ID as string,
	userId: process.env.DEV_TEST_USER_ID as string,

	client: undefined as Client|undefined,
	guild: undefined as Guild|undefined,
	user: undefined as User|undefined,
	member: undefined as GuildMember|undefined,
	channel: undefined as BaseChannel|undefined,

	memberList: new Collection() as Collection<string, GuildMember>,
	restCommands: undefined as {id: string, name: string, type: number, guild_id: string}[]|undefined,
}

export default {
	development: true,
	production: false,
	
	logging: {
		streamSafe: false, //? If true, the custom console will filter out any dangerouse info
		interaction: {
			enabled: true,
			verbose: true,
		}
	}
}