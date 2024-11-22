import { Guild } from "discord.js";

import { default as DataModel, GuildConfigData, IGuildConfigData } from './schemas/guildConfigData'
import { ObjectRelationalMap } from ".";
import { Model } from "mongoose";

export class GuildConfig {
	/** Get the config object of a guild
	 * @param guildId The ID of the guild you want the config of
	 * @returns The document of the guild if it exists, null otherwise
	*/
	public static async getDocument(guildId: string, errorIfNull: boolean = true) {
		return await ObjectRelationalMap.getDocument(DataModel, guildId, errorIfNull);
	}
	
	/** Get the config object of a guild
	 * @param guildId The ID of the guild you want the config of
	 * @returns The guild config object
	*/
	public static async get(guildId: string): Promise<IGuildConfigData> {
		return await this.getDocument(guildId) as Extract<typeof DataModel, IGuildConfigData>
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