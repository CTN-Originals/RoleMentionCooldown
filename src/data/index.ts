import { Client, Collection, Guild, GuildMember, TextChannel, User } from "discord.js"


export namespace DevEnvironment {
	export const clientId = process.env.DEV_CLIENT_ID as string;
	export const guildId = process.env.DEV_GUILD_ID as string;
	export const channelId = process.env.DEV_TEST_CHANNEL_ID as string;
	export const userId = process.env.DEV_TEST_USER_ID as string;

	export let client = undefined as Client|undefined;
	export let guild = undefined as Guild|undefined;
	export let user = undefined as User|undefined;
	export let member = undefined as GuildMember|undefined;
	export let channel = undefined as TextChannel|undefined;

	export let memberList = new Collection() as Collection<string, GuildMember>;
	export let restCommands = undefined as {id: string, name: string, type: number, guild_id: string}[]|undefined;
}

export namespace GeneralData {
	export const development = true;
	export const production = false;
	
	export const logging = {
		streamSafe: false, //? If true, the custom console will filter out any dangerouse info
		interaction: {
			enabled: true,
			verbose: true,
		}
	}
}