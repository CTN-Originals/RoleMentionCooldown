//#region Imports
import type {
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
	MentionableSelectMenuBuilder,
	MessageContextMenuCommandInteraction,
	RoleSelectMenuBuilder,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	StringSelectMenuBuilder,
	UserContextMenuCommandInteraction,
	UserSelectMenuBuilder
} from 'discord.js';
import {
	ComponentType,
	LocalizationMap
} from 'discord.js';

import {
	CommandObjectInput,
	BaseCommandObject,
	BaseExecutableCommandObject,
	ExecutableCommandObjectInput,
	IBaseExecutableCommandObject,
} from './base';

import type {
	IAnyInteractionField} from './data';
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
	CommandInteractionContent,
	ICommandObjectContent,
	IContextMenuObjectContent,
} from './data';

import {
	CommandObject,
	ISubCommandGroupObject,
	SubCommandGroupObject,
	ISubCommandObject,
	SubCommandObject,
	ICommandObject,
} from './command';

import {
	IContextMenuCommandObject,
	ContextMenuCommandObject,
} from './contextMenus';

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
} from './options';

import type {
	IChannelSelectComponentObject,
	IMentionableSelectComponentObject,
	IRoleSelectComponentObject,
	IStringSelectComponentObject,
	IUserSelectComponentObject} from './components';
import {
	ButtonComponentObject,
	IButtonComponentObject,

	MentionableSelectComponentObject,
	RoleSelectComponentObject,
	StringSelectComponentObject,
	UserSelectComponentObject,
	ChannelSelectComponentObject
} from './components';

import { includesAny } from '../../utils';

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
	ICommandObjectContent,
	IContextMenuObjectContent,

	IButtonComponentObject,
	ButtonComponentObject,

	ChannelSelectComponentObject,
	MentionableSelectComponentObject,
	RoleSelectComponentObject,
	StringSelectComponentObject,
	UserSelectComponentObject
};

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

export type AnyContextMenuInteraction = MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction;

export const LOG_LEVEL = {
	/** Always log */
	ALWAYS:  0,
	/** Only log when the command was executed successfully */
	SUCCESS: 1 << 1,
	/** Only log when the command was rejected for any reason */
	FAIL:    1 << 2,
	/** Only log when the command threw and error */
	ERROR:   1 << 3,
	/** Never log */
	NEVER:   -1,
} as const;
export type TLogLevel = typeof LOG_LEVEL[keyof typeof LOG_LEVEL];

/** Define which environment the bot needs to be in to output a log */
export const LOG_ENVIRONMENT = {
	/** Always log */
	ALL:         0,
	DEVELOPMENT: 1 << 1,
	BETA:        1 << 2,
	PRODUCTION:  1 << 3,
} as const;
export type TLogEnvironment = typeof LOG_ENVIRONMENT[keyof typeof LOG_ENVIRONMENT];

//#endregion

export function getInteractionObject(content: IAnyInteractionField | IAnyInteractionObject): AnyInteractionObject | void {
	if (Object.keys(content).includes('content')) {
		content = content as IAnyInteractionField;
		content = content.content;
	}

	const dataKeys: string[] = Object.keys(content);
	if (dataKeys.includes('description')) { //- it must be a command
		return new CommandObject(content as ICommandObject);
	} else {
		if (!dataKeys.includes('customId')) { //- must be contextMenu
			return new ContextMenuCommandObject(content as IContextMenuCommandObject);
		} else {
			//? from here, it can only be a component
			if (includesAny(dataKeys, ['label', 'emoji'])) { //- Must be a button
				return new ButtonComponentObject(content as IButtonComponentObject);
			} else {
				switch (content['type'] as Omit<ComponentType, ComponentType.Button | ComponentType.ActionRow>) {
				case ComponentType.StringSelect: 		{ return new StringSelectComponentObject(content as any); }
				case ComponentType.UserSelect: 			{ return new UserSelectComponentObject(content as any); }
				case ComponentType.RoleSelect: 			{ return new RoleSelectComponentObject(content as any); }
				case ComponentType.MentionableSelect: 	{ return new MentionableSelectComponentObject(content as any); }
				case ComponentType.ChannelSelect: 		{ return new ChannelSelectComponentObject(content as any); }
				}
			}
		}
	}
}