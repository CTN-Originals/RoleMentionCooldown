import type { AnySelectMenuInteraction, ButtonInteraction, ChatInputCommandInteraction, ComponentValue, Message } from 'discord.js';
import { EmitError } from '../events';

type ComponentValueHolder = {[componentId: string]: ComponentValue | null};
type InteractionWithMessage = ChatInputCommandInteraction | AnySelectMenuInteraction | ButtonInteraction;

export class ComponentValueStorage {
	private static storage: {[messageId: string]: ComponentValueHolder} = {};


	/** Get an item out of the storage object by its message id
	 * @param messageId The message id to check if it is included
	 * @returns `true` if the storage contains the message ID as a key, `false` otherwise
	*/
	public static storageIncludesMessage(messageId: string): boolean {
		return Object.keys(ComponentValueStorage.storage).includes(messageId);
	}

	/** Register a new message ID to the storage object
	 * @param messageId The ID of the message you want to register
	 * @returns `true` if the message ID was added to the storage object, `false` if the ID was already present in the storage object
	*/
	public static registerMessage(messageId: string, interaction: InteractionWithMessage): boolean {
		if (ComponentValueStorage.storageIncludesMessage(messageId)) {
			EmitError(new Error(`Message ID was already present in storage (${messageId})`));
			return false;
		}

		ComponentValueStorage.storage[messageId] = {};
		ComponentValueStorage.setCleanupTimeout(messageId, interaction);

		return true;
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

		return ComponentValueStorage.registerMessage(message.id, interaction);
	}

	public static setValue(interaction: Exclude<InteractionWithMessage, ChatInputCommandInteraction>, componentId: string, value: ComponentValue): true;
	public static setValue(messageId: string, componentId: string, value: ComponentValue): boolean;
	public static setValue(interaction_id: Exclude<InteractionWithMessage, ChatInputCommandInteraction> | string, componentId: string, value: ComponentValue): boolean {
		let storageItem = ComponentValueStorage.getItemByMessageId((typeof interaction_id === 'string') ? interaction_id : interaction_id.message.id);
		if (typeof interaction_id === 'string') {
			if (!storageItem) { 
				return false;
			}
		} else {
			if (!storageItem) { 
				ComponentValueStorage.registerMessage(interaction_id.message.id, interaction_id);
				storageItem = ComponentValueStorage.getItemByMessageId(interaction_id.message.id) as ComponentValueHolder;
			}
		}
		
		storageItem[componentId] = value;

		return true;
	}

	public static getValue(messageId: string, componentId: string): ComponentValue | null {
		const storageItem = ComponentValueStorage.getItemByMessageId(messageId);
		if (!storageItem) { return null; }

		return (Object.keys(storageItem).includes(componentId)) ? storageItem[componentId] : null;
	}


	/** Start the timer anc cleanup the message ID from the storage once it runs out
	 * @note By the time this function is called, the message likely already existed for a little bit 
		because a message ID is only registered once a user interacts with a component that is on a message that has not been registered yet, 
		instead of it being created once the reply is sent (which makes more sense but is harder to do)
	 * @param messageId The message ID key in the storage object to delete once the timer runs out
	*/
	private static async setCleanupTimeout(messageId: string, interaction: InteractionWithMessage): Promise<void> {
		setTimeout(async () => {
			try {
				const message = await interaction.fetchReply();

				if (message && message.editable) {
					await interaction.editReply({
						content:    message.content,
						embeds:     message.embeds,
						components: []
					});
				}
			} catch (_) { /* interaction.fetchReply() can error here, but its fine and should not log */ }
			
			delete ComponentValueStorage.storage[messageId];
		}, 1000 * 60 * 15);
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
}