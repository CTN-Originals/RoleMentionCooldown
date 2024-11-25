import { Guild } from "discord.js"
import { Document, Model } from "mongoose"
import { EmitError, eventConsole } from "../../events"

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
		let doc = await model.findOne({ _id: guildId })
		if (!doc && errorOnNull) {
			await EmitError(new Error(`Document for guild (${guildId}) does not exist, creating new document...`))
			doc = await ObjectRelationalMap.create(model, guildId)
		}
		return doc
	}

	/** Create a new document for a guild
	 * @param model The model of the document
	 * @param guildId The GuildID of the server
	 * @returns The Document if created successfully, null otherwise
	*/
	public static async create(model: typeof Model, guildId: string) {
		return await model.create({ _id: guildId }).catch(EmitError)
	}

	/**  Update a document
	 * @param doc The document to update
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async update(model: typeof Model, doc: Awaited<ReturnType<typeof ObjectRelationalMap.getDocument>>, markModified?: string[]): Promise<true>
	/**  Update a document
	 * @param guildId The GuildID of the server the document is for
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async update(model: typeof Model, guildId: string, markModified?: string[]): Promise<true>
	/**  Update a document
	 * @param id_doc Either the GuildID or the Document
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async update(model: typeof Model, id_doc: string | Awaited<ReturnType<typeof ObjectRelationalMap.getDocument>>, markModified?: string[]): Promise<true>
	public static async update(model: typeof Model, id_doc: string | Awaited<ReturnType<typeof ObjectRelationalMap.getDocument>>, markModified: string[] = []): Promise<true> {
		let doc: Awaited<ReturnType<typeof ObjectRelationalMap.getDocument>>

		if (typeof id_doc === 'string') {
			doc = await ObjectRelationalMap.getDocument(model, id_doc)
		} else {
			doc = id_doc
		}

		if (!doc) {
			throw new Error(`Unable to find document to update`)
		}

		for (const field of markModified) {
			doc.markModified(field)
		}

		await doc.save()

		return true
	}

	/** Once the bot enters a new guild, see if we need to create a new document
	 * @param model The model of the document
	 * @param guildId The GuildID of the server
	*/
	public static async onGuildCreate(model: typeof Model, guild: Guild): Promise<void> {
		const doc = await this.getDocument(model, guild.id, false) //? check if it already/still existed
		if (doc == null) {
			await this.create(model, guild.id)
			eventConsole.log(`[fg=green]Created[/>] new ${model.modelName} document for ${guild.id}`)
		}
	}

	/** Once the bot leaves a guild, see if we need to delete a document
	 * @param model The model of the document
	 * @param guildId The GuildID of the server
	*/
	public static async onGuildDelete(model: typeof Model, guild: Guild): Promise<void> {
		const doc = await this.getDocument(model, guild.id, false)
		if (doc != null) {
			await doc.deleteOne({ _id: guild.id })
			eventConsole.log(`[fg=red]Deleted[/>] ${model.modelName} document for ${guild.id}`)
		}
	}
}
