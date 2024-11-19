import { Client, ComponentType, DiscordjsError, DiscordjsErrorCodes, Events, Message, MessageComponent, StringSelectMenuComponent, TextBasedChannel } from "discord.js";
import { InteractionResponses } from "discord.js/src/structures/interfaces/InteractionResponses";

import { Modify } from "../@types";
import { ISimBaseInteraction, SimBaseInteraction } from ".";
import { cons } from "..";
import { ErrorObject } from "../handlers/errorHandler";
import { EmitError } from "../events";
import { ISimInteractionReplyContent, ISimInteractionReplyOptions, SimInteractionResponses } from "./interactionResponses";

//#region Base
export interface ISimBaseComponentInteraction extends ISimBaseInteraction {
	customId: string;
	message: Message;
}
export class SimBaseComponentInteraction extends SimBaseInteraction {
	public customId: string;
	public message: Message;

	public component: MessageComponent;
	public componentType: ComponentType;

	public replied: boolean;
	public deferred: boolean;
	public ephemeral: boolean;

	private _replyMessage?: Message<boolean>;
	private _followUpMessages: Message<boolean>[];

	constructor(args: ISimBaseComponentInteraction) {
		const getComponent = (message: Message, customId: string): MessageComponent => {
			for (const row of message.components) {
				for (const comp of row.components) {
					if (comp.customId === customId) return comp
				}
			}
			throw EmitError(new Error(`Message did not include a component with the custom id ${customId}`));
		}

		const component: MessageComponent = getComponent(args.message, args.customId)
		args.type = component.data.type;

		super(args);
		this.customId = args.customId;
		this.message = args.message;
		
		this.component = component;
		this.componentType = args.type!;

		this.deferred = false;
		this.replied = false;
		this.ephemeral = false;

		this._followUpMessages = []
	}

	public async awaitReply(timeout: number = 5000, interval: number = 100): Promise<Message|null> {return null}
}
SimInteractionResponses.applyToClass(SimBaseComponentInteraction)

//#endregion

export interface ISimStringSelectMenuInteraction extends ISimBaseComponentInteraction {
	values: string[]
}
export class SimStringSelectMenuInteraction extends SimBaseComponentInteraction {
	public values: string[];
	declare public component: StringSelectMenuComponent;

	constructor(args: ISimStringSelectMenuInteraction) {
		super(args)
		this.values = args.values;
	}
}