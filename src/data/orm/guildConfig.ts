import { Guild } from "discord.js";

import { default as DataModel, GuildConfigData, IGuildConfigData } from './schemas/guildConfigData'
import { ObjectRelationalMap } from ".";

export class GuildConfig {
	/** Get the config object of a guild
	 * @param guildId The ID of the guild you want the config of
	 * @returns The document of the guild if it exists, null otherwise
	*/
	public static async getDocument(guildId: string) {
		return await ObjectRelationalMap.getDocument(DataModel, guildId);
	}
	
	/** Get the config object of a guild
	 * @param guildId The ID of the guild you want the config of
	 * @returns The guild config object
	*/
	public static async get(guildId: string): Promise<IGuildConfigData> {
		return await this.getDocument(guildId) as Extract<typeof DataModel, IGuildConfigData>
	}
}