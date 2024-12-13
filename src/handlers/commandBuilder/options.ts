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

export type IBaseOptionObject = CommandObjectInput<
    BaseOptionObject,
    'required' | 'autocomplete',
    'type'
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

export class StringOptionObject extends BaseOptionObject {
	public maxLength?: number;
	public minLength?: number;

	public get build() {
		const opt = this.optionBuildBase(new SlashCommandStringOption());
		
		if (this.minLength) { opt.setMinLength(this.minLength); }
		if (this.maxLength) { opt.setMaxLength(this.maxLength); }
		
		return opt;
	}
}
export class IntegerOptionObject extends BaseOptionObject {
	public get build() {
		const opt = this.optionBuildBase(new SlashCommandIntegerOption());
		return opt;
	}
}
export class BooleanOptionObject extends BaseOptionObject {
	public get build() {
		const opt = this.optionBuildBase(new SlashCommandBooleanOption());
		return opt;
	}
}
export class UserOptionObject extends BaseOptionObject {
	public get build() {
		const opt = this.optionBuildBase(new SlashCommandUserOption());
		return opt;
	}
}
export class ChannelOptionObject extends BaseOptionObject {
	public channel_type?: ApplicationCommandOptionAllowedChannelTypes[];

	public get build() {
		const opt = this.optionBuildBase(new SlashCommandChannelOption());

		if (this.channel_type) { opt.addChannelTypes(...this.channel_type); }

		return opt;
	}
}
export class RoleOptionObject extends BaseOptionObject {
	public get build() {
		const opt = this.optionBuildBase(new SlashCommandRoleOption());
		return opt;
	}
}
export class MentionableOptionObject extends BaseOptionObject {
	public get build() {
		const opt = this.optionBuildBase(new SlashCommandMentionableOption());
		return opt;
	}
}
export class NumberOptionObject extends BaseOptionObject {
	public get build() {
		const opt = this.optionBuildBase(new SlashCommandNumberOption());
		return opt;
	}
}
export class AttachmentOptionObject extends BaseOptionObject {
	public get build() {
		const opt = this.optionBuildBase(new SlashCommandAttachmentOption());
		return opt;
	}
}
