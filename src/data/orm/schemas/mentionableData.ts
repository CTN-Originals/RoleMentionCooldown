import type { Document, SchemaDefinitionProperty} from 'mongoose'
import { Schema, model } from 'mongoose'

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
	channel: {[channelId: string]: number},

	/** All the channels that it was last used in
	 * @key The user ID
	 * @value The Universal Time Code of when this user last used this mentionable
	*/
	user: {[userId: string]: number}
}

//?? Should i include "none" to makr it as not set so that when /mention is used, the validation can skip over it?
export const UsageScopeType = {
  NONE:  'none',
  ALLOW: 'allow',
  DENY:  'deny'
} as const
export type TUsageScopeType = typeof UsageScopeType[keyof typeof UsageScopeType];

export type UsageScopeData = {
	/** Wether the channel scope contains channels that allow or deny usage */
	channelScopeType: TUsageScopeType,
	channelScope: string[],

	/** Wether the role scope contains roles that are allowed or denied usage */
	roleScopeType: TUsageScopeType,
	roleScope: string[],
}


export type IMentionableItem = {
	cooldownTime: CooldownDefinition<number>,
	lastUsedData: LastUsedData,
	usageScope: UsageScopeData
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
  _id:          String,
  mentionables: {type: Object, default: {}} as SchemaDefinitionProperty,
}, {timestamps: true})
//#endregion

export default model<IMentionableData>('Mentionables', MentionablesData)