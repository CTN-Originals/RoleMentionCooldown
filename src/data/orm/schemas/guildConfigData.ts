import { Document, Schema, SchemaDefinitionProperty, model } from "mongoose";

export interface IGuildConfigData extends Document {
	_id: string,
	adminRoles: string[]
}
export const GuildConfigData = new Schema({
	_id: String,
	adminRoles: {type: Array, default: []} as SchemaDefinitionProperty,
})

export default model<IGuildConfigData>('GuildConfig', GuildConfigData);