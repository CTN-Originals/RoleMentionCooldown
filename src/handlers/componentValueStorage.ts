import { ChatInputCommandInteraction, ComponentType, ComponentValue, Message } from "discord.js";
import { EmitError } from "../events";

type ComponentValueHolder = {[componentId: string]: ComponentValue | null};

export class ComponentValueStorage {
	private static storage: {[messageId: string]: ComponentValueHolder} = {};


	/** Start the timer anc cleanup the message ID from the storage once it runs out
	 * @note Discords interaction have a hardset lifetime of 15 minutes and will be cleared out from memory once that time is up,
		so there is not reason for us to keep this data around after that time either as the components on that message will no longer call back to us with interactions
	 * @note By the time this function is called, the message likely already existed for a little bit 
		because a message ID is only registered once a user interacts with a component that is on a message that has not been registered yet, 
		instead of it being created once the reply is sent (which makes more sense but is harder to do)
	 * @param messageId The message ID key in the storage object to delete once the timer runs out
	*/
	private static async setCleanupTimeout(messageId: string) {
		new Promise<void>((resolve) => {
			setTimeout(() => {
				delete ComponentValueStorage.storage[messageId];
				resolve();
			}, 1000 * 60 * 15)
		});
	}

	/** Register a new interaction that has just been replied to
	 * @note This will only work if the interaction has replied with a message, if this isnt the case, it will throw an error
	 * @param interaction The interaction the reply
	 * @returns Wether or not the message was successfully fetched from the interaction and stored
	*/
	public static async registerInteraction(interaction: ChatInputCommandInteraction): Promise<boolean> {
		const message: Message | false = await interaction.fetchReply().catch((e) => {
			EmitError(new Error(`Unable to fetch the reply from the interaction (${interaction.commandName})\n${e}`));
			return false;
		});

		if (!message) {
			return false;
		}

		ComponentValueStorage.storage[message.id] = {}
		ComponentValueStorage.setCleanupTimeout(message.id);

		return true;
	}

	/** Get an item out of the storage object by its message id
	 * @param messageId The message id to check if it is included
	 * @returns `true` if the storage contains the message ID as a key, `false` otherwise
	*/
	public static storageIncludesMessage(messageId: string): boolean {
		return Object.keys(ComponentValueStorage.storage).includes(messageId);
	}

	/** Get an item out of the storage object by its message id
	 * @param messageId The message id of which to get the item
	 * @returns The {@linkcode ComponentValueHolder} if it exists or `false` otherwise
	*/
	private static getItemByMessageId(messageId: string): ComponentValueHolder | false {
		if (!ComponentValueStorage.storageIncludesMessage(messageId)) {
			EmitError(new Error(`Component value storage does not contain message item (${messageId})`));
			return false;
		}

		return ComponentValueStorage.storage[messageId];
	}

	public static setValue(messageId: string, componentId: string, value: ComponentValue): boolean {
		const storageItem = ComponentValueStorage.getItemByMessageId(messageId);
		if (!storageItem) { return false; }

		//?? Do i need to specify the whole path here instead of using an alias/shortcut (ComponentValueStorage.storage[messageId][componentId = value])
		storageItem[componentId] = value;

		return true;
	}

	public static getValue(messageId: string, componentId: string): ComponentValue | null {
		const storageItem = ComponentValueStorage.getItemByMessageId(messageId);
		if (!storageItem) { return null; }



		return null;
	}
}