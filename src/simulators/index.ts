import {
	APIGuildMember, APIInteractionGuildMember,
	BaseChannel, BaseGuild, BaseInteraction,
	ChannelSelectMenuInteraction,
	Client,
	Events,
	Guild, GuildBasedChannel, GuildChannel,
	GuildMember, GuildMemberFlags,
	MentionableSelectMenuInteraction,
	SnowflakeUtil,
	StringSelectMenuInteraction,
	User, UserFlagsBitField,
	UserSelectMenuInteraction
} from "discord.js";
// import { InteractionResponses } from "discord.js/src/structures/interfaces/InteractionResponses";
import { RawInteractionData } from "discord.js/typings/rawDataTypes";

import { cons } from "..";
import { EmitError, customEvents } from "../events";
import { TODO } from "../@types";
import { devEnvironment } from "../data";
import { ErrorObject } from "../handlers/errorHandler";

export interface ISimBaseInteraction {
	client?: Client,
	user?: User,
	type?: number,
	guild?: BaseGuild|null,
	member?: GuildMember|APIInteractionGuildMember|null
	channel?: BaseChannel|null,
}

export const defaultBaseInteractionArgs: ISimBaseInteraction = {
	client: devEnvironment.client,
	user: devEnvironment.user,
	type: 2,
	guild: devEnvironment.guild,
	member: devEnvironment.member,
	channel: devEnvironment.channel,
}
export async function init() {
	defaultBaseInteractionArgs.client = devEnvironment.client as Client;
	defaultBaseInteractionArgs.user = devEnvironment.user as User;
	defaultBaseInteractionArgs.type = 2;
	defaultBaseInteractionArgs.guild = devEnvironment.guild as Guild;
	defaultBaseInteractionArgs.member = devEnvironment.member as GuildMember|APIInteractionGuildMember;
	defaultBaseInteractionArgs.channel = devEnvironment.channel as BaseChannel;

	cons.logDefault('Simulator ready', defaultBaseInteractionArgs);
}

export class SimBaseInteraction extends BaseInteraction {
	constructor(client: Client, user: User);
	constructor(args?: Partial<ISimBaseInteraction>);
	constructor(args?: Partial<ISimBaseInteraction>|Client, user?: User) {
		if (!defaultBaseInteractionArgs.client) init();

		if (!args) args = defaultBaseInteractionArgs;
		else if (args instanceof Client) {
			args = defaultBaseInteractionArgs;
			args.client = args as Client<boolean>;
			args.user = user;
		}
		else {
			for (const [key, value] of Object.entries(defaultBaseInteractionArgs)) {
				if (args[key as keyof ISimBaseInteraction] === undefined) {
					(args as any)[key] = value;
				}
			}
		}

		const client = args.client as Client<true> || devEnvironment.client;
		const snowflake = SnowflakeUtil.generate()
		const data: RawInteractionData = {
			id: snowflake.toString() as RawInteractionData['id'], //? This is a unique id for the interaction
			application_id: client.application?.id as RawInteractionData['application_id'], //? This is the bot's application id
			user: args.user as RawInteractionData['user'], //? This is the user that triggered the interaction
			type: args.type as RawInteractionData['type'], //? 2 is a command interaction type
			// token: process.env.TOKEN as RawInteractionData['token'], //? This is a token for the interaction
			token: 'mock-token' as RawInteractionData['token'], //? This is a token for the interaction
		} as RawInteractionData;

		if (args.guild) {
			data.guild_id = args.guild?.id;
			if (!args.member) args.member = defaultBaseInteractionArgs.member as APIInteractionGuildMember;
			
			data.member = {
				user: args.user as unknown as APIGuildMember['user'],
				roles: args.member.roles ?? [] as APIGuildMember['roles'],
				premium_since: null,
				permissions: '0',
				pending: args.member.pending,
				nick: (args.member instanceof GuildMember) ? args.member.nickname : args.member.nick, //?? this is stupid... why is it either nickname or nick?
				mute: false,
				joined_at: new Date(SnowflakeUtil.timestampFrom(args.user?.id!)).toISOString() as APIGuildMember['joined_at'],
				is_pending: false,
				deaf: false,
				avatar: args.member.user.avatar as APIGuildMember['avatar'],
				flags: args.member.user.flags as UserFlagsBitField|GuildMemberFlags,
			} as APIInteractionGuildMember;

			if (!args.channel) {
				args.channel = defaultBaseInteractionArgs.channel as BaseChannel;
			}
		}
		data.channel = args.channel as RawInteractionData['channel'];
		
		super(client as Client<true>, data as RawInteractionData);

		if (this.member) {
			/* //? This is a hack to avoid an error when the member is updated and discordjs calls member._roles.slice()
			! clone._roles = this._roles.slice(); TypeError: this._roles.slice is not a function */
			this.member['_roles']['slice'] = () => {return this.member!['roles']};
		}
	}

	public simulate(): any {
		return this.client.emit(Events.InteractionCreate as string, this);
	}
}