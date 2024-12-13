import { LocalizationMap, SlashCommandSubcommandGroupBuilder, ApplicationCommandOption, ApplicationCommandOptionType } from "discord.js";
import { AnySlashCommandBuilder } from ".";
import { 
	AttachmentOptionObject,
	BooleanOptionObject,
	ChannelOptionObject,
	IntegerOptionObject,
	MentionableOptionObject,
	NumberOptionObject,
	RoleOptionObject,
	StringOptionObject,
	UserOptionObject,
	AnySlashCommandOption
} from ".";
import { EmitError } from "../../events";

const nameAllowedCharacters = [
	'-', '_',
	"a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",
	'0','1','2','4','5','6','7','8','9'
];

type RequiredBaseFields = 'name' | 'description';
type OptionalBaseFields = 'name_localizations' | 'description_localizations';

export type CommandObjectInput<
    T extends BaseCommandObject,
    Optional extends keyof T = never,
    Required extends keyof T = never
> = RequiredFields<
    Partial<Pick<T, Optional | OptionalBaseFields>> & Pick<T, RequiredBaseFields | Required>,
    RequiredBaseFields | Required
>;

export type IBaseCommandObject = CommandObjectInput<BaseCommandObject>
export class BaseCommandObject {
	/** The name of this command.
	 * @minmax 1-32 
	 * @containing no capital letters, spaces, or symbols other than `-` and `_`
	*/
    public name: string;
    /** The description of this command.
	 * @minmax 1-100
	*/
    public description: string;

	/** The name localizations of this command. */
	public name_localizations?: LocalizationMap;
	/** The description localizations of this command. */
	public description_localizations?: LocalizationMap;

	constructor(input: IBaseCommandObject) {
		this.name = input.name;
		this.description = input.description;
		
		this.validateName();
		if (this.description.length < 1 || this.description.length > 100) {
			throw this.onError(`Command description does not fit in length range 1 - 100\nInput: ${this.description}`);
		}
	}
	
	//? This function exists because option choices also need the same validation but dont have the same fields
	protected validateName(name: string = this.name): true {
		if (name.length < 1 || name.length > 32) {
			throw this.onError(`Command name does not fit in length range 1 - 32\nInput: ${name}`);
		}

		for (const char of name) {
			if (!nameAllowedCharacters.includes(char)) {
				throw this.onError(`Command name "${name}" contains illigal character "${char}"`);
			}
		}

		return true;
	}

	protected assignFields(input: CommandObjectInput<BaseCommandObject, any>) {
		for (const field in input) {
			this[field] = input[field];
		}
	}

	protected buildBase<T extends AnySlashCommandBuilder | AnySlashCommandOption>(builder: T): T {
		const cmd = builder.setName(this.name).setDescription(this.description) as T;

		if (this.name_localizations) 			{ cmd.setNameLocalizations(this.name_localizations); }
		if (this.description_localizations) 	{ cmd.setDescriptionLocalizations(this.description_localizations); }

		return cmd;
	}

	protected resolveOptions<T extends Exclude<AnySlashCommandBuilder, SlashCommandSubcommandGroupBuilder>>(builder: T, options: ApplicationCommandOption[]): T {
		for (const opt of options) {
			switch (opt.type) {
				case ApplicationCommandOptionType.String: 		builder.addStringOption(new StringOptionObject(opt).build); break;
				case ApplicationCommandOptionType.Integer: 		builder.addIntegerOption(new IntegerOptionObject(opt).build); break;
				case ApplicationCommandOptionType.Boolean: 		builder.addBooleanOption(new BooleanOptionObject(opt).build); break;
				case ApplicationCommandOptionType.User: 		builder.addUserOption(new UserOptionObject(opt).build); break;
				case ApplicationCommandOptionType.Channel: 		builder.addChannelOption(new ChannelOptionObject(opt).build); break;
				case ApplicationCommandOptionType.Role: 		builder.addRoleOption(new RoleOptionObject(opt).build); break;
				case ApplicationCommandOptionType.Mentionable: 	builder.addMentionableOption(new MentionableOptionObject(opt).build); break;
				case ApplicationCommandOptionType.Number: 		builder.addNumberOption(new NumberOptionObject(opt).build); break;
				case ApplicationCommandOptionType.Attachment: 	builder.addAttachmentOption(new AttachmentOptionObject(opt).build); break;
				default: break;
			}
		}

		return builder
	}

	protected onError(message: string): string {
		const err = new Error(message)
		EmitError(err);
		return err.message;
	}
}
