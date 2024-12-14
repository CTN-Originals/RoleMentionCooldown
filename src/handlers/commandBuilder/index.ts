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
	BaseCommandObject
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
	BaseMethodCollection
} from "./data";

import {
	CommandObjectInput
} from "./base";

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

	BaseCommandObject,
	CommandObjectInput,
	
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