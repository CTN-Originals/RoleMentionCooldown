import { Color } from 'better-console-utilities';
import type { Client, Guild, GuildMember, TextChannel, User } from 'discord.js';
import { Collection } from 'discord.js';

export class DevEnvironment {
	public static clientId = process.env.DEV_CLIENT_ID as string;
	public static guildId = process.env.DEV_GUILD_ID as string;
	public static channelId = process.env.DEV_TEST_CHANNEL_ID as string;
	public static userId = process.env.DEV_TEST_USER_ID as string;

	public static client = undefined as Client|undefined;
	public static guild = undefined as Guild|undefined;
	public static user = undefined as User|undefined;
	public static member = undefined as GuildMember|undefined;
	public static channel = undefined as TextChannel|undefined;

	public static memberList = new Collection() as Collection<string, GuildMember>;
	public static restCommands = undefined as {id: string, name: string, type: number, guild_id: string}[]|undefined;
}

export class GeneralData {
	public static production: boolean = 	(process.env.PRODUCTION === 'true');
	public static beta: boolean = 			(process.env.BETA === 'true');
	public static development: boolean = 	(process.env.DEVELOPMENT === 'true');
	
	public static appName: string = process.env.APP_NAME!;
	public static supportServerInvite: string = process.env.SUPPORT_SERVER_INVITE!;
	
	public static logging = {
		// streamSafe: false, //? If true, the custom console will filter out any dangerouse info like tokens
		startup: { //? Logs the registering of commands/events and connection to the database
			enabled:  !this.development,
			commands: true,
			events:   true,
			database: true
		},
		interaction: {
			enabled: true,
			verbose: true,
		},
	};
}

export class ColorTheme {
	public static brand = {
	  primary:    new Color('#3fb7e9'),
	  secondary:  new Color('#2a55e2'),
	  accent:     new Color('#92d5e8'),
	  background: new Color('#090909')
	};

	public static embeds = {
	  info:   new Color('#0077ff'),
	  reply:  new Color('#00ff73'),
	  notice: new Color('#ffbb00'),
	  error:  new Color('#ff4800'),
	};

	public static colors = {
	  blue:   new Color('#0080ff'),
	  green:  new Color('#00cc00'),
	  cyan:   new Color('#00ffff'),
	  yellow: new Color('#dfbc22'),
	  orange: new Color('#dd8000'),
	  purple: new Color('#ad1b70'),
	  red:    new Color('#ad1b1b'),
	  grey:   new Color('#aaaaaa'),
	};
}
