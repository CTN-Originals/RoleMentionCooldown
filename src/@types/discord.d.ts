import {
	Collection,
	StringSelectMenuInteraction,
	ChannelSelectMenuInteraction,
	UserSelectMenuInteraction,
	MentionableSelectMenuInteraction,
	RoleSelectMenuInteraction,
} from "discord.js";
import { IButtonCollectionField, ISelectMenuCollectionField, ICommandField, IContextMenuField } from "../handlers/commandBuilder";

declare module "discord.js" {
	interface Client {
		commands: Collection<string, ICommandField>;
		contextMenus: Collection<string, IContextMenuField>;
		buttons: Collection<string, IButtonCollectionField>;
		selectMenus: Collection<string, ISelectMenuCollectionField>;
	}
}

declare type AnyComponentInteraction = StringSelectMenuInteraction|ChannelSelectMenuInteraction|UserSelectMenuInteraction|MentionableSelectMenuInteraction|RoleSelectMenuInteraction
declare type InteractionDataType =
| 'command'
| 'contextMenu'
| 'button'
| 'selectMenu';