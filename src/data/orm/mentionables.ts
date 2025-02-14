import type { Guild } from 'discord.js'
import { ObjectRelationalMap } from '.'
import { eventConsole } from '../../events'
import { clamp } from '../../utils'
import type { IMentionableData, IMentionableItem, IMentionableStorage } from './schemas/mentionableData'
import { default as DataModel } from './schemas/mentionableData'

type MentionableCache<T> = {[id: string]: T};

export const ActiveCooldown = {
	global:  'global',
	channel: 'channel',
	user:    'user',
} as const
export type TActiveCooldown = keyof typeof ActiveCooldown;

export class Mentionable {
	/** true if the anything has updated sins getAll() was last called */
	public static hasChanged: MentionableCache<boolean> = {}
	
	/** Store the mentionable object here everytime getAll() is called while hasChanged is true 
	 * @note This is to save a bit of performance as the getAll function might be called for each message sent in any server.
	*/
	public static mentionablesCache: MentionableCache<IMentionableStorage> = {}
	
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
			const doc = await Mentionable.getDocument(guildId)

			Mentionable.mentionablesCache[guildId] = (Object.keys(doc.toObject()).includes('mentionables')) ? doc.mentionables : {}
			Mentionable.hasChanged[guildId] = false
		}

		return Mentionable.mentionablesCache[guildId]
	}

	/** Get a mentionable by ID
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @returns The mentionable if found, null otherwise
	*/
	public static async get(guildId: string, id: string): Promise<IMentionableItem|null|undefined> {
		const list = await Mentionable.getAll(guildId)
		if (list === null) { return null }
		return list[id]
	}

	/** Check if the mentionable is currently on cooldown
	 * @param cooldown The cooldown time
	 * @param lastUsed The time to compare with the cooldown
	 * @note both inputs can be null and will be read as 0 if null
	 * @returns true if the cooldown + lastUsed time is greater then/equal to the current time, false otherwise
	 * @example (cooldown + lastUsed >= Date.now())
	*/
	private static isTimeWithinCooldown(cooldown: number | null, lastUsed: number | null): boolean {
		return ((cooldown ?? 0) + (lastUsed ?? 0) >= Date.now())
	}

	/** Get the amount of cooldown time (in milliseconds) remaining
	 * @param cooldown The cooldown time
	 * @param lastUsed The time to compare with the cooldown
	 * @note both inputs can be null and will be read as 0 if null
	 * @returns The amount of cooldown time remaining (can be a negative)
	 * @example (lastUsed + cooldown) - Date.now()
	*/
	public static remainingCooldownTime(cooldown: number | null, lastUsed: number | null): number;
	/** Get the amount of cooldown time (in milliseconds) remaining
	 * @param mentionable The mentionable to get the data from
	 * @param field The field of the mentionable to check
	 * @returns The amount of cooldown time remaining (can be a negative)
	 * @example (lastUsed + cooldown) - Date.now()
	*/
	public static remainingCooldownTime(mentionable: IMentionableItem, field: Extract<TActiveCooldown, 'global'>): number;
	/** Get the amount of cooldown time (in milliseconds) remaining
	 * @param mentionable The mentionable to get the data from
	 * @param field The field of the mentionable to check
	 * @param id The channel/user ID if field is not "global"
	 * @returns The amount of cooldown time remaining (can be a negative)
	 * @example (lastUsed + cooldown) - Date.now()
	*/
	public static remainingCooldownTime(mentionable: IMentionableItem, field: Extract<TActiveCooldown, 'channel' | 'user'>, id: string): number;
	public static remainingCooldownTime(cooldown_mentionable: (number | null) | IMentionableItem, lastUsed_field: (number | null) | TActiveCooldown, id?: string): number {
		let cooldown = 0
		let lastUsed = 0

		if ((typeof cooldown_mentionable === 'number' || cooldown_mentionable === null) && (typeof lastUsed_field === 'number' || lastUsed_field === null)) {
			cooldown = (cooldown_mentionable ?? 0)
			lastUsed = (lastUsed_field ?? 0)
		}
		else if (cooldown_mentionable !== null && typeof lastUsed_field === 'string') {
			const mentionable = cooldown_mentionable as IMentionableItem
			const field = lastUsed_field as TActiveCooldown

			cooldown = mentionable.cooldownTime[field]

			if (field === ActiveCooldown.global) {
				lastUsed = mentionable.lastUsedData[field]
			}
			else if (Object.keys(mentionable.lastUsedData[field]).includes(id!)) {
				lastUsed = mentionable.lastUsedData[field][id!]
			}
		}

		return (lastUsed + cooldown) - Date.now()
	}
	
	/** Check if the mentionable is currently on cooldown
	 * @param mentionable The mentionable object
	 * @returns true if the mentionable is currently on cooldown, false otherwise
	*/
	public static isOncooldown(mentionable: IMentionableItem): boolean;
	/** Check if the mentionable is currently on cooldown
	 * @param mentionable The mentionable object
	 * @param channelId The ID of the channel to check the cooldown for
	 * @param userId The ID of the user to check the cooldown for
	 * @returns true if the mentionable is currently on cooldown, false otherwise
	*/
	public static isOncooldown(mentionable: IMentionableItem, channelId: string, userId: string): boolean;
	public static isOncooldown(mentionable: IMentionableItem, channelId?: string, userId?: string): boolean {
		const globalCooldown: boolean = this.isTimeWithinCooldown(mentionable.cooldownTime.global, mentionable.lastUsedData.global)
		if (globalCooldown || (!channelId || !userId || (!channelId && !userId))) {
			return globalCooldown
		}

		let channelCooldown: boolean = false
		if (Object.keys(mentionable.lastUsedData.channel).includes(channelId)) {
			channelCooldown = this.isTimeWithinCooldown(mentionable.cooldownTime.channel, mentionable.lastUsedData.channel[channelId])
		}

		let userCooldown: boolean = false
		if (Object.keys(mentionable.lastUsedData.user).includes(userId)) {
			userCooldown = this.isTimeWithinCooldown(mentionable.cooldownTime.user, mentionable.lastUsedData.user[userId])
		}


		return (channelCooldown || userCooldown)
	}

	/** Get the cooldown type that takes the longest overall to complete
	 * @param mentionable The mentionable object
	 * @param channelId The ID of the channel to check the cooldown for
	 * @param userId The ID of the user to check the cooldown for
	 * @returns The highest active cooldown if any, null otherwise
	*/
	public static getActiveCooldown(mentionable: IMentionableItem, channelId: string, userId: string): TActiveCooldown | null {
		if (Mentionable.isOncooldown(mentionable, channelId, userId) === false) {
			return null
		}

		let highestCooldown: TActiveCooldown | null = null
		let highestTime = 0
		
		for (const cooldownType of Object.keys(ActiveCooldown) as TActiveCooldown[]) {
			let remainingTime = 0

			if (cooldownType === ActiveCooldown.global) {
				remainingTime = Mentionable.remainingCooldownTime(mentionable, cooldownType)
			} else {
				const typeId = (cooldownType === ActiveCooldown.channel) ? channelId : userId
				if (Object.keys(mentionable.lastUsedData[cooldownType]).includes(typeId)) {
					remainingTime = Mentionable.remainingCooldownTime(mentionable, cooldownType, typeId)
				}
			}

			if (remainingTime > highestTime) {
				highestTime = remainingTime
				highestCooldown = cooldownType as TActiveCooldown
			}
		}

		return highestCooldown
	}

	/** Get the amount of time remaining on global cooldown
	 * @param mentionable The mentionable object
	 * @returns The amount of cooldown time remaining
	*/
	public static remainingCooldown(mentionable: IMentionableItem): number;
	/** Get the amount of time remaining on the longest active cooldown, if any
	 * @param mentionable The mentionable object
	 * @param channelId The ID of the channel to check the cooldown for
	 * @param userId The ID of the user to check the cooldown for
	 * @returns The amount of cooldown time remaining
	*/
	public static remainingCooldown(mentionable: IMentionableItem, channelId: string, userId: string): number;
	public static remainingCooldown(mentionable: IMentionableItem, channelId?: string, userId?: string): number {
		const globalTime = clamp(Mentionable.remainingCooldownTime(mentionable.cooldownTime.global, mentionable.lastUsedData.global), 0)
		
		if (!channelId || !userId || (!channelId && !userId)) {
			return globalTime
		}

		const activeCooldown = Mentionable.getActiveCooldown(mentionable, channelId, userId)
		if (!activeCooldown) {
			return 0
		}
		else if (activeCooldown === ActiveCooldown.global) {
			return globalTime
		}

		return Mentionable.remainingCooldownTime(mentionable.cooldownTime[activeCooldown], mentionable.lastUsedData[activeCooldown][(activeCooldown == 'channel') ? channelId : userId])
	}
	//#endregion
	

	//#region Actions
	/** Create a new document for a guild
	 * @param guildId The GuildID of the server
	 * @returns The mentionable if found, null otherwise
	*/
	public static async create(guildId: string): Promise<IMentionableData> {
		Mentionable.hasChanged[guildId] = true
		return await ObjectRelationalMap.create(DataModel, guildId)
	}

	/** When the bot starts up, run this function for each guild
	 *  @param guild The Guild to initialize
	*/
	public static async initialize(guild: Guild) {
		Mentionable.hasChanged[guild.id] = true
		Mentionable.mentionablesCache[guild.id] = {}
		// Mentionable.activeCooldowns[guild.id] = {};
		
		const mentionableDoc = await Mentionable.getDocument(guild.id, false)
		const mentionables = mentionableDoc.mentionables
		// const mentionables = await Mentionable.getAll(guild.id);
		// Mentionable.getAll(guild.id);

		//#region TMP remove block next patch
		type IOLDMentionableItem = {
			cooldown: number,
			lastUsed: number, //? the milisecond time code of when the mentionable was last mentioned
		}

		let hasChanged = false

		for (const id in mentionables) {
		  let mentionable: IOLDMentionableItem | IMentionableItem = mentionables[id]
		  if (Object.keys(mentionable).includes('cooldown')) {
		    mentionable = mentionable as unknown as IOLDMentionableItem
				
		    const newMentionable = Mentionable.make()
		    newMentionable.cooldownTime.global = mentionable.cooldown
		    newMentionable.lastUsedData.global = mentionable.lastUsed

		    mentionables[id] = newMentionable

		    eventConsole.log(`[fg=yellow]${guild.name}[/>] [fg=green]REFORMATTING[/>]: ${id} To the new database format`)

		    hasChanged = true
		  }
		}

		if (hasChanged) {
		  Mentionable.update(mentionableDoc)
		}
		//#endregion

		// //#region TMP reset role mentionable setting
		// //!! after its been pushed to beta and release, remove this the next patch
		// const selfMember: GuildMember = guild.members.me!;
		// const perm = new PermissionsBitField('ManageRoles');
		// if (selfMember.permissions.has(perm)) {
		// 	for (const roleId in mentionables) {
		// 		const role = guild.roles.cache.find(r => r.id == roleId);
		// 		if (!role) {
		// 			EmitError(new Error(`Unable to find role (${roleId})`));
		// 			continue;
		// 		}

		// 		if (role.mentionable) {
		// 			await role.setMentionable(false);
		// 			eventConsole.log(`[fg=yellow]${guild.name}[/>] [fg=red]RESETTING[/>]: [fg=${(role.hexColor != '#000000') ? role.hexColor : ColorTheme.colors.grey.asHex}]${role.name}[/>] to not mentionable`);
		// 		}
		// 	}

		// }
		// //#endregion
		
		// for (const roleId in mentionables) {
		// 	if (roleId == 'placeholder') { continue; } //?? this used to be a thing, keeping it for some reason... i wanna i guess....

		// 	const role = guild.roles.cache.find(r => r.id == roleId);
		// 	if (!role) {
		// 		EmitError(new Error(`Unable to find role (${roleId})`));
		// 		continue;
		// 	}

		// 	if (!role.mentionable) {
		// 		if (Mentionable.isOncooldown(mentionables[roleId])) {
		// 			if (GeneralData.development) {
		// 				eventConsole.log(`[fg=green]Restarting[/>] cooldown: [fg=${(role.hexColor != '#000000') ? role.hexColor : ColorTheme.colors.grey.asHex}]${role.name}[/>] | ${Mentionable.remainingCooldown(mentionables[roleId]) / 1000}s`)
		// 			}
		// 			Mentionable.startCooldown(guild, roleId, mentionables[roleId])
		// 		}
		// 		else {
		// 			if (GeneralData.development) {
		// 				eventConsole.log(`[fg=red]Expired[/>] cooldown: [fg=${(role.hexColor != '#000000') ? role.hexColor : ColorTheme.colors.grey.asHex}]${role.name}[/>] | ${Mentionable.remainingCooldown(mentionables[roleId]) / 1000}s`)
		// 			}
		// 			Mentionable.onCooldownExpired(role);
		// 		}
		// 	}
		// }
	}

	/**  Update the mentionable document
	 * @param doc The document to update
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async update(doc: Awaited<ReturnType<typeof Mentionable.getDocument>>): ReturnType<typeof ObjectRelationalMap.update>;
	/**  Update the mentionable document
	 *!@note This does not update the changes made correctly often times
	 * @param guildId The GuildID of the server the document is for
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async update(guildId: string): ReturnType<typeof ObjectRelationalMap.update>;
	public static async update(id_doc: string|Awaited<ReturnType<typeof Mentionable.getDocument>>): ReturnType<typeof ObjectRelationalMap.update> {
		if (typeof id_doc === 'string') {
			id_doc = await Mentionable.getDocument(id_doc)
		}

		Mentionable.hasChanged[id_doc._id] = true

		return await ObjectRelationalMap.update(DataModel, id_doc, ['mentionables'])
	}

	/** Make a new blank IMentionableItem object
	 * @note All values will be set to 0
	 * @note the channels and users objects both start with a placeholder item in them to prevent them from vanishing on the database
	*/
	public static make() {
		return {
			cooldownTime: {
				global:  0,
				channel: 0,
				user:    0,
			},
			lastUsedData: {
				global:  0,
				channel: { placeholder: 0 },
				user:    { placeholder: 0 }
			},
			usageScope: {
				channelScopeType: 'none',
				channelScope:     [],
				roleScopeType:    'none',
				roleScope:        []
			}
		} as IMentionableItem
	}

	/** Register a new mentionable
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @param data The data of the mentionable to register
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async add(guildId: string, id: string, data: IMentionableItem): Promise<boolean> {
		const doc = await Mentionable.getDocument(guildId)
		if (!doc) { return false }
		
		doc.mentionables[id] = data
		return await Mentionable.update(doc)
	}

	/** Edit a mentionable
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @param data The edited data
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async edit(guildId: string, id: string, data: IMentionableItem): Promise<boolean> {
		return await Mentionable.add(guildId, id, data)
	}

	/** Remove a mentionable
	 * @param guildId The GuildID of the server the mentionable is in
	 * @param id The ID of the mentionable
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async remove(guildId: string, id: string): Promise<boolean> {
		const doc = await Mentionable.getDocument(guildId)
		if (!doc || !Object.keys(doc.mentionables).includes(id)) { return false }

		delete doc.mentionables[id]
		return await Mentionable.update(doc)
	}
	//#endregion


	//#region Events

	/** Once the bot enters a new guild, see if we need to create a new document
	 * @param guildId The GuildID of the server
	*/
	public static async onGuildCreate(guild: Guild): Promise<void> {
		await ObjectRelationalMap.onGuildCreate(DataModel, guild)
		Mentionable.initialize(guild)
	}

	/** Once the bot leaves a guild, see if we need to delete a document
	 * @param guildId The GuildID of the server
	*/
	public static async onGuildDelete(guild: Guild): Promise<void> {
		delete Mentionable.hasChanged[guild.id]
		delete Mentionable.mentionablesCache[guild.id]
		// delete Mentionable.activeCooldowns[guild.id];

		await ObjectRelationalMap.onGuildDelete(DataModel, guild)
	}

	/** Once a mentionable is used. Updates its last used time and starts the cooldown 
	 * @param guild The guild that the mentionable is in
	 * @param id The ID of the mentionable
	 * @param channelId The channel ID that the mentionable was used in
	 * @param userId The user ID of the user that used the mentionable
	 * @returns Wether or not the data has been saved successfully
	*/
	public static async onUsed(guild: Guild, id: string, channelId: string, userId: string): Promise<boolean> {
		const doc = await Mentionable.getDocument(guild.id)
		const mentionable = doc.mentionables[id]

		if (!doc || !mentionable) { return false }

		const time = new Date().getTime()

		mentionable.lastUsedData.global = time
		mentionable.lastUsedData.channel[channelId] = time
		mentionable.lastUsedData.user[userId] = time
		// await Mentionable.startCooldown(guild, id, doc.mentionables[id]);
		return await Mentionable.update(doc)
	}
	//#endregion
}