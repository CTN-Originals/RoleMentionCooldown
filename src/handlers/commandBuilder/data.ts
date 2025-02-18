import type {
	AnySelectMenuInteraction,
	ApplicationCommandType,
	ButtonInteraction,
	ChannelSelectMenuBuilder,
	ChannelSelectMenuInteraction,
	ChatInputCommandInteraction,
	ContextMenuCommandBuilder,
	Interaction,
	MentionableSelectMenuBuilder,
	MentionableSelectMenuInteraction,
	MessageContextMenuCommandInteraction,
	RoleSelectMenuBuilder,
	RoleSelectMenuInteraction,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	UserContextMenuCommandInteraction,
	UserSelectMenuBuilder,
	UserSelectMenuInteraction
} from 'discord.js';
import {
	ButtonBuilder,
	ComponentType
} from 'discord.js';
import type {
	AnyComponentObject,
	AnyContextMenuInteraction,
	AnyInteractionObject,
	AnySelectMenuComponentBuilder,
	AnySelectMenuComponentObject,
	ButtonComponentObject,
	IAnyInteractionObject,
	IAnySelectMenuComponentObject,
	IButtonComponentObject,
	ICommandObject,
	IContextMenuCommandObject,
	TLogEnvironment,
	TLogLevel
} from '.';
import {
	ChannelSelectComponentObject,
	CommandObject,
	ContextMenuCommandObject,
	getInteractionObject,
	LOG_ENVIRONMENT,
	LOG_LEVEL,
	MentionableSelectComponentObject,
	RoleSelectComponentObject,
	StringSelectComponentObject,
	UserSelectComponentObject
} from '.';
import { includesAll } from '../../utils';
import type { IChannelSelectComponentObject, IMentionableSelectComponentObject, IRoleSelectComponentObject, IStringSelectComponentObject, IUserSelectComponentObject } from './components';


//#region Interaction Content
type InteractionExecute<TInteraction extends Interaction = Interaction> = (interaction: TInteraction) => any | Promise<any>;

export enum IBaseInteractionType {
	Command = 1,
	ContextMenu = 2,
}
export interface IBaseInteractionField<T extends IBaseInteractionType> {
	interactionType?: T;
}

type DataExtendent<TRaw extends boolean = true, T extends IBaseInteractionType = IBaseInteractionType.Command> = 
	T extends IBaseInteractionType.Command ? 
		TRaw extends true ? Exclude<IAnyInteractionObject, IContextMenuCommandObject> : Exclude<AnyInteractionObject, ContextMenuCommandObject> :
		TRaw extends true ? IContextMenuCommandObject : ContextMenuCommandObject
		// TRaw extends true ? (ICommandObject | IAnyComponentObject) : CommandObject | AnyComponentObject :
		// TRaw extends true ? IContextMenuCommandObject : ContextMenuCommandObject
;

type CommandInteractionContentInput<
	TContent extends DataExtendent<true, T>,
	TData extends DataExtendent<false, T>,
	TInteraction extends Interaction = Interaction,
	T extends IBaseInteractionType = IBaseInteractionType.Command
> = Omit<RequiredFields<CommandInteractionContent<TContent, TData, TInteraction, T>, 'content' | 'execute'>, 'data'>;

export class CommandInteractionContent<
	TContent extends DataExtendent<true, T>,
	TData extends DataExtendent<false, T>,
	TInteraction extends Interaction = Interaction,
	T extends IBaseInteractionType = IBaseInteractionType.Command,
> implements IBaseInteractionField<T>  {
	public content: TContent;
	public data: TData;
	public execute: InteractionExecute<TInteraction>;

	/** Define when to log the interaction
	 * @requires {@linkcode LOG_LEVEL} from {@linkcode src/handlers/commandBuilder/index.ts}
	 * @example logInteraction = LOG_CONDITION.ON_FAIL | LOG_CONDITION.ON_ERROR;
	*/
	public logLevel?: TLogLevel = LOG_LEVEL.ALWAYS;

	/** Define when to log the interaction
	 * @requires {@linkcode LOG_ENVIRONMENT} from {@linkcode src/handlers/commandBuilder/index.ts}
	 * @example logInteraction = LOG_ENV_CONDITION.DEVELOPMENT | LOG_ENV_CONDITION.PRODUCTION;
	*/
	public logEnvironment?: TLogLevel = LOG_ENVIRONMENT.ALL;

	public interactionType?: T;

	constructor(input: CommandInteractionContentInput<TContent, TData, TInteraction, T>) {
		this.content = input.content;
		this.execute = input.execute;

		this.data = getInteractionObject(this.content) as TData;
	}
}

const obj: CommandInteractionContentInput<ICommandObject, CommandObject, ChatInputCommandInteraction> = {
	content: {
		name:        '',
		description: 'awd'
	},
	execute: () => {}
};
//#endregion

//#region Base Classes
/** @link Source: https://stackoverflow.com/a/70510920 */
type CheckFields<T, TField> = {
	[K in keyof T]: T[K] extends Function ?
	any : TField
}

/** 
 * @requires content > name, description
 * @requires execute
*/
export type ICommandField = CommandInteractionContentInput<ICommandObject, CommandObject, ChatInputCommandInteraction>;

/** 
 * @requires content > name, type
 * @requires execute
 * @requires interactionType
*/
export type IContextMenuField<T extends (ApplicationCommandType.Message | ApplicationCommandType.User) = ApplicationCommandType.Message | ApplicationCommandType.User> = 
CommandInteractionContentInput<IContextMenuCommandObject, ContextMenuCommandObject,
	T extends ApplicationCommandType.Message ? MessageContextMenuCommandInteraction : 
	T extends ApplicationCommandType.User ? UserContextMenuCommandInteraction : 
	MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction,
IBaseInteractionType.ContextMenu>;

/** 
 * @requires content > customId, label | emoji
 * @requires execute
*/
export type IButtonCollectionField = CommandInteractionContentInput<IButtonComponentObject, ButtonComponentObject, ButtonInteraction>
export type IButtonCollection<T> = CheckFields<T, IButtonCollectionField>

export type PickSelectMenuInputComponentTypeFromComponent<T extends ComponentType = ComponentType.StringSelect> = 
	T extends ComponentType.StringSelect ? IStringSelectComponentObject :
	T extends ComponentType.UserSelect ? IUserSelectComponentObject :
	T extends ComponentType.RoleSelect ? IRoleSelectComponentObject :
	T extends ComponentType.MentionableSelect ? IMentionableSelectComponentObject :
	T extends ComponentType.ChannelSelect ? IChannelSelectComponentObject : IAnySelectMenuComponentObject;

export type PickSelectMenuComponentTypeFromComponent<T extends ComponentType = ComponentType.StringSelect> = 
	T extends ComponentType.StringSelect ? StringSelectComponentObject :
	T extends ComponentType.UserSelect ? UserSelectComponentObject :
	T extends ComponentType.RoleSelect ? RoleSelectComponentObject :
	T extends ComponentType.MentionableSelect ? MentionableSelectComponentObject :
	T extends ComponentType.ChannelSelect ? ChannelSelectComponentObject : AnyComponentObject;

export type PickSelectMenuInteractionTypeFromComponent<T extends ComponentType = ComponentType.StringSelect> = 
	T extends ComponentType.StringSelect ? StringSelectMenuInteraction :
	T extends ComponentType.UserSelect ? UserSelectMenuInteraction :
	T extends ComponentType.RoleSelect ? RoleSelectMenuInteraction :
	T extends ComponentType.MentionableSelect ? MentionableSelectMenuInteraction :
	T extends ComponentType.ChannelSelect ? ChannelSelectMenuInteraction : AnySelectMenuInteraction;

export type PickSelectMenuBuilderTypeFromComponent<T extends ComponentType = ComponentType.StringSelect> = 
	T extends ComponentType.StringSelect ? StringSelectMenuBuilder :
	T extends ComponentType.UserSelect ? UserSelectMenuBuilder :
	T extends ComponentType.RoleSelect ? RoleSelectMenuBuilder :
	T extends ComponentType.MentionableSelect ? MentionableSelectMenuBuilder :
	T extends ComponentType.ChannelSelect ? ChannelSelectMenuBuilder : AnySelectMenuComponentBuilder;

export type PickSelectMenuBuilderTypeFromComponentObject<T extends IAnySelectMenuComponentObject = IStringSelectComponentObject> = 
	T extends IStringSelectComponentObject ? StringSelectMenuBuilder :
	T extends IUserSelectComponentObject ? UserSelectMenuBuilder :
	T extends IRoleSelectComponentObject ? RoleSelectMenuBuilder :
	T extends IMentionableSelectComponentObject ? MentionableSelectMenuBuilder :
	T extends IChannelSelectComponentObject ? ChannelSelectMenuBuilder : IAnySelectMenuComponentObject;


/** 
 * @requires content > customId, type
 * @requires execute
*/
export type ISelectMenuCollectionField<T extends ComponentType = ComponentType.StringSelect> = CommandInteractionContentInput<PickSelectMenuInputComponentTypeFromComponent<T>, PickSelectMenuComponentTypeFromComponent<T>, PickSelectMenuInteractionTypeFromComponent<T>>
export type ISelectMenuCollection<T> = CheckFields<T, ISelectMenuCollectionField<ComponentType>>

export type IAnyInteractionField =
| ICommandField
| IContextMenuField
| IButtonCollectionField
| ISelectMenuCollectionField<ComponentType>;

export class BaseComponentCollection<TContent extends IButtonComponentObject | IAnySelectMenuComponentObject, TData extends CommandObject | AnyComponentObject> {
	public asArray() {
		const out: CommandInteractionContentInput<TContent, TData>[] = [];
		for (const field in this) {
			out.push(this[field] as CommandInteractionContentInput<TContent, TData>);
		}

		return out;
	}
}
export class BaseButtonCollection extends BaseComponentCollection<IButtonComponentObject, ButtonComponentObject> {
	/** Builds and returns a button with the content provided */
	public buildOne(content: IButtonComponentObject | IButtonCollectionField): ButtonBuilder {
		if (includesAll(Object.keys(content), ['content', 'execute'])) {
			content = (content as IButtonCollectionField).content;
		}

		return new ButtonBuilder(content as IButtonComponentObject);
	}
	
	/** Builds and returns the buttons with the content provided */
	public getBuild(...content: (IButtonComponentObject | IButtonCollectionField)[]): ButtonBuilder[] {
		return content.map(btn => this.buildOne(btn as IButtonComponentObject | IButtonCollectionField));
	}
	
	public build() {
		return this.getBuild(...this.asArray().map(btn => btn.content));
	}
}

export class BaseSelectMenuCollection extends BaseComponentCollection<IAnySelectMenuComponentObject, AnySelectMenuComponentObject> {
	/** Creates and builds a select menu with the content provided */
	public buildOne<T extends AnySelectMenuComponentBuilder>(content: 
		T extends StringSelectMenuBuilder ? IStringSelectComponentObject : 
		T extends UserSelectMenuBuilder ? IUserSelectComponentObject :
		T extends RoleSelectMenuBuilder ? IRoleSelectComponentObject :
		T extends MentionableSelectMenuBuilder ? IMentionableSelectComponentObject :
		T extends ChannelSelectMenuBuilder ? IChannelSelectComponentObject :
		IAnySelectMenuComponentObject
	): T {
	// public buildOne<T extends AnySelectMenuComponentBuilder>(content: IAnySelectMenuComponentObject): PickSelectMenuBuilderTypeFromComponentObject<typeof content> {
		switch (content.type) {
			case ComponentType.StringSelect: 		{ return new StringSelectComponentObject(content).build() as ReturnType<typeof this.buildOne<T>>; }
			case ComponentType.UserSelect: 			{ return new UserSelectComponentObject(content).build() as ReturnType<typeof this.buildOne<T>>; }
			case ComponentType.RoleSelect: 			{ return new RoleSelectComponentObject(content).build() as ReturnType<typeof this.buildOne<T>>; }
			case ComponentType.MentionableSelect: 	{ return new MentionableSelectComponentObject(content).build() as ReturnType<typeof this.buildOne<T>>; }
			case ComponentType.ChannelSelect: 		{ return new ChannelSelectComponentObject(content).build() as ReturnType<typeof this.buildOne<T>>; }
		}
	}

	public build() {
		const out: AnySelectMenuComponentBuilder[] = [];
		
		for (const select of this.asArray()) {
			out.push(this.buildOne(select.content));
		}

		return out;
	}
}
export class BaseEmbedCollection {}
export class BaseMethodCollection {}
//#endregion



type ICommandInteractionDataBuild = { command: SlashCommandBuilder | ContextMenuCommandBuilder, buttons: ButtonBuilder[], selectMenus: AnySelectMenuComponentBuilder[] };
type IOptionalCollection<Field, Extend> = Field extends Extend ? Field : undefined
type IOptionalCollectionObject<Field, Extend> = Field extends Extend ? Omit<Field, 'asArray' | 'build'> : undefined;
type DataCollectionTypes = 'button' | 'selectMenu' | 'embed' | 'method';

export type ICommandObjectContent = CommandInteractionContent<ICommandObject, CommandObject, ChatInputCommandInteraction>;
export type IContextMenuObjectContent = CommandInteractionContent<IContextMenuCommandObject, ContextMenuCommandObject, AnyContextMenuInteraction, IBaseInteractionType.ContextMenu>;

type PickCommandOrContextMenuContent<T extends IBaseInteractionType = IBaseInteractionType.Command> =
	T extends IBaseInteractionType.Command ?  ICommandObjectContent :
	T extends IBaseInteractionType.ContextMenu ?  IContextMenuObjectContent : 
	ICommandObjectContent |  IContextMenuObjectContent
;
type PickCommandOrContextMenuInput<T extends IBaseInteractionType = IBaseInteractionType.Command> =
	T extends IBaseInteractionType.Command ? ICommandField :
	T extends IBaseInteractionType.ContextMenu ? IContextMenuField : 
	ICommandField | IContextMenuField
;


type ICommandInteractionData<
	TButtons extends BaseButtonCollection = never,
	TSelectMenus extends BaseSelectMenuCollection = never,
	TEmbeds extends BaseEmbedCollection = never,
	TMethods extends BaseMethodCollection = never
> = RequiredFields<
	Partial<Pick<ICommandInteractionDataInput<TButtons, TSelectMenus, TEmbeds, TMethods>, 'buttons' | 'selectMenus' | 'embeds' | 'methods'>> &
	Pick<ICommandInteractionDataInput<TButtons, TSelectMenus, TEmbeds, TMethods>, 'command'>, 'command'
>;

//? this is the actual input fields and how to write them in the end result, 
//? this class exist to dictate how fields are written 
//? and to prevent type loss due to an underscore (_) before a variable for example
abstract class ICommandInteractionDataInput<
	TButtons extends BaseButtonCollection = never,
	TSelectMenus extends BaseSelectMenuCollection = never,
	TEmbeds extends BaseEmbedCollection = never,
	TMethods extends BaseMethodCollection = never,
> {
	public interactionType: IBaseInteractionType = IBaseInteractionType.Command;
	public command!: PickCommandOrContextMenuInput<typeof this.interactionType>;
	public buttons?: TButtons;
	public selectMenus?: TSelectMenus;
	public embeds?: TEmbeds;
	public methods?: TMethods;
}

export class CommandInteractionData<
	TButtons extends BaseButtonCollection = never,
	TSelectMenus extends BaseSelectMenuCollection = never,
	TEmbeds extends BaseEmbedCollection = never,
	TMethods extends BaseMethodCollection = never,
> {
	public interactionType: IBaseInteractionType = IBaseInteractionType.Command;
	
	public logLevel: TLogLevel = LOG_LEVEL.ALWAYS;
	public logEnvironment: TLogEnvironment = LOG_ENVIRONMENT.ALL;

	private _command: PickCommandOrContextMenuInput<typeof this.interactionType>;
	private _buttons?: TButtons;
	private _selectMenus?: TSelectMenus;
	private _embeds?: TEmbeds;
	private _methods?: TMethods;

	constructor(input: ICommandInteractionData<TButtons, TSelectMenus, TEmbeds, TMethods>) {
		this.interactionType = input.command.interactionType ?? IBaseInteractionType.Command as IBaseInteractionType;
		
		this.logLevel = input.command.logLevel ?? LOG_LEVEL.ALWAYS;
		this.logEnvironment = input.command.logEnvironment ?? LOG_ENVIRONMENT.ALL;

		this._command = input.command;

		if (input.buttons) { this._buttons = input.buttons as IOptionalCollection<TButtons, BaseButtonCollection>; }
		if (input.selectMenus) { this._selectMenus = input.selectMenus as IOptionalCollection<TSelectMenus, BaseSelectMenuCollection>; }
		if (input.embeds) { this._embeds = input.embeds as IOptionalCollection<TEmbeds, BaseEmbedCollection>; }
		if (input.methods) { this._methods = input.methods as IOptionalCollection<TMethods, BaseMethodCollection>; }
 
		for (const field in input) {
			if (['command', 'interactionType', 'buttons', 'selectMenus', 'embeds', 'methods'].includes(field)) { continue; } //? dont set fields that are already set above here
			this[field] = input[field];
		}
	}

	//#region Getters
	public get command(): PickCommandOrContextMenuContent<typeof this.interactionType> {
		switch (this.interactionType) {
			case IBaseInteractionType.Command: {
				return new CommandInteractionContent<ICommandObject, CommandObject, ChatInputCommandInteraction>(this._command as ICommandField);
			}
			case IBaseInteractionType.ContextMenu: { 
				return new CommandInteractionContent<IContextMenuCommandObject, ContextMenuCommandObject, AnyContextMenuInteraction, IBaseInteractionType.ContextMenu>(this._command as IContextMenuField);
			}
		}
	}

	public get buttons(): IOptionalCollectionObject<TButtons, BaseButtonCollection> {
		return this._buttons as IOptionalCollectionObject<TButtons, BaseButtonCollection>;
	}
	public get selectMenus(): IOptionalCollectionObject<TSelectMenus, BaseSelectMenuCollection> {
		return this._selectMenus as IOptionalCollectionObject<TSelectMenus, BaseSelectMenuCollection>;
	}
	public get embeds(): IOptionalCollectionObject<TEmbeds, BaseEmbedCollection> {
		return this._embeds as IOptionalCollectionObject<TEmbeds, BaseEmbedCollection>;
	}
	public get methods(): IOptionalCollectionObject<TMethods, BaseMethodCollection> {
		return this._methods as IOptionalCollectionObject<TMethods, BaseMethodCollection>;
	}

	public get collection() {
		return {
			buttons:     this._buttons as IOptionalCollection<TButtons, BaseButtonCollection>,
			selectMenus: this._selectMenus as IOptionalCollection<TSelectMenus, BaseSelectMenuCollection>,
			embeds:      this._embeds as IOptionalCollection<TEmbeds, BaseSelectMenuCollection>,
			methods:     this._methods as IOptionalCollection<TMethods, BaseSelectMenuCollection>,
		};
	}
	//#endregion

	//#region Setters
	public set command(value: PickCommandOrContextMenuInput<typeof this.interactionType>) {
		this._command = value;
	}

	public set buttons(value: TButtons) {
		this._buttons = value;
	}
	public set selectMenus(value: TSelectMenus) {
		this._selectMenus = value;
	}
	public set embeds(value: TEmbeds) {
		this._embeds = value;
	}
	public set methods(value: TMethods) {
		this._methods = value;
	}
	//#endregion

	//#region Build
	public buildCommand(): ICommandInteractionDataBuild['command'] {
		if (this.interactionType === IBaseInteractionType.Command) {
			return new CommandObject((this._command as unknown as ICommandField).content).build();
		}
		else {
			return new ContextMenuCommandObject((this._command as unknown as IContextMenuField).content).build();
		}
	}
	public buildButtons(): ICommandInteractionDataBuild['buttons'] {
		return this._buttons?.build() ?? [];
	}
	public buildSelectMenus(): ICommandInteractionDataBuild['selectMenus'] {
		return this._selectMenus?.build() ?? [];
	}

	public build(): ICommandInteractionDataBuild {
		return {
			command:     this.buildCommand(),
			buttons:     this.buildButtons() ,
			selectMenus: this.buildSelectMenus(),
		};
	}
	//#endregion
}
