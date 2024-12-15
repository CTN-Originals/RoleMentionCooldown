import { ApplicationCommandType, ApplicationIntegrationType, ContextMenuCommandBuilder, InteractionContextType, LocalizationMap, PermissionsBitField, PermissionsString } from "discord.js";

type RequiredBaseFields = 'name' | 'type';
type OptionalBaseFields = 
| 'name_localizations'
| 'contexts'
| 'default_member_permissions'
| 'integration_types'
| 'requiredPermissions';

type ContextObjectInput<
    T extends ContextMenuCommandObject,
    Optional extends keyof T = never,
    Required extends keyof T = never
> = RequiredFields<
    Partial<Pick<T, Optional | OptionalBaseFields>> & Pick<T, RequiredBaseFields | Required>,
    RequiredBaseFields | Required
>;

export type IContextMenuCommandObject = ContextObjectInput<ContextMenuCommandObject>;
export class ContextMenuCommandObject {
	public name: string;
	public type: (ApplicationCommandType.Message | ApplicationCommandType.User) | ('Message' | 'User');
	
	public name_localizations?: LocalizationMap;
	public contexts?: InteractionContextType[];
	public default_member_permissions: string | null | undefined;
	public integration_types?: ApplicationIntegrationType[];

	/** The permissions that the bot requires to have to execute anything defined in this command */
	public requiredPermissions?: PermissionsString[] = []

	constructor(input: IContextMenuCommandObject) {
		this.name = input.name;
		this.type = input.type;

		for (const field in input) {
			this[field] = input[field];
		}
	}

	public get requiredPermissionBitField(): PermissionsBitField {
		return new PermissionsBitField(this.requiredPermissions);
	}

	public build() {
		const builder = new ContextMenuCommandBuilder().setName(this.name);

		if (this.type == 'Message' || this.type == ApplicationCommandType.Message) {
			builder.setType(ApplicationCommandType.Message as number);
		} else {
			builder.setType(ApplicationCommandType.User as number);
		}
		
		if (this.name_localizations) { builder.setNameLocalizations(this.name_localizations); }
		if (this.contexts) { builder.setContexts(this.contexts); }
		if (this.default_member_permissions) { builder.setDefaultMemberPermissions(this.default_member_permissions); }
		if (this.integration_types) { builder.setIntegrationTypes(this.integration_types); }

		return builder;
	}
}