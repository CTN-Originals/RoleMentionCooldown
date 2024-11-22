import { Schema, SchemaDefinitionProperty, model } from "mongoose";

export type IMentionableItem = {
	cooldown: number,
	lastUsed: number, //? the milisecond time code of when the mentionable was last mentioned
}
export type IMentionableStorage = {
	[mentionable: string]: IMentionableItem
}

const MentionablesData = new Schema({
	_id: String,
	mentionables: {type: Object, default: {}} as SchemaDefinitionProperty,
})

export default model('Mentionables', MentionablesData);