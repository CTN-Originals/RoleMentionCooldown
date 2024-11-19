import {
	Collection,
	StringSelectMenuInteraction, ChannelSelectMenuInteraction, UserSelectMenuInteraction, MentionableSelectMenuInteraction, RoleSelectMenuInteraction,
} from "discord.js";

declare module "discord.js" {
	export interface Client {
		commands: Collection<any, any>;
	}
}

export type AnyComponentInteraction = StringSelectMenuInteraction|ChannelSelectMenuInteraction|UserSelectMenuInteraction|MentionableSelectMenuInteraction|RoleSelectMenuInteraction
