import mongoose, { Mongoose } from "mongoose";
import { EmitError } from "../../events";
import { default as Database, IMentionableItem, IMentionableStorage } from "./schemas/mentionableData";
import { Guild, Role } from "discord.js";
import { cons } from "../..";

export namespace Mentionable {
	export namespace Utils {
		/** Check if the mentionable is currently on cooldown
		 * @param mentionable The mentionable object
		 * @returns true if the mentionable is currently on cooldown, false otherwise
		*/
		export function isOncooldown(mentionable: IMentionableItem): boolean {
			return (mentionable.cooldown + mentionable.lastUsed >= Date.now())
		}

		/** Get the remaining time in milliseconds of the cooldown
		 * @param mentionable The mentionable object
		 * @returns The remaining cooldown time
		*/
		export function remainingCooldown(mentionable: IMentionableItem): number {
			return (mentionable.lastUsed + mentionable.cooldown) - Date.now()
		}
	}


	//? true if the anything has updated sins getAll() was last called
	let hasChanged: boolean = true;
	
	//? Store the mentionable object here everytime getAll() is called while hasChanged is true
	//? This is to save a bit of performance as the getAll function might be called for each message sent in any server.
	let mentionablesCache: IMentionableStorage = {};

	
	//#region Getters
	/** Get a list of all mentionables in a server
	 * @param guildId The GuildID of the server the mentionable is in
	 * @returns An object containing all mentionables
	*/
	export async function getAll(guildId: string): Promise<IMentionableStorage|null> {
		if (hasChanged) {
			const doc = await getDocument(guildId);
			if (!doc) { return null; }

			mentionablesCache = doc.mentionables;
			hasChanged = false;
		}

		return mentionablesCache;
	}

	/** Get a mentionable by ID
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @returns The mentionable if found, null otherwise
	*/
	export async function get(guildId: string, id: string): Promise<IMentionableItem|null> {
		return await getAll(guildId)[id];
	}
	
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
	//#endregion
	

	//#region Actions
	/** Create a new document for a guild
	 * @param guildId The GuildID of the server
	 * @returns The mentionable if found, null otherwise
	*/
	export async function create(guildId: string): Promise<typeof Database|unknown> {
		hasChanged = true;
		return await Database.create({_id: guildId}).catch(EmitError);
	}

	/**  Update the mentionable document
	 * @param doc The document to update
	 * @returns Wether or not the data has been saved successfully
	*/
	export async function update(doc: Awaited<ReturnType<typeof getDocument>>): Promise<boolean>;
	/**  Update the mentionable document
	 * @param guildId The GuildID of the server the document is for
	 * @returns Wether or not the data has been saved successfully
	*/
	export async function update(guildId: string): Promise<boolean>;
	export async function update(id_doc: string|Awaited<ReturnType<typeof getDocument>>): Promise<boolean> {
		let doc: Awaited<ReturnType<typeof getDocument>>;

		if (typeof id_doc === 'string') {
			doc = await getDocument(id_doc);
			if (!doc) { return false; }
		} else {
			if (id_doc == null) { return false; }
			doc = id_doc;
		}

		doc.markModified('mentionables');
		await doc.save()

		hasChanged = true;
		return true
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
		return await update(doc);
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
		if (!doc || !Object.keys(doc.mentionables).includes(id)) { return false; }

		delete doc.mentionables[id]
		return await update(doc);
	}

	/** Start the cooldown for a mentionable
	 * @param guild The guild that the mentionable is in
	 * @param  id The ID of the mentionable
	 * @param mentionable The mentionable object
	 * @returns true if the cooldown has been started successfully, false otherwise
	*/
	export async function startCooldown(guild: Guild, id: string, mentionable?: IMentionableItem|null): Promise<boolean> {
		const role = guild.roles.cache.find(r => r.id == id);
		if (!role) {
			EmitError(new Error(`Unable to find role (${id})`));
			return false;
		}

		if (mentionable === undefined) {
			mentionable = await get(guild.id, id);
		}
		if (!mentionable) { return false; }

		await role.setMentionable(false, `${process.env.APP_NAME} - Used`);
		setTimeout( //TODO make an alternate system that doesnt use timeouts
			async () => { onCooldownExpired(role); },
			mentionable.cooldown - (Date.now() - mentionable.lastUsed)
		);

		return true;
	}
	//#endregion


	//#region Events
	/** Once the bot enters a new guild, see if we need to create a new document
	 * @param guildId The GuildID of the server
	*/
	export async function onGuildCreate(guild: Guild): Promise<void> {
		const doc = await Mentionable.getDocument(guild.id, false);
		if (doc == null) {
			await create(guild.id);
			cons.log(`[fg=green]Created[/>] new Mentionables document for ${guild.id}`);
		}
	}

	/** Once the bot leaves a guild, see if we need to delete a document
	 * @param guildId The GuildID of the server
	*/
	export async function onGuildDelete(guild: Guild): Promise<void> {
		const doc = await Mentionable.getDocument(guild.id, false);
		if (doc != null) {
			await doc.deleteOne({_id: doc._id})
			cons.log(`[fg=red]Deleted[/>] Mentionables document for ${guild.id}`);
		}
	}

	/** Once a mentionable is used. Updates its last used time and starts the cooldown 
	 * @param guild The guild that the mentionable is in
	 * @param id The ID of the mentionable
	 * @returns Wether or not the data has been saved successfully
	*/
	export async function onUsed(guild: Guild, id: string): Promise<boolean> {
		const doc = await getDocument(guild.id);
		if (!doc || !doc.mentionables[id]) { return false; }

		doc.mentionables[id].lastUsed = new Date().getTime();
		await startCooldown(guild, id, doc.mentionables[id]);
		return await update(doc);
	}

	//TODO fix wording on this summary
	/** Once a cooldown of a mentionable expires. Updates the role of the mentionable to be able to be mentioned again
	 * @param role The role of the mentionable that the cooldown expired of
	 * @returns Wether or not the role has been set to mentionable successfully
	*/
	export async function onCooldownExpired(role: Role): Promise<boolean> {
		await role.setMentionable(true, `${process.env.APP_NAME} - Cooldown Expired`).catch((e: Error) => {
			e.message = `Failed to update role to mentionable after expired cooldown\n${e.message}`
			EmitError(e); //! if this is reached, there is a role stuck on not mentionable
			return false;
		});
		return true;
	}
	//#endregion
}