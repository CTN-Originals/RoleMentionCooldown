import { AnySelectMenuInteraction, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ChannelType, ChatInputCommandInteraction, ComponentType, ContextMenuCommandBuilder, ContextMenuCommandInteraction, EmbedBuilder, Interaction, MessageContextMenuCommandInteraction, SlashCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
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
	AnyBuilder,
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
export type IContextMenuField = CommandInteractionContentInput<IBaseInteractionType.ContextMenu, IContextMenuCommandObject, MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction>;

/** 
 * @requires data > customId, label | emoji
 * @requires execute
*/
export type IButtonCollectionField = CommandInteractionContentInput<IBaseInteractionType.Command, IButtonComponentObject, ButtonInteraction>
export type IButtonCollection<T> = CheckFields<T, IButtonCollectionField>

/** 
 * @requires data > customId, type
 * @requires execute
*/
export type ISelectMenuCollectionField = CommandInteractionContentInput<IBaseInteractionType.Command, IAnySelectMenuComponentObject, AnySelectMenuInteraction>
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
//#endregion

type ICommandInteractionData<
	TButtons extends BaseButtonCollection = never,
	TSelectMenus extends BaseSelectMenuCollection = never,
	TEmbeds extends BaseEmbedCollection = never
> = RequiredFields<
	Partial<Pick<CommandInteractionData<TButtons, TSelectMenus, TEmbeds>, 'buttons' | 'selectMenus' | 'embeds'>> & Pick<CommandInteractionData<TButtons, TSelectMenus, TEmbeds>, 'command'>, 'command'
>;

type ICommandInteractionDataBuild = { command: SlashCommandBuilder | ContextMenuCommandBuilder, buttons: ButtonBuilder[], selectMenus: AnySelectMenuComponentBuilder[] };
type IOptionalCollection<Field, Extend> = Field extends Extend ? Field : undefined
type IOptionalCollectionObject<Field, Extend> = Field extends Extend ? Omit<Field, 'asArray' | 'build'> : undefined
export class CommandInteractionData<
	TButtons extends BaseButtonCollection = never,
	TSelectMenus extends BaseSelectMenuCollection = never,
	TEmbeds extends BaseEmbedCollection = never
> {
	public interactionType: IBaseInteractionType;
	public command: ICommandField | IContextMenuField;
	private _buttons?: TButtons;
	private _selectMenus?: TSelectMenus;
	private _embeds?: TEmbeds;


	constructor(input: ICommandInteractionData<TButtons, TSelectMenus, TEmbeds>) {
		this.command = input.command;
		this.interactionType = input.command.interactionType ?? IBaseInteractionType.Command;

		if (input.buttons) { this._buttons = input.buttons as IOptionalCollection<TButtons, BaseButtonCollection>; }
		if (input.selectMenus) { this._selectMenus = input.selectMenus as IOptionalCollection<TSelectMenus, BaseSelectMenuCollection>; }
		if (input.embeds) { this._embeds = input.embeds as IOptionalCollection<TEmbeds, BaseEmbedCollection> }
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

	public get buttonCollection(): IOptionalCollection<TButtons, BaseButtonCollection> {
		return this._buttons as IOptionalCollection<TButtons, BaseButtonCollection>;
	}
	public get selectMenuCollection(): IOptionalCollection<TSelectMenus, BaseSelectMenuCollection> {
		return this._selectMenus as IOptionalCollection<TSelectMenus, BaseSelectMenuCollection>;
	}
	public get embedCollection(): IOptionalCollection<TEmbeds, BaseEmbedCollection> {
		return this._embeds as IOptionalCollection<TEmbeds, BaseEmbedCollection>;
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