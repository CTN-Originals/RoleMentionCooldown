import mongoose, { Mongoose } from "mongoose";
import { EmitError } from "../../events";
import { default as Database, IMentionableItem, IMentionableStorage } from "./schemas/mentionableData";
import { Guild } from "discord.js";
import { cons } from "../..";

export namespace Mentionable {
	/** Get a mentionable by ID
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @returns The mentionable if found, null otherwise
	*/
	export async function get(guildId: string, id: string): Promise<IMentionableItem|null> {
		const doc = await getDocument(guildId);
		if (!doc) { return null; }

		return doc.mentionables[id]
	}
	//TODO getAll

	/** Get the whole document of a guild
	 * @param guildId The ID of the guild
	 * @param errorOnNull Should an error be logged if the document doesnt exist?
	*/
	export async function getDocument(guildId: string, errorOnNull: boolean = true) {
		if (errorOnNull) {
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
		else {
			return Database.findOne({ _id: guildId });
		}
	}
	

	/** Create a new document for a guild
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @returns The mentionable if found, null otherwise
	*/
	export async function create(guildId: string) {
		return await Database.create({_id: guildId}).catch(EmitError);
	}

	/** Once the bot enters a new guild, see if we need to create a new document
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @returns The mentionable if found, null otherwise
	*/
	export async function onGuildCreate(guild: Guild): Promise<void> {
		const doc = await Mentionable.getDocument(guild.id, false);
		if (doc == null) {
			await create(guild.id);
			cons.log(`Created new Mentionables document for ${guild.id}`);
		}
	}
	//TODO on guild delete

	
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

		doc.mentionables[id] = data;
		doc.markModified('mentionables');
		await doc.save()

		return true
	}

	/** Edit a mentionable
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @param data The edited data
	 * @returns Wether or not the data has been saved successfully
	*/
	export async function edit(guildId: string, id: string, data: IMentionableItem): Promise<boolean> {
		return await add(guildId, id, data);
	}

	/** Remove a mentionable
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @returns Wether or not the data has been saved successfully
	*/
	export async function remove(guildId: string, id: string): Promise<boolean> {
		const doc = await getDocument(guildId);
		if (!doc) { return false; }

		delete doc.mentionables[id]
		doc.markModified('mentionables');
		await doc.save()

		return false
	}


	
}