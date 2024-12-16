//#region Imports
import {
	ApplicationCommandAttachmentOption,
	ApplicationCommandBooleanOption,
	ApplicationCommandChannelOption,
	ApplicationCommandMentionableOption,
	ApplicationCommandNumericOption,
	ApplicationCommandRoleOption,
	ApplicationCommandStringOption,
	ApplicationCommandUserOption,
	ButtonBuilder,
	ChannelSelectMenuBuilder,
	ComponentType,
	LocalizationMap,
	MentionableSelectMenuBuilder,
	RoleSelectMenuBuilder,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	StringSelectMenuBuilder,
	UserSelectMenuBuilder
} from "discord.js";

import {
	CommandObjectInput,
	BaseCommandObject,
	BaseExecutableCommandObject,
	ExecutableCommandObjectInput,
	IBaseExecutableCommandObject,
} from "./base";

import {
	CommandInteractionData,
	IBaseInteractionType,
	ICommandField,
	IContextMenuField,
	IButtonCollectionField,
	IButtonCollection,
	ISelectMenuCollectionField,
	ISelectMenuCollection,
	BaseComponentCollection,
	BaseButtonCollection,
	BaseSelectMenuCollection,
	BaseEmbedCollection,
	BaseMethodCollection,
	IAnyInteractionField,
	CommandInteractionContent
} from "./data";

import {
	CommandObject,
	ISubCommandGroupObject,
	SubCommandGroupObject,
	ISubCommandObject,
	SubCommandObject,
	ICommandObject,
} from "./command";

import {
	IContextMenuCommandObject,
	ContextMenuCommandObject,
} from "./contextMenus";

import { 
	AnySlashCommandOption,
	AttachmentOptionObject,
	BooleanOptionObject,
	ChannelOptionObject,
	IntegerOptionObject,
	MentionableOptionObject,
	NumberOptionObject,
	RoleOptionObject,
	StringOptionObject,
	UserOptionObject,
	BaseOptionObject,
} from "./options";

import {
	ButtonComponentObject,
	IButtonComponentObject,

	MentionableSelectComponentObject,
	RoleSelectComponentObject,
	StringSelectComponentObject,
	UserSelectComponentObject,
	IChannelSelectComponentObject,
	IMentionableSelectComponentObject,
	IRoleSelectComponentObject,
	IStringSelectComponentObject,
	IUserSelectComponentObject,
	ChannelSelectComponentObject
} from "./components";

import { includesAny } from "../../utils";

//#endregion

//#region Exports
export {
	CommandInteractionData,
	IBaseInteractionType,
	ICommandField,
	IContextMenuField,
	IButtonCollectionField,
	IButtonCollection,
	ISelectMenuCollectionField,
	ISelectMenuCollection,
	BaseComponentCollection,
	BaseButtonCollection,
	BaseSelectMenuCollection,
	BaseEmbedCollection,
	BaseMethodCollection,

	CommandObjectInput,
	BaseCommandObject,
	BaseExecutableCommandObject,
	ExecutableCommandObjectInput,
	IBaseExecutableCommandObject,
	
	ICommandObject,
	CommandObject,
	
	ISubCommandObject,
	SubCommandObject,
	
	ISubCommandGroupObject,
	SubCommandGroupObject,

	IContextMenuCommandObject,
	ContextMenuCommandObject,
	
	AnySlashCommandOption,
	AttachmentOptionObject,
	BooleanOptionObject,
	ChannelOptionObject,
	IntegerOptionObject,
	MentionableOptionObject,
	NumberOptionObject,
	RoleOptionObject,
	StringOptionObject,
	UserOptionObject,

	IButtonComponentObject,
	ButtonComponentObject,

	ChannelSelectComponentObject,
	MentionableSelectComponentObject,
	RoleSelectComponentObject,
	StringSelectComponentObject,
	UserSelectComponentObject
}

export type AnySlashCommandBuilder =
 | SlashCommandBuilder
 | SlashCommandSubcommandBuilder
 | SlashCommandSubcommandGroupBuilder;

export type AnyBuilder = 
 | AnySlashCommandBuilder
 | AnyComponentBuilder;

export type AnyComponentBuilder = 
 | ButtonBuilder
 | StringSelectMenuBuilder
 | UserSelectMenuBuilder
 | RoleSelectMenuBuilder
 | MentionableSelectMenuBuilder
 | ChannelSelectMenuBuilder;

export type AnyInteractionObject = 
| CommandObject
| ContextMenuCommandObject
| ButtonComponentObject
| AnySelectMenuComponentObject;

export type IAnyInteractionObject = 
| ICommandObject
| IContextMenuCommandObject
| IButtonComponentObject
| IAnySelectMenuComponentObject;

export type AnyComponentObject = 
 | ButtonComponentObject
 | StringSelectComponentObject
 | UserSelectComponentObject
 | RoleSelectComponentObject
 | MentionableSelectComponentObject
 | ChannelSelectComponentObject;

export type IAnyComponentObject = 
 | IButtonComponentObject
 | IStringSelectComponentObject
 | IUserSelectComponentObject
 | IRoleSelectComponentObject
 | IMentionableSelectComponentObject
 | IChannelSelectComponentObject;

export type AnyDiscordCommandOption = 
| ApplicationCommandChannelOption
| ApplicationCommandNumericOption
| ApplicationCommandStringOption
| ApplicationCommandRoleOption
| ApplicationCommandUserOption
| ApplicationCommandMentionableOption
| ApplicationCommandBooleanOption
| ApplicationCommandAttachmentOption;

export type AnySelectMenuComponentBuilder = Exclude<AnyComponentBuilder, ButtonBuilder>;
export type AnySelectMenuComponentObject = Exclude<AnyComponentObject, ButtonComponentObject>;
export type IAnySelectMenuComponentObject = Exclude<IAnyComponentObject, IButtonComponentObject>;
//#endregion

export function getInteractionObject(content: IAnyInteractionField): AnyInteractionObject | void {
	const dataKeys: string[] = Object.keys(content.data);
	if (dataKeys.includes('description')) { //- it must be a command
		return new CommandObject(content.data as ICommandObject);
	} else {
		if (!dataKeys.includes('customId')) { //- must be contextMenu
			return new ContextMenuCommandObject(content.data as IContextMenuCommandObject);
		} else {
			//? from here, it can only be a component
			if (includesAny(dataKeys, ['label', 'emoji'])) { //- Must be a button
				return new ButtonComponentObject(content.data as IButtonComponentObject);
			} else {
				switch (content.data['type'] as Omit<ComponentType, ComponentType.Button | ComponentType.ActionRow>) {
					case ComponentType.StringSelect: 		{ return new StringSelectComponentObject(content.data as any); }
					case ComponentType.UserSelect: 			{ return new UserSelectComponentObject(content.data as any); }
					case ComponentType.RoleSelect: 			{ return new RoleSelectComponentObject(content.data as any); }
					case ComponentType.MentionableSelect: 	{ return new MentionableSelectComponentObject(content.data as any); }
					case ComponentType.ChannelSelect: 		{ return new ChannelSelectComponentObject(content.data as any); }
				}
			}
		}
	}
}