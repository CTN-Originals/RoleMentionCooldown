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
	export const production: boolean = (process.env.PRODUCTION === 'true');
	export const development: boolean = (process.env.DEVELOPMENT === 'true');
	
	export const appName: string = process.env.APP_NAME!;
	export const supportServerInvite: string = process.env.SUPPORT_SERVER_INVITE!;
	
	export const logging = {
		streamSafe: false, //? If true, the custom console will filter out any dangerouse info like tokens
		interaction: {
			enabled: true,
			verbose: true,
		}
	}
}

export namespace ColorTheme {
	export const brand = {
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

	export const colors = {
		blue: 	new Color('#0080ff'),
		green: 	new Color('#00cc00'),
		cyan: 	new Color('#00ffff'),
		yellow: new Color('#dfbc22'),
		orange: new Color('#dd8000'),
		purple: new Color('#ad1b70'),
		grey: 	new Color('#aaaaaa'),
	}
}
