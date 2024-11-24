import { Color } from "better-console-utilities";
import { Client, Collection, Guild, GuildMember, TextChannel, User } from "discord.js"
import { KeyValuePair } from "../@types";


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
	export const development = false;
	export const production = true;
	
	export const logging = {
		streamSafe: false, //? If true, the custom console will filter out any dangerouse info
		interaction: {
			enabled: true,
			verbose: true,
		}
	}
}

export namespace ColorTheme {
	export const brand: KeyValuePair<Color> = {
		primary: new Color('#3fb7e9'),
		secondary: new Color('#2a55e2'),
		accent: new Color('#92d5e8'),
		background: new Color('#090909')
	}

	export const embeds = {
		info: new Color('#0077ff'),
		reply: new Color('#00ff73'),
		notice: new Color('#ffbb00'),
		error: new Color('#ff4800'),
	}
}