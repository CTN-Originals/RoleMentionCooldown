import { APIMessageComponentEmoji, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ComponentType, MentionableSelectMenuBuilder, RoleSelectMenuBuilder, SelectMenuComponentOptionData, StringSelectMenuBuilder, UserSelectMenuBuilder } from "discord.js";
import { AnyComponentBuilder, AnySelectMenuComponentBuilder } from ".";
import { EmitError } from "../../events";

type RequiredBaseFields = 'customId';
type OptionalBaseFields = 'disabled';

type ComponentObjectInput<
    T extends BaseComponentObject,
    Optional extends keyof T = never,
    Required extends keyof T = never
> = RequiredFields<
    Partial<Pick<T, Optional | OptionalBaseFields>> & Pick<T, RequiredBaseFields | Required>,
    RequiredBaseFields | Required
>;

//#region Base Classes
type IBaseComponentObject = ComponentObjectInput<BaseComponentObject>
export class BaseComponentObject {
	// public type?: ComponentType;
	public customId!: string;
	public disabled: boolean = false;

	constructor(input: IBaseComponentObject) {
		// this.type = input.type;
		this.customId = input.customId;

		if (input.disabled !== undefined) { this.disabled = input.disabled; }
	}

	protected assignFields(input: ComponentObjectInput<BaseComponentObject, any>) {
		for (const field in input) {
			this[field] = input[field];
		}
	}

	protected buildBase<T extends AnyComponentBuilder>(builder: T): T {
		const component = builder.setCustomId(this.customId) as T;

		if (this.disabled) { component.setDisabled(this.disabled); }

		return component;
	}

	protected onError(message: string): string {
		const err = new Error(message)
		EmitError(err);
		return err.message;
	}
}

type SelectComponentObjectInput<
	T extends BaseSelectComponentObject,
	Optional extends keyof T = never,
	Required extends keyof T = never
> = RequiredFields<
	Partial<Pick<T, OptionalBaseFields | Optional | 'minValues' | 'maxValues' | 'placeholder'>> & Pick<T, RequiredBaseFields | Required | 'type'>,
	RequiredBaseFields | Required | 'type'
>;
interface IBaseSelectComponentObject extends ComponentObjectInput<BaseSelectComponentObject, 'minValues' | 'maxValues' | 'placeholder', 'type'> {
	type: ComponentType;
}
class BaseSelectComponentObject extends BaseComponentObject {
	public type!: ComponentType;
	public minValues: number = 1;
	public maxValues: number = 1;
	public placeholder?: string;

	constructor(input: IBaseSelectComponentObject) {
		super(input);
		this.assignFields(input);
	}

	protected buildSelectMenuBase<T extends AnySelectMenuComponentBuilder>(builder: T): T {
		const component = this.buildBase(builder) as T;

		if (this.minValues) { component.setMinValues(this.minValues); }
		if (this.maxValues) { component.setMaxValues(this.maxValues); }
		if (this.placeholder) { component.setPlaceholder(this.placeholder); }

		return component;
	}
}
//#endregion


//#region Button
interface IButtonComponentObjectInput extends ComponentObjectInput<ButtonComponentObject, 'label' | 'style' | 'emoji'> {
	type?: ComponentType.Button;
}
export type IButtonComponentObject = IButtonComponentObjectInput & Either<{label: string}, {emoji: APIMessageComponentEmoji}> //? Require either label, or emoji to be present
export class ButtonComponentObject extends BaseComponentObject {
	public label?: string;
	public style: ButtonStyle = ButtonStyle.Primary;
	public emoji?: APIMessageComponentEmoji;

	constructor(input: IButtonComponentObject) {
		super(input);
		this.assignFields(input);
	}

	public build() {
		const component = this.buildBase(new ButtonBuilder());

		if (this.label) { component.setLabel(this.label); }
		if (this.style) { component.setStyle(this.style); }
		if (this.emoji) { component.setEmoji(this.emoji); }

		return component;
	}
}
//#endregion


//#region Select Menus
export interface IStringSelectComponentObject extends SelectComponentObjectInput<StringSelectComponentObject, 'options'> {
	type: ComponentType.StringSelect;
}
export class StringSelectComponentObject extends BaseSelectComponentObject {
	public options?: SelectMenuComponentOptionData[];

	constructor(input: IStringSelectComponentObject) {
		super(input);
		this.assignFields(input);
	}

	public build() {
		const component = this.buildSelectMenuBase(new StringSelectMenuBuilder());

		if (this.options) { component.setOptions(this.options); }

		return component;
	}
}

export interface IUserSelectComponentObject extends SelectComponentObjectInput<UserSelectComponentObject, 'defaultValues'> {
	type: ComponentType.UserSelect;
}
export class UserSelectComponentObject extends BaseSelectComponentObject {
	public defaultValues?: string[]

	constructor(input: IUserSelectComponentObject) {
		super(input);
		this.assignFields(input);
	}

	public build() {
		const component = this.buildSelectMenuBase(new UserSelectMenuBuilder());
		
		if (this.defaultValues) { component.setDefaultUsers(this.defaultValues); }

		return component;
	}
}

export interface IRoleSelectComponentObject extends SelectComponentObjectInput<RoleSelectComponentObject, 'defaultValues'> {
	type: ComponentType.RoleSelect;
}
export class RoleSelectComponentObject extends BaseSelectComponentObject {
	public defaultValues?: string[]

	constructor(input: IRoleSelectComponentObject) {
		super(input);
		this.assignFields(input);
	}

	public build() {
		const component = this.buildSelectMenuBase(new RoleSelectMenuBuilder());
		
		if (this.defaultValues) { component.setDefaultRoles(this.defaultValues); }

		return component;
	}
}

export interface IMentionableSelectComponentObject extends SelectComponentObjectInput<MentionableSelectComponentObject, 'defaultRoles' | 'defaultUsers'> {
	type: ComponentType.MentionableSelect;
}
export class MentionableSelectComponentObject extends BaseSelectComponentObject {
	public defaultRoles?: string[]
	public defaultUsers?: string[]

	constructor(input: IMentionableSelectComponentObject) {
		super(input);
		this.assignFields(input);
	}

	public build() {
		const component = this.buildSelectMenuBase(new MentionableSelectMenuBuilder());
		
		if (this.defaultRoles) { component.addDefaultRoles(this.defaultRoles); }
		if (this.defaultUsers) { component.addDefaultUsers(this.defaultUsers); }

		return component;
	}
}

export interface IChannelSelectComponentObject extends SelectComponentObjectInput<ChannelSelectComponentObject, 'defaultValues' | 'channelTypes'> {
	type: ComponentType.ChannelSelect;
}
export class ChannelSelectComponentObject extends BaseSelectComponentObject {
	public defaultValues?: string[]
	public channelTypes?: ChannelType[];

	constructor(input: IChannelSelectComponentObject) {
		super(input);
		this.assignFields(input);
	}

	public build() {
		const component = this.buildSelectMenuBase(new ChannelSelectMenuBuilder());
		
		if (this.defaultValues) { component.setDefaultChannels(this.defaultValues); }
		if (this.channelTypes) { component.setChannelTypes(this.channelTypes); }

		return component;
	}
}
//#endregion