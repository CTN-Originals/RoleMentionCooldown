import { ApplicationCommandOptionAllowedChannelTypes, ApplicationCommandOptionType, LocalizationMap, SlashCommandAttachmentOption, SlashCommandBooleanOption, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandUserOption } from "discord.js";
import { BaseCommandObject, CommandObjectInput } from '.';


// export type ICommandObjectOptionBase = CommandObjectInput<CommandObjectOptionBase, 'required' | 'autocomplete', 'type'>
export type AnySlashCommandOption = 
SlashCommandStringOption |
SlashCommandIntegerOption |
SlashCommandBooleanOption |
SlashCommandUserOption |
SlashCommandChannelOption |
SlashCommandRoleOption |
SlashCommandMentionableOption |
SlashCommandNumberOption |
SlashCommandAttachmentOption;

interface CommandObjectOptionChoice<Value extends string | number = string | number> {
	name: string;
	nameLocalizations?: LocalizationMap;
	value: Value;
}

export type IBaseOptionObject<
	T extends BaseOptionObject = BaseOptionObject,
	Optional extends keyof T = never,
	Required extends keyof T = never
> = CommandObjectInput<
    T,
    'required' | 'autocomplete' & Optional,
    'type' & Required
>;
export class BaseOptionObject extends BaseCommandObject {
	public type!: ApplicationCommandOptionType;
	public required: boolean = false;
	
	public choices?: CommandObjectOptionChoice[];
	public autocomplete?: boolean;

	public max_value?: number;
	public min_value?: number;

	constructor(input: IBaseOptionObject) {
		super(input);
		this.assignFields(input);
	}

	protected optionBuildBase<T extends AnySlashCommandOption>(builder: T): T {
		builder = this.buildBase(builder);
		builder.setRequired(this.required);

		if (builder.type == (ApplicationCommandOptionType.String || ApplicationCommandOptionType.Number || ApplicationCommandOptionType.Integer)) {
			if (this.choices && this.autocomplete !== undefined) {
				throw this.onError(`Command option ${this.name} has choices and autocomplete enabled`);
			}

			if (this.choices) {
				for (const choice of this.choices) {
					this.validateName(choice.name);
					builder.addChoices(choice as never);
				}
			}
			else if (this.autocomplete !== undefined) {
				builder.setAutocomplete(this.autocomplete);
			}
		}

		if (builder.type == (ApplicationCommandOptionType.Number || ApplicationCommandOptionType.Integer)) {
			if (this.min_value) { builder.setMinValue(this.min_value); }
			if (this.max_value) { builder.setMaxValue(this.max_value); }
		}

		return builder;
	}
}


type IStringOptionObject = IBaseOptionObject<StringOptionObject, 'minLength' | 'maxLength'>
export class StringOptionObject extends BaseOptionObject {
	public maxLength?: number;
	public minLength?: number;

	constructor(input: IStringOptionObject) {
		super(input);
		this.assignFields(input);
	}
	
	public build() {
		const opt = this.optionBuildBase(new SlashCommandStringOption());
		
		if (this.minLength) { opt.setMinLength(this.minLength); }
		if (this.maxLength) { opt.setMaxLength(this.maxLength); }
		
		return opt;
	}
}

type IIntegerOptionObject = IBaseOptionObject<IntegerOptionObject>
export class IntegerOptionObject extends BaseOptionObject {
	constructor(input: IIntegerOptionObject) {
		super(input);
		this.assignFields(input);
	}
	
	public build() {
		const opt = this.optionBuildBase(new SlashCommandIntegerOption());
		return opt;
	}
}

type IBooleanOptionObject = IBaseOptionObject<BooleanOptionObject>
export class BooleanOptionObject extends BaseOptionObject {
	constructor(input: IBooleanOptionObject) {
		super(input);
		this.assignFields(input);
	}
	
	public build() {
		const opt = this.optionBuildBase(new SlashCommandBooleanOption());
		return opt;
	}
}

type IUserOptionObject = IBaseOptionObject<UserOptionObject>
export class UserOptionObject extends BaseOptionObject {
	constructor(input: IUserOptionObject) {
		super(input);
		this.assignFields(input);
	}
	
	public build() {
		const opt = this.optionBuildBase(new SlashCommandUserOption());
		return opt;
	}
}

type IChannelOptionObject = IBaseOptionObject<ChannelOptionObject, 'channelTypes'>
export class ChannelOptionObject extends BaseOptionObject {
	public channelTypes?: ApplicationCommandOptionAllowedChannelTypes[];

	constructor(input: IChannelOptionObject) {
		super(input);
		this.assignFields(input);
	}
	
	public build() {
		const opt = this.optionBuildBase(new SlashCommandChannelOption());

		if (this.channelTypes) { opt.addChannelTypes(...this.channelTypes); }

		return opt;
	}
}

type IRoleOptionObject = IBaseOptionObject<RoleOptionObject>
export class RoleOptionObject extends BaseOptionObject {
	constructor(input: IRoleOptionObject) {
		super(input);
		this.assignFields(input);
	}
	
	public build() {
		const opt = this.optionBuildBase(new SlashCommandRoleOption());
		return opt;
	}
}

type IMentionableOptionObject = IBaseOptionObject<MentionableOptionObject>
export class MentionableOptionObject extends BaseOptionObject {
	constructor(input: IMentionableOptionObject) {
		super(input);
		this.assignFields(input);
	}
	
	public build() {
		const opt = this.optionBuildBase(new SlashCommandMentionableOption());
		return opt;
	}
}

type INumberOptionObject = IBaseOptionObject<NumberOptionObject>
export class NumberOptionObject extends BaseOptionObject {
	constructor(input: INumberOptionObject) {
		super(input);
		this.assignFields(input);
	}
	
	public build() {
		const opt = this.optionBuildBase(new SlashCommandNumberOption());
		return opt;
	}
}

type IAttachmentOptionObject = IBaseOptionObject<AttachmentOptionObject>
export class AttachmentOptionObject extends BaseOptionObject {
	constructor(input: IAttachmentOptionObject) {
		super(input);
		this.assignFields(input);
	}
	
	public build() {
		const opt = this.optionBuildBase(new SlashCommandAttachmentOption());
		return opt;
	}
}
