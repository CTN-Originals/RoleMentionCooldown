import type {
	Collection,
	StringSelectMenuInteraction,
	ChannelSelectMenuInteraction,
	UserSelectMenuInteraction,
	MentionableSelectMenuInteraction,
	RoleSelectMenuInteraction,
} from 'discord.js';
import type { CommandInteractionData, BaseButtonCollection, BaseEmbedCollection, BaseMethodCollection, BaseSelectMenuCollection } from '../handlers/commandBuilder';
import { IButtonCollectionField, ISelectMenuCollectionField, ICommandField, IContextMenuField, CommandObject, ContextMenuCommandObject, ButtonComponentObject, AnySelectMenuComponentObject } from '../handlers/commandBuilder';

declare module 'discord.js' {
	interface Client {
		// commands: Collection<string, ICommandField>;
		// contextMenus: Collection<string, IContextMenuField>;
		// buttons: Collection<string, IButtonCollectionField>;
		// selectMenus: Collection<string, ISelectMenuCollectionField>;
		
		commands: Collection<string, CommandInteractionData<BaseButtonCollection, BaseSelectMenuCollection, BaseEmbedCollection, BaseMethodCollection>>;

		//? lookup tables
		//> <component ID, command name of the command that holds this component>
		buttons: Collection<string, string>; 
		selectMenus: Collection<string, string>;
	}

	declare type ComponentValue = string | string[] | Message | Message[] | Role | Role[] | Channel | Channel[] | User | User[];
}

declare type AnyComponentInteraction = StringSelectMenuInteraction|ChannelSelectMenuInteraction|UserSelectMenuInteraction|MentionableSelectMenuInteraction|RoleSelectMenuInteraction
declare type InteractionDataType =
| 'command'
| 'contextMenu'
| 'button'
| 'selectMenu';
