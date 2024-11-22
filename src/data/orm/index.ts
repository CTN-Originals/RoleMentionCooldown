import { Document, model, Model, Schema } from "mongoose";
import { cons } from "../..";
import { EmitError, eventConsole } from "../../events";
import { Base, Guild } from "discord.js";

export interface BaseDocument {
	_id: string
}

export class ObjectRelationalMap {
	/** Get the document of a guild
	 * @param model The model of the document
	 * @param guildId The ID of the guild you want the document of
	 * @returns The document of the guild if it exists
	*/
	public static async getDocument<T extends Document & BaseDocument>(model: typeof Model, guildId: string, errorOnNull: boolean = true): Promise<T> {
		const doc = await model.findOne({_id: guildId});
		if (!doc && errorOnNull) {
			throw new Error(`Document for guild (${guildId}) does not exist`);
		}
		return doc;
	}


	/** Create a new document for a guild
	 * @param model The model of the document
	 * @param guildId The GuildID of the server
	 * @returns The Document if created successfully, null otherwise
	*/
	public static async create(model: typeof Model, guildId: string) {
		return await model.create({_id: guildId}).catch(EmitError);
	}
	
	/** Once the bot enters a new guild, see if we need to create a new document
	 * @param model The model of the document
	 * @param guildId The GuildID of the server
	*/
	public static async onGuildCreate(model: typeof Model, guild: Guild): Promise<void> {
		const doc = await this.getDocument(model, guild.id, false);
		if (doc == null) {
			await this.create(model, guild.id);
			eventConsole.log(`[fg=green]Created[/>] new ${model.name} document for ${guild.id}`);
		}
	}

	/** Once the bot leaves a guild, see if we need to delete a document
	 * @param model The model of the document
	 * @param guildId The GuildID of the server
	*/
	public static async onGuildDelete(model: typeof Model, guild: Guild): Promise<void> {
		const doc = await this.getDocument(model, guild.id, false);
		if (doc != null) {
			await doc.deleteOne({_id: guild.id})
			eventConsole.log(`[fg=red]Deleted[/>] ${model.name} document for ${guild.id}`);
		}
	}
}