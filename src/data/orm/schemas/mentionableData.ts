import { Document, Schema, SchemaDefinitionProperty, model } from "mongoose";

// export type IMentionableItem = {
// 	cooldown: number,
// 	lastUsed: number, //? the milisecond time code of when the mentionable was last mentioned
// }

//#region Types
export type CooldownDefinition<T> = {
	/** Cooldown for the whole server once used */
	global: T,
	/** Cooldown for the channel it was used in */
	channel: T,
	/** Cooldown for the user that used it */
	user: T
}

export type LastUsedData = {
	/** The Universal Time Code of when the mentionable was last used anywhere in the guild */
	global: number,

	/** All the channels that it was last used in
	 * @key The channel ID
	 * @value The Universal Time Code of when this mentionable was last used in this channel
	*/
	channels: {[channelId: string]: number},

	/** All the channels that it was last used in
	 * @key The user ID
	 * @value The Universal Time Code of when this user last used this mentionable
	*/
	users: {[userId: string]: number}
}

export type IMentionableItem = {
	cooldownTime: CooldownDefinition<number>,
	lastUsedData: LastUsedData,
}
export type IMentionableStorage = {
	[mentionable: string]: IMentionableItem
}
//#endregion


//#region Schema
export interface IMentionableData extends Document {
	_id: string,
	mentionables: IMentionableStorage
}
const MentionablesData = new Schema<IMentionableData>({
	_id: String,
	mentionables: {type: Object, default: {}} as SchemaDefinitionProperty,
}, {timestamps: true});
//#endregion

export default model<IMentionableData>('Mentionables', MentionablesData);