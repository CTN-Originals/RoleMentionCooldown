import mongoose, { Mongoose } from "mongoose";
import { EmitError } from "../../events";
import { default as Database, IMentionableItem, IMentionableStorage } from "./schemas/mentionableData";

export namespace Mentionable {
	/** Get a mentionable by ID
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @returns The mentionable if found, null otherwise
	*/
	export async function get(guildId: string, id: string): Promise<IMentionableItem|null> {
		const doc = await getDocument(guildId);
		if (!doc) { return null; }
		return null
	}
	
	/** Once a mentionable is used, update its times
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @returns Wether or not the data has been saved successfully
	*/
	export async function onUsed(guildId: string, id: string): Promise<boolean> {
		const doc = await getDocument(guildId);
		if (!doc) { return false; }
		return false
	}
	
	/** Register a new mentionable
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @param data The data of the mentionable to register
	 * @returns Wether or not the data has been saved successfully
	*/
	export async function add(guildId: string, id: string, data: IMentionableItem): Promise<boolean> {
		const doc = await getDocument(guildId);
		if (!doc) { return false; }
		return true
	}

	/** Edit a mentionable
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @param data The edited data
	 * @returns Wether or not the data has been saved successfully
	*/
	export async function edit(guildId: string, id: string, data: IMentionableItem): Promise<boolean> {
		const doc = await getDocument(guildId);
		if (!doc) { return false; }
		return false
	}

	/** Remove a mentionable
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @returns Wether or not the data has been saved successfully
	*/
	export async function remove(guildId: string, id: string): Promise<boolean> {
		const doc = await getDocument(guildId);
		if (!doc) { return false; }
		return false
	}


	async function getDocument(guildId: string) {
		try {
			return Database.findOne({ _id: guildId });
		} catch (e) {
			const errMessage = `Attempted to find document of guild (${guildId})\n`;
			if (e instanceof Error) {
				e.message = errMessage + e.message
				EmitError(e);
			} else {
				EmitError(new Error(errMessage));
			}
			return null;
		}
	}
}