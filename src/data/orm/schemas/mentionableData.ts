import { Document, Schema, SchemaDefinitionProperty, model } from "mongoose";

export type IMentionableItem = {
	cooldown: number,
	lastUsed: number, //? the milisecond time code of when the mentionable was last mentioned
}
export type IMentionableStorage = {
	[mentionable: string]: IMentionableItem
}


export interface IMentionableData extends Document {
	_id: string,
	mentionables: IMentionableStorage
}
const MentionablesData = new Schema<IMentionableData>({
	_id: String,
	mentionables: {type: Object, default: {}} as SchemaDefinitionProperty,
})

export default model<IMentionableData>('Mentionables', MentionablesData);