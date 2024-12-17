import {
	Collection,
	StringSelectMenuInteraction,
	ChannelSelectMenuInteraction,
	UserSelectMenuInteraction,
	MentionableSelectMenuInteraction,
	RoleSelectMenuInteraction,
} from "discord.js";
import { IButtonCollectionField, ISelectMenuCollectionField, ICommandField, IContextMenuField, CommandObject, ContextMenuCommandObject, ButtonComponentObject, AnySelectMenuComponentObject } from "../handlers/commandBuilder";

declare module "discord.js" {
	interface Client {
		commands: Collection<string, ICommandField>;
		contextMenus: Collection<string, IContextMenuField>;
		buttons: Collection<string, IButtonCollectionField>;
		selectMenus: Collection<string, ISelectMenuCollectionField>;

		// commandObjects: Collection<string, CommandObject>;
		// contextMenuObjects: Collection<string, ContextMenuCommandObject>;
		// buttonObjects: Collection<string, ButtonComponentObject>;
		// selectMenuObjects: Collection<string, AnySelectMenuComponentObject>;
	}
}

declare type AnyComponentInteraction = StringSelectMenuInteraction|ChannelSelectMenuInteraction|UserSelectMenuInteraction|MentionableSelectMenuInteraction|RoleSelectMenuInteraction
declare type InteractionDataType =
| 'command'
| 'contextMenu'
| 'button'
| 'selectMenu';