import { ChatInputCommandInteraction, ComponentType, ComponentValue, Message } from "discord.js";
import { EmitError } from "../events";


export class ComponentValueStorage {
	private storage: {[messageId: string]: {[componentId: string]: ComponentValue | null}} = {};


	/** Register a new interaction that has just been replied to
	 * @note This will only work if the interaction has replied with a message, if this isnt the case, it will throw an error
	 * @param interaction The interaction the reply
	 * @returns Wether or not the message was successfully fetched from the interaction and stored
	*/
	public async registerInteraction(interaction: ChatInputCommandInteraction): Promise<boolean> {
		const message: Message | false = await interaction.fetchReply().catch((e) => {
			EmitError(new Error(`Unable to fetch the reply from the interaction (${interaction.commandName})\n${e}`));
			return false;
		});

		if (!message) {
			return false;
		}

		this.storage[message.id] = {}
		return true;
	}

	public setValue(messageId: string, componentId: string, value: ComponentValue): boolean {
		//TODO
		return true
	}

	public getValue(messageId: string, componentId: string): ComponentValue | null {
		//TODO
		return null;
	}
}