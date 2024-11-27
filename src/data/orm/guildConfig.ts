import { Guild } from "discord.js"
import { ObjectRelationalMap } from "."
import {
	default as DataModel,
	IGuildConfigData
} from './schemas/guildConfigData'

export class GuildConfig {
	/** Get the config object of a guild
	 * @param guildId The ID of the guild you want the config of
	 * @returns The document of the guild if it exists, null otherwise
	*/
	public static async getDocument(guildId: string, errorIfNull: boolean = true) {
		return await ObjectRelationalMap.getDocument(DataModel, guildId, errorIfNull)
	}

	/** Get the config object of a guild
	 * @param guildId The ID of the guild you want the config of
	 * @returns The guild config object
	*/
	public static async get(guildId: string): Promise<IGuildConfigData> {
		return await this.getDocument(guildId) as Extract<typeof DataModel, IGuildConfigData>
	}

	/**  Update a document
	 * @param doc The document to update
	 * @param markModified A list of fields that need to be marked as modified before saving the document
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async update(doc: Awaited<ReturnType<typeof GuildConfig.getDocument>>, markModified?: string[]): ReturnType<typeof ObjectRelationalMap.update>
	/**  Update a document
	 * @param guildId The GuildID of the server the document is for
	 * @param markModified A list of fields that need to be marked as modified before saving the document
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async update(guildId: string, markModified?: string[]): ReturnType<typeof ObjectRelationalMap.update>
	public static async update(id_doc: string | Awaited<ReturnType<typeof GuildConfig.getDocument>>, markModified: string[] = []): ReturnType<typeof ObjectRelationalMap.update> {
		return await ObjectRelationalMap.update(DataModel, id_doc, markModified)
	}

	/** Once the bot enters a new guild, see if we need to create a new document
	 * @param model The model of the document
	 * @param guildId The GuildID of the server
	*/
	public static async onGuildCreate(guild: Guild): Promise<void> {
		await ObjectRelationalMap.onGuildCreate(DataModel, guild)
	}

	/** Once the bot leaves a guild, see if we need to delete a document
	 * @param model The model of the document
	 * @param guildId The GuildID of the server
	*/
	public static async onGuildDelete(guild: Guild): Promise<void> {
		await ObjectRelationalMap.onGuildDelete(DataModel, guild)
	}
}
