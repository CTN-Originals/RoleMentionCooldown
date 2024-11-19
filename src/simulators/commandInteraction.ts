import { Events, InteractionReplyOptions, Message, MessageEditOptions, MessageFlags, MessageReplyOptions, Snowflake, TextBasedChannel } from "discord.js";

import { TODO } from "../@types";
import { cons } from "..";
import { devEnvironment } from "../data";
import { EmitError } from "../events";
import { ErrorObject } from "../handlers/errorHandler";

import { ISimBaseInteraction, SimBaseInteraction } from ".";
import { SimInteractionResponses } from "./interactionResponses";

export interface ISimCommandInteraction extends ISimBaseInteraction {
	commandName: string,
}
interface ISimInteractionReplyOptions extends InteractionReplyOptions, Omit<MessageEditOptions, 'flags'> {
	content?: string,
	flags?: InteractionReplyOptions['flags'],
	message?: Message|Snowflake,
}
interface ISimInteractionReplyContent extends MessageReplyOptions {
	// content?: string,
	ephemeral?: boolean,
	// embeds?: EmbedBuilder[],
	// components: BaseMessageOptions['components'],
	// flags?: number[],
	options?: ISimInteractionReplyOptions,
};

export class SimCommandInteraction extends SimBaseInteraction {
	public command: TODO;
	public commandName: string;
	public commandId?: Snowflake;
	public commandType?: number;
	public commandGuildId?: Snowflake;
	public deferred: boolean;
	public replied: boolean;
	public ephemeral?: boolean;
	public options: TODO;
	public webhook: TODO;

	public interaction: TODO; // Interaction<CacheType>;
	// Add the missing properties here

	private _replyMessage: Message|undefined;
	private _followUpMessages: Message[];
	
	constructor(args: ISimCommandInteraction) {
		super(args);

		this.commandName = args.commandName;

		this.deferred = false;
		this.replied = false;
		
		this._followUpMessages = [];

		if (super.inGuild()) {
			this.getGuildCommandData(this.commandName);
		}
	}

	private async getGuildCommandData(name: string) {
		for (const commandData of devEnvironment.restCommands!) {
			if (commandData.name === name) {
				this.command = commandData;
				this.commandId = commandData.id;
				this.commandType = commandData.type;
				this.commandGuildId = commandData.guild_id;

				break;
			}
		}
	}

	public async awaitReply(timeout: number = 5000, interval: number = 100): Promise<Message|null> {return null}
	
	// These are here only for documentation purposes - they are implemented by InteractionResponses
	/* eslint-disable no-empty-function */
	deferReply() {}
	reply() {}
	fetchReply() {}
	editReply() {}
	deleteReply() {}
	followUp() {}
	showModal() {}
	awaitModalSubmit() {}
}

SimInteractionResponses.applyToClass(SimCommandInteraction, ['deferUpdate', 'update']);