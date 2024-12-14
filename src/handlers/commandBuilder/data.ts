import { AnySelectMenuInteraction, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ChannelSelectMenuInteraction, ChatInputCommandInteraction, ComponentType, ContextMenuCommandBuilder, Interaction, MentionableSelectMenuInteraction, MessageContextMenuCommandInteraction, RoleSelectMenuInteraction, SlashCommandBuilder, StringSelectMenuInteraction, UserContextMenuCommandInteraction, UserSelectMenuInteraction } from "discord.js";
import {
	ICommandObject,
	IButtonComponentObject,
	AnySelectMenuComponentBuilder,
	CommandObject,

	ButtonComponentObject,
	ChannelSelectComponentObject,
	IAnyComponentObject,
	IAnySelectMenuComponentObject,
	MentionableSelectComponentObject,
	RoleSelectComponentObject,
	StringSelectComponentObject,
	UserSelectComponentObject,
	IContextMenuCommandObject,
	ContextMenuCommandObject
} from ".";

type InteractionExecute<TInteraction extends Interaction = Interaction> = (interaction: TInteraction) => any | Promise<any>;

export enum IBaseInteractionType {
	Command = 1,
	ContextMenu = 2,
}
export interface IBaseInteractionField<T extends IBaseInteractionType> {
	interactionType?: T;
}

type DataExtendent<T extends IBaseInteractionType = IBaseInteractionType.Command> = T extends IBaseInteractionType.Command ? ICommandObject | IAnyComponentObject : IContextMenuCommandObject;
type CommandInteractionContentInput<T extends IBaseInteractionType, TData extends DataExtendent<T>, TInteraction extends Interaction = Interaction> = RequiredFields<CommandInteractionContent<T, TData, TInteraction>, 'data' | 'execute'>;
export interface CommandInteractionContent<
	T extends IBaseInteractionType,
	TData extends DataExtendent<T>,
	TInteraction extends Interaction = Interaction
> extends IBaseInteractionField<T>  {
	data: TData;
	execute: InteractionExecute<TInteraction>;
}

//#region Base Classes
/** @link Source: https://stackoverflow.com/a/70510920 */
type CheckFields<T, TField> = {
	[K in keyof T]: T[K] extends Function ?
	any : TField
}

/** 
 * @requires data > name, description
 * @requires execute
*/
export type ICommandField = CommandInteractionContentInput<IBaseInteractionType.Command, ICommandObject, ChatInputCommandInteraction>;
/** 
 * @requires data > name, type
 * @requires execute
 * @requires interactionType
*/
export type IContextMenuField<T extends (ApplicationCommandType.Message | ApplicationCommandType.User) = ApplicationCommandType.Message | ApplicationCommandType.User> = 
CommandInteractionContentInput<IBaseInteractionType.ContextMenu, IContextMenuCommandObject,
	T extends ApplicationCommandType.Message ? MessageContextMenuCommandInteraction : 
	T extends ApplicationCommandType.User ? UserContextMenuCommandInteraction : 
	MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction
>;

/** 
 * @requires data > customId, label | emoji
 * @requires execute
*/
export type IButtonCollectionField = CommandInteractionContentInput<IBaseInteractionType.Command, IButtonComponentObject, ButtonInteraction>
export type IButtonCollection<T> = CheckFields<T, IButtonCollectionField>

export type PickSelectMenuTypeFromComponent<T extends ComponentType = ComponentType.StringSelect> = 
T extends ComponentType.StringSelect ? StringSelectMenuInteraction :
T extends ComponentType.UserSelect ? UserSelectMenuInteraction :
T extends ComponentType.RoleSelect ? RoleSelectMenuInteraction :
T extends ComponentType.MentionableSelect ? MentionableSelectMenuInteraction :
T extends ComponentType.ChannelSelect ? ChannelSelectMenuInteraction : AnySelectMenuInteraction;

/** 
 * @requires data > customId, type
 * @requires execute
*/
export type ISelectMenuCollectionField<T extends ComponentType = ComponentType.StringSelect> = CommandInteractionContentInput<IBaseInteractionType.Command, IAnySelectMenuComponentObject, PickSelectMenuTypeFromComponent<T>>
export type ISelectMenuCollection<T> = CheckFields<T, ISelectMenuCollectionField>

export type IAnyInteractionField =
| ICommandField
| IContextMenuField
| IButtonCollectionField
| ISelectMenuCollectionField;

export class BaseComponentCollection<TData extends IButtonComponentObject | IAnySelectMenuComponentObject> {
	public asArray() {
		const out: CommandInteractionContentInput<IBaseInteractionType.Command, TData>[] = []
		for (const field in this) {
			out.push(this[field] as CommandInteractionContentInput<IBaseInteractionType.Command, TData>)
		}

		return out;
	}
}
export class BaseButtonCollection extends BaseComponentCollection<IButtonComponentObject> {
	public build() {
		const out: ButtonBuilder[] = [];

		for (const button of this.asArray()) {
			out.push(new ButtonComponentObject(button.data).build())
		}

		return out;
	}
}
export class BaseSelectMenuCollection extends BaseComponentCollection<IAnySelectMenuComponentObject> {
	public build() {
		const out: AnySelectMenuComponentBuilder[] = [];
		
		for (const select of this.asArray()) {
			let componentBuild: AnySelectMenuComponentBuilder;
			switch (select.data.type) {
				case ComponentType.StringSelect: 		{ componentBuild = new StringSelectComponentObject(select.data).build(); } break;
				case ComponentType.UserSelect: 			{ componentBuild = new UserSelectComponentObject(select.data).build(); } break;
				case ComponentType.RoleSelect: 			{ componentBuild = new RoleSelectComponentObject(select.data).build(); } break;
				case ComponentType.MentionableSelect: 	{ componentBuild = new MentionableSelectComponentObject(select.data).build(); } break;
				case ComponentType.ChannelSelect: 		{ componentBuild = new ChannelSelectComponentObject(select.data).build(); } break;
			}

			out.push(componentBuild);
		}

		return out;
	}
}
export class BaseEmbedCollection {}
export class BaseMethodCollection {}
//#endregion

type ICommandInteractionData<
	TButtons extends BaseButtonCollection = never,
	TSelectMenus extends BaseSelectMenuCollection = never,
	TEmbeds extends BaseEmbedCollection = never
> = RequiredFields<
	Partial<Pick<CommandInteractionData<TButtons, TSelectMenus, TEmbeds>, 'buttons' | 'selectMenus' | 'embeds' | 'methods'>> & Pick<CommandInteractionData<TButtons, TSelectMenus, TEmbeds>, 'command'>, 'command'
>;

type ICommandInteractionDataBuild = { command: SlashCommandBuilder | ContextMenuCommandBuilder, buttons: ButtonBuilder[], selectMenus: AnySelectMenuComponentBuilder[] };
type IOptionalCollection<Field, Extend> = Field extends Extend ? Field : undefined
type IOptionalCollectionObject<Field, Extend> = Field extends Extend ? Omit<Field, 'asArray' | 'build'> : undefined;
type DataCollectionTypes = 'button' | 'selectMenu' | 'embed' | 'method';
export class CommandInteractionData<
	TButtons extends BaseButtonCollection = never,
	TSelectMenus extends BaseSelectMenuCollection = never,
	TEmbeds extends BaseEmbedCollection = never,
	TMethods extends BaseEmbedCollection = never,
> {
	public interactionType: IBaseInteractionType;
	public command: 
		typeof this.interactionType extends IBaseInteractionType.ContextMenu ? IContextMenuField<Extract<typeof this.command.data, 'type'>> : 
		typeof this.interactionType extends IBaseInteractionType.Command ? ICommandField : ICommandField | IContextMenuField;
	private _buttons?: TButtons;
	private _selectMenus?: TSelectMenus;
	private _embeds?: TEmbeds;
	private _methods?: TMethods;


	constructor(input: ICommandInteractionData<TButtons, TSelectMenus, TEmbeds>) {
		this.command = input.command;
		this.interactionType = input.command.interactionType ?? IBaseInteractionType.Command;

		if (input.buttons) { this._buttons = input.buttons as IOptionalCollection<TButtons, BaseButtonCollection>; }
		if (input.selectMenus) { this._selectMenus = input.selectMenus as IOptionalCollection<TSelectMenus, BaseSelectMenuCollection>; }
		if (input.embeds) { this._embeds = input.embeds as IOptionalCollection<TEmbeds, BaseEmbedCollection> }
		if (input.methods) { this._embeds = input.embeds as IOptionalCollection<TEmbeds, BaseEmbedCollection> }
	}

	//#region Getters
	public get buttons(): IOptionalCollectionObject<TButtons, BaseButtonCollection> {
		return this._buttons as IOptionalCollectionObject<TButtons, BaseButtonCollection>;
	}
	public get selectMenus(): IOptionalCollectionObject<TSelectMenus, BaseSelectMenuCollection> {
		return this._selectMenus as IOptionalCollectionObject<TSelectMenus, BaseSelectMenuCollection>;
	}
	public get embeds(): IOptionalCollectionObject<TEmbeds, BaseEmbedCollection> {
		return this._embeds as IOptionalCollectionObject<TEmbeds, BaseEmbedCollection>;
	}
	public get methods(): IOptionalCollectionObject<TEmbeds, BaseEmbedCollection> {
		return this._methods as IOptionalCollectionObject<TEmbeds, BaseEmbedCollection>;
	}

	public getCollection(type: DataCollectionTypes) {
		switch (type) {
			case 'button': return this._buttons as IOptionalCollection<TButtons, BaseButtonCollection>;
			case 'selectMenu': return this._selectMenus as IOptionalCollection<TSelectMenus, BaseSelectMenuCollection>;
			case 'embed': return this._embeds as IOptionalCollection<TEmbeds, BaseEmbedCollection>;
			case 'method': return this._methods as IOptionalCollection<TMethods, BaseMethodCollection>;
		}
	}
	//#endregion

	//#region Setters
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
			return new CommandObject((this.command as unknown as ICommandField).data).build();
		}
		else {
			return new ContextMenuCommandObject((this.command as unknown as IContextMenuField).data).build();
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
			command: this.buildCommand(),
			buttons: this.buildButtons() ,
			selectMenus: this.buildSelectMenus(),
		}
	}
	//#endregion
}
