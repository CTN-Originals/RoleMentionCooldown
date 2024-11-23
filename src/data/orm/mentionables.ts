import mongoose, { Model, Mongoose } from "mongoose";
import { EmitError } from "../../events";
import { default as DataModel, IMentionableData, IMentionableItem, IMentionableStorage } from "./schemas/mentionableData";
import { Guild, Role } from "discord.js";
import { cons } from "../..";
import { ObjectRelationalMap } from ".";

export class Mentionable {
	//? true if the anything has updated sins getAll() was last called
	public static hasChanged: boolean = true;
	
	//? Store the mentionable object here everytime getAll() is called while hasChanged is true
	//? This is to save a bit of performance as the getAll function might be called for each message sent in any server.
	public static mentionablesCache: {[id: string]: IMentionableStorage} = {};

	
	//#region Getters
	/** Get the whole document of a guild
	 * @param guildId The ID of the guild
	 * @param errorIfNull Should an error be logged if the document doesnt exist?
	*/
	public static async getDocument(guildId: string, errorIfNull: boolean = true) {
		// if (errorOnNull) {
		// 	try {
		// 		return Database.findOne({ _id: guildId });
		// 	} catch (e) {
		// 		const errMessage = `Attempted to find document of guild (${guildId})\n`;
		// 		if (e instanceof Error) {
		// 			e.message = errMessage + e.message
		// 			EmitError(e);
		// 		} else {
		// 			EmitError(new Error(errMessage));
		// 		}
		// 		return null;
		// 	}
		// }
		// else {
		// 	return Database.findOne({ _id: guildId });
		// }

		return await ObjectRelationalMap.getDocument<IMentionableData>(DataModel, guildId, errorIfNull)
	}

	/** Get a list of all mentionables in a server
	 * @param guildId The GuildID of the server the mentionable is in
	 * @returns An object containing all mentionables
	*/
	public static async getAll(guildId: string): Promise<IMentionableStorage|null> {
		if (Mentionable.hasChanged || !Object.keys(Mentionable.mentionablesCache).includes(guildId)) {
			const doc = await Mentionable.getDocument(guildId);

			Mentionable.mentionablesCache[guildId] = doc.mentionables;
			Mentionable.hasChanged = false;
		}

		return Mentionable.mentionablesCache[guildId];
	}

	/** Get a mentionable by ID
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @returns The mentionable if found, null otherwise
	*/
	public static async get(guildId: string, id: string): Promise<IMentionableItem|null> {
		const list = await Mentionable.getAll(guildId);
		if (list === null) { return null; }
		return list[id];
	}
	
	/** Check if the mentionable is currently on cooldown
	 * @param mentionable The mentionable object
	 * @returns true if the mentionable is currently on cooldown, false otherwise
	*/
	public static isOncooldown(mentionable: IMentionableItem): boolean {
		return (mentionable.cooldown + mentionable.lastUsed >= Date.now())
	}

	/** Get the remaining time in milliseconds of the cooldown
	 * @param mentionable The mentionable object
	 * @returns The remaining cooldown time
	*/
	public static remainingCooldown(mentionable: IMentionableItem): number {
		return (mentionable.lastUsed + mentionable.cooldown) - Date.now()
	}
	//#endregion
	

	//#region Actions
	/** Create a new document for a guild
	 * @param guildId The GuildID of the server
	 * @returns The mentionable if found, null otherwise
	*/
	public static async create(guildId: string): Promise<typeof DataModel|unknown> {
		Mentionable.hasChanged = true;
		return await ObjectRelationalMap.create(DataModel, guildId);
	}

	/**  Update the mentionable document
	 * @param doc The document to update
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async update(doc: Awaited<ReturnType<typeof Mentionable.getDocument>>): ReturnType<typeof ObjectRelationalMap.update>;
	/**  Update the mentionable document
	 * @param guildId The GuildID of the server the document is for
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async update(guildId: string): ReturnType<typeof ObjectRelationalMap.update>;
	public static async update(id_doc: string|Awaited<ReturnType<typeof Mentionable.getDocument>>): ReturnType<typeof ObjectRelationalMap.update> {
		Mentionable.hasChanged = true; //? just in case it returns false but still updated
		return await ObjectRelationalMap.update(DataModel, id_doc, ['mentionables'])
	}

	/** Register a new mentionable
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @param data The data of the mentionable to register
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async add(guildId: string, id: string, data: IMentionableItem): Promise<boolean> {
		const doc = await Mentionable.getDocument(guildId);
		if (!doc) { return false; }
		
		doc.mentionables[id] = data;
		return await Mentionable.update(doc);
	}

	/** Edit a mentionable
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @param data The edited data
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async edit(guildId: string, id: string, data: IMentionableItem): Promise<boolean> {
		return await Mentionable.add(guildId, id, data);
	}

	/** Remove a mentionable
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async remove(guildId: string, id: string): Promise<boolean> {
		const doc = await Mentionable.getDocument(guildId);
		if (!doc || !Object.keys(doc.mentionables).includes(id)) { return false; }

		delete doc.mentionables[id]
		return await Mentionable.update(doc);
	}

	/** Start the cooldown for a mentionable
	 * @param guild The guild that the mentionable is in
	 * @param  id The ID of the mentionable
	 * @param mentionable The mentionable object
	 * @returns true if the cooldown has been started successfully, false otherwise
	*/
	public static async startCooldown(guild: Guild, id: string, mentionable?: IMentionableItem|null): Promise<boolean> {
		const role = guild.roles.cache.find(r => r.id == id);
		if (!role) {
			EmitError(new Error(`Unable to find role (${id})`));
			return false;
		}

		if (mentionable === undefined) {
			mentionable = await Mentionable.get(guild.id, id);
		}
		if (!mentionable) { return false; }

		await role.setMentionable(false, `${process.env.APP_NAME} - Used`);
		setTimeout( //TODO make an alternate system that doesnt use timeouts
			async () => { Mentionable.onCooldownExpired(role); },
			mentionable.cooldown - (Date.now() - mentionable.lastUsed)
		);

		return true;
	}
	//#endregion


	//#region Events
	/** Once the bot enters a new guild, see if we need to create a new document
	 * @param guildId The GuildID of the server
	*/
	public static async onGuildCreate(guild: Guild): Promise<void> {
		await ObjectRelationalMap.onGuildCreate(DataModel, guild);
	}

	/** Once the bot leaves a guild, see if we need to delete a document
	 * @param guildId The GuildID of the server
	*/
	public static async onGuildDelete(guild: Guild): Promise<void> {
		await ObjectRelationalMap.onGuildDelete(DataModel, guild);
	}

	/** Once a mentionable is used. Updates its last used time and starts the cooldown 
	 * @param guild The guild that the mentionable is in
	 * @param id The ID of the mentionable
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async onUsed(guild: Guild, id: string): Promise<boolean> {
		const doc = await Mentionable.getDocument(guild.id);
		if (!doc || !doc.mentionables[id]) { return false; }

		doc.mentionables[id].lastUsed = new Date().getTime();
		await Mentionable.startCooldown(guild, id, doc.mentionables[id]);
		return await Mentionable.update(doc);
	}

	//TODO fix wording on this summary
	/** Once a cooldown of a mentionable expires. Updates the role of the mentionable to be able to be mentioned again
	 * @param role The role of the mentionable that the cooldown expired of
	 * @returns Wether or not the role has been set to mentionable successfully
	*/
	public static async onCooldownExpired(role: Role): Promise<boolean> {
		await role.setMentionable(true, `${process.env.APP_NAME} - Cooldown Expired`).catch((e: Error) => {
			e.message = `Failed to update role to mentionable after expired cooldown\n${e.message}`
			EmitError(e); //! if this is reached, there is a role stuck on not mentionable
			return false;
		});
		return true;
	}
	//#endregion
}