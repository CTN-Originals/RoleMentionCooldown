import { Guild, Role } from "discord.js"
import { ObjectRelationalMap } from "."
import { ColorTheme, GeneralData } from ".."
import { EmitError, eventConsole } from "../../events"
import {
	default as DataModel,
	IMentionableData,
	IMentionableItem,
	IMentionableStorage
} from "./schemas/mentionableData"

type MentionableCache<T> = {[id: string]: T};
export class Mentionable {
	/** true if the anything has updated sins getAll() was last called */
	public static hasChanged: MentionableCache<boolean> = {};
	
	/** Store the mentionable object here everytime getAll() is called while hasChanged is true 
	 * @note This is to save a bit of performance as the getAll function might be called for each message sent in any server.
	*/
	public static mentionablesCache: MentionableCache<IMentionableStorage> = {};

	/** Stores an array of mentionables that are currently on cooldown */
	public static activeCooldowns: MentionableCache<IMentionableStorage> = {};
	
	//#region Getters
	/** Get the whole document of a guild
	 * @param guildId The ID of the guild
	 * @param errorIfNull Should an error be logged if the document doesnt exist?
	*/
	public static async getDocument(guildId: string, errorIfNull: boolean = true) {
		return await ObjectRelationalMap.getDocument<IMentionableData>(DataModel, guildId, errorIfNull)
	}

	/** Get a list of all mentionables in a server
	 * @param guildId The GuildID of the server the mentionable is in
	 * @returns An object containing all mentionables
	*/
	public static async getAll(guildId: string): Promise<IMentionableStorage|null> {
		if (Mentionable.hasChanged || !Object.keys(Mentionable.mentionablesCache).includes(guildId)) {
			const doc = await Mentionable.getDocument(guildId);

			Mentionable.mentionablesCache[guildId] = (Object.keys(doc.toObject()).includes('mentionables')) ? doc.mentionables : {};
			Mentionable.hasChanged[guildId] = false;
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
	public static async create(guildId: string): Promise<IMentionableData> {
		Mentionable.hasChanged[guildId] = true;
		return await ObjectRelationalMap.create(DataModel, guildId);
	}

	/** When the bot starts up, run this function for each guild
	 *  @param guild The Guild to initialize
	*/
	public static async initialize(guild: Guild) {
		Mentionable.hasChanged[guild.id] = true;
		Mentionable.mentionablesCache[guild.id] = {};
		Mentionable.activeCooldowns[guild.id] = {};
		
		// const mentionableDoc = await Mentionable.getDocument(guild.id, false);
		const mentionables = await Mentionable.getAll(guild.id);
		
		for (const roleId in mentionables) {
			if (roleId == 'placeholder') { continue; } //?? this used to be a thing, keeping it for some reason... i wanna i guess....

			const role = guild.roles.cache.find(r => r.id == roleId);
			if (!role) {
				EmitError(new Error(`Unable to find role (${roleId})`));
				return;
			}

			if (!role.mentionable) {
				if (Mentionable.isOncooldown(mentionables[roleId])) {
					if (GeneralData.development) {
						eventConsole.log(`[fg=green]Restarting[/>] cooldown: [fg=${(role.hexColor != '#000000') ? role.hexColor : ColorTheme.colors.grey.asHex}]${role.name}[/>] | ${Mentionable.remainingCooldown(mentionables[roleId]) / 1000}s`)
					}
					Mentionable.startCooldown(guild, roleId, mentionables[roleId])
				}
				else {
					if (GeneralData.development) {
						eventConsole.log(`[fg=red]Expired[/>] cooldown: [fg=${(role.hexColor != '#000000') ? role.hexColor : ColorTheme.colors.grey.asHex}]${role.name}[/>] | ${Mentionable.remainingCooldown(mentionables[roleId]) / 1000}s`)
					}
					Mentionable.onCooldownExpired(role);
				}
			}
		}
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
		if (typeof id_doc === 'string')
			Mentionable.hasChanged[id_doc] = true;
		else
			Mentionable.hasChanged[id_doc._id] = true;
		
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
		Mentionable.activeCooldowns[guild.id][id] = mentionable;

		return true;
	}

	/** Check all the active cooldowns for a guild and end them if they are expired
	 * @param guild The guild to check the cooldowns for
	*/
	public static async validateGuildCooldowns(guild: Guild) {
		for (const roleId in Mentionable.activeCooldowns[guild.id]) {
			const item = Mentionable.activeCooldowns[guild.id][roleId];
			if (!Mentionable.isOncooldown(item)) {
				//? delete now as it doesnt matter if the role exists or not, it should not trigger again
				delete Mentionable.activeCooldowns[guild.id][roleId]; 

				const role = guild.roles.cache.find(r => r.id == roleId);
				if (!role) {
					EmitError(new Error(`Unable to find role (${roleId})`));
					continue;
				}

				Mentionable.onCooldownExpired(role);
			}
		}
	}
	//#endregion


	//#region Events

	/** Once the bot enters a new guild, see if we need to create a new document
	 * @param guildId The GuildID of the server
	*/
	public static async onGuildCreate(guild: Guild): Promise<void> {
		await ObjectRelationalMap.onGuildCreate(DataModel, guild);
		Mentionable.initialize(guild);
	}

	/** Once the bot leaves a guild, see if we need to delete a document
	 * @param guildId The GuildID of the server
	*/
	public static async onGuildDelete(guild: Guild): Promise<void> {
		delete Mentionable.hasChanged[guild.id];
		delete Mentionable.mentionablesCache[guild.id];
		delete Mentionable.activeCooldowns[guild.id];

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

	/** Once a cooldown of a mentionable expires. Update the role to allow everyone to mention this role again.
	 * @param role The role of the expired mentionable
	 * @returns Wether or not the role has been updated successfully
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
