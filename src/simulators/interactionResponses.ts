import { Snowflake, Message, MessageEditOptions, MessageFlags, TextBasedChannel, InteractionReplyOptions, MessageReplyOptions, Events, Client, BaseGuildTextChannel } from "discord.js";
import { cons } from "..";
import { ErrorObject } from "../handlers/errorHandler";
import { EmitError } from "../events";

export interface ISimInteractionReplyOptions extends InteractionReplyOptions, Omit<MessageEditOptions, 'flags'> {
	content?: string,
	flags?: InteractionReplyOptions['flags'],
	message?: Message|Snowflake,
}
export interface ISimInteractionReplyContent extends ISimInteractionReplyOptions {
	// content?: string,
	ephemeral?: boolean,
	// embeds?: EmbedBuilder[],
	// components: BaseMessageOptions['components'],
	// flags?: number[],
	options?: ISimInteractionReplyOptions,
};
/** @interface */
export class SimInteractionResponses {
	declare client: Client;
	declare replied: boolean;
	declare deferred: boolean;
	declare ephemeral: boolean;
	declare commandName: string;
	declare options: any;
	declare channel: TextBasedChannel|null;

	declare _replyMessage: Message;
	declare _followUpMessages: Message[];

	static applyToClass(structure, ignore: string[] = []) {
		const props = [
			'awaitReply',
			'validateReply',
			'sendMessage',
			'deferReply',
			'reply',
			'fetchReply',
			'editReply',
			'deleteReply',
			'followUp',
			// 'deferUpdate',
			// 'update',
			// 'showModal',
			// 'awaitModalSubmit',
		];

		for (const prop of props) {
			if (ignore.includes(prop)) continue;
			Object.defineProperty(
				structure.prototype,
				prop,
				Object.getOwnPropertyDescriptor(SimInteractionResponses.prototype, prop) as PropertyDescriptor,
			);
		}
	}

	//#region Custom Methods
		//#region public
		/** Waits for the reply message to be sent.
		 * @param timeout The max amount of time to wait for the reply, defaults to 5 seconds.
		 * @param interval The interval to check for the reply, defaults to 100 milliseconds.
		 * @returns The reply message, or `null` if timed out.
		 */
		public async awaitReply(timeout: number = 5000, interval: number = 100): Promise<Message|null> {
			const msg = this.fetchReply();
			if (msg) return msg;

			let currentWait = 0;
			while (currentWait < timeout) {
				await new Promise(resolve => setTimeout(resolve, interval));
				currentWait += interval;

				const msg = this.fetchReply();
				if (msg) return msg;
			}

			this.client.emit(Events.Error, new Error(`Timed out waiting for the reply message to be sent.`));
			return null;
		}
		//#endregion

		//#region private
		async validateReply(condition: boolean, replyContent: string|ISimInteractionReplyContent): Promise<ISimInteractionReplyContent|ErrorObject> {
			if (!condition) {
				return await EmitError(new Error('Interaction reply conditions were not met'), this);
			}
			this.ephemeral = (typeof replyContent === 'string') ? false : replyContent.ephemeral || false;

			return (typeof replyContent === 'string') ? {
				content: replyContent,
				ephemeral: this.ephemeral,
				embeds: [],
				components: [],
				flags: [],
				options: {},
			} : {
				content: replyContent.content,
				ephemeral: this.ephemeral,
				embeds: replyContent.embeds,
				components: replyContent.components,
				flags: replyContent.flags || [],
				options: replyContent.options || {},
			} as ISimInteractionReplyOptions;
		}

		async sendMessage(content: ISimInteractionReplyContent, target?: BaseGuildTextChannel|Message, update: boolean = true): Promise<Message<boolean>> {
			// if (!target) target = this.channel as TextBasedChannel;
			if (!target) target = this.channel as BaseGuildTextChannel;

			if (this.ephemeral) {
				//? add a silent flag to the reply to indicate that this is an ephemeral message
				content.flags = [MessageFlags.SuppressNotifications as any];
			}

			//? Mask any user mentions in the content with ticks (`) to prevent them from pinging the user
			content.content = content.content?.replace(/<@!?(\d+)>/g, '`$1`');

			//?? Does this work if the interaction is not in a guild (dm)?
			return (target instanceof Message) ? (
				(update) ? target.edit(content as MessageEditOptions) : target.reply(content as MessageReplyOptions)
			) : target.send(content as MessageReplyOptions);
		}
		//#endregion
	//#endregion

	//#region Emulated methods (as close to the real deal as possible)
	/**
	 * @param {string | Snowflake} message The message to fetch ('@original' for the original reply message)
	 * @returns {Message|undefined} The message that was fetched 
	*/
	fetchReply(message: string|Snowflake = '@original'): Message|undefined {
		if (message === '@original' && this._replyMessage !== undefined) return this._replyMessage;
		return this._followUpMessages.find(m => m.id === message);
	}

	/** 
	 * @param {boolean} ephermal Whether the reply is ephemeral
	 * @returns {Promise<true | ErrorObject>}
	 */
	async deferReply(ephermal?: boolean): Promise<true | ErrorObject> {
		if (this.deferred || this.replied) {
			return await EmitError(new Error('Interaction has already been deferred or replied'), this);
		}
		this.deferred = true;
		this.ephemeral = ephermal || false;
		return true;
	}

	/** 
	 * @param {string | ISimInteractionReplyOptions} replyContent The content to reply with
	 * @returns {Promise<Message|boolean|ErrorObject>}
	*/
	async reply(replyContent: string | ISimInteractionReplyOptions): Promise<Message|boolean|ErrorObject> {
		const content = await this.validateReply((!this.deferred && !this.replied), replyContent);
		if (content instanceof ErrorObject) return content;

		const message = await this.sendMessage(content);
		this.replied = !!(message);
		this._replyMessage = message;

		return (content.options?.fetchReply) ? this.fetchReply() ?? false : this.replied;
	}

	/**
	 * @param {string | ISimInteractionReplyOptions} replyContent The content to reply with
	 * @returns {Promise<Message|boolean|ErrorObject>} True if the message was sent or retruns the message if options.fetchReply is true
	*/
	async followUp(replyContent: string|ISimInteractionReplyOptions): Promise<Message|boolean|ErrorObject> {
		const content = await this.validateReply((this.deferred || this.replied), replyContent);
		if (content instanceof ErrorObject) return content;

		if (this.deferred) {
			//! Follow up messages can not be sent if the interaction didnt actually happen due to it being a simulation
			//? If the interaction was deferred, this will print in the console as a follow up message to let me know it has been sent
			cons.log('[fg=green]followUp[/>]: ' + `[fg=orange]/${this.commandName}[/>] was deferred, follow up message:`, content.content, content.embeds);
			return true;
		}
		const message = await this.sendMessage(content, this._replyMessage, false);
		this._followUpMessages.push(message);

		return (content.options?.fetchReply) ? this.fetchReply(message.id) ?? false : !!(message);
	}

	/**
	 * @param {string | ISimInteractionReplyOptions} replyContent The content to reply with
	 * @returns {Promise<Message|boolean|ErrorObject>} True if the message was sent or retruns the message if options.fetchReply is true
	*/
	async editReply(replyContent: string|ISimInteractionReplyOptions): Promise<Message|boolean|ErrorObject> {
		const content = await this.validateReply((this.replied), replyContent);
		if (content instanceof ErrorObject) return content;

		const target = (content.options?.message) ? ((typeof this.options.message === 'string') ? this.fetchReply(content.options.message as Snowflake) : content.options.message as Message) : this._replyMessage
		const message = await this.sendMessage(content, target, true);
		this._replyMessage = message;

		return (content.options?.fetchReply) ? this.fetchReply() ?? false : !!(message);
	}

	async deleteReply(message?: string|Snowflake): Promise<Message|void> {
		const target = this.fetchReply(message);
		if (target && target.deletable) {
			return await target.delete()
		}
	}
}