import {
	BaseInteraction,
	CommandInteractionOption,
	ComponentType,
	InteractionType,
	MessageComponentInteraction
} from "discord.js"

//* API Interaction Types: https://discord.com/developers/docs/interactions/receiving-and-responding
export interface IInteractionTypeData {
	/** 1 = PING, 2 = APPLICATION_COMMAND, 3 = MESSAGE_COMPONENT, 4 = APPLICATION_COMMAND_AUTOCOMPLETE, 5 = MODAL_SUBMIT */
	type: InteractionType
	/** The name of the type instead of the number */
	name: string
	/** The display name of the type for whenever it needs to be displayed in the console or in a message (includes componentType in () if present) */
	display: string
	/** The type of component (if applicable) */
	componentType?: ComponentType
	/** The name of the component (if applicable) */
	componentName?: string
	/** The key to get the command name of the interaction (PING doesn't have one) */
	commandKey?: string
}
export function getInteractionType(interaction: BaseInteraction): IInteractionTypeData {
	const interactionTypeData: IInteractionTypeData = {
		type: interaction.type,
		name: interaction.type[interaction.type],
		display: '',
	}

	switch (interaction.type) {
		case InteractionType.ApplicationCommand: { interactionTypeData.display = 'Command' } break
		case InteractionType.ApplicationCommandAutocomplete: { interactionTypeData.display = 'Autocomplete' } break
		case InteractionType.ModalSubmit: { interactionTypeData.display = 'Modal Submit' } break
		case InteractionType.MessageComponent: {
			interactionTypeData.componentType = (interaction as MessageComponentInteraction).componentType
			interactionTypeData.componentName = (interaction as MessageComponentInteraction).componentType[(interaction as MessageComponentInteraction).componentType]
			switch ((interaction as MessageComponentInteraction).componentType as ComponentType) {
				case ComponentType.ActionRow: { interactionTypeData.display = 'ActionRow' } break
				case ComponentType.Button: { interactionTypeData.display = 'Button' } break
				case ComponentType.StringSelect: { interactionTypeData.display = 'Select(String)' } break
				case ComponentType.ChannelSelect: { interactionTypeData.display = 'Select(Channel)' } break
				case ComponentType.MentionableSelect: { interactionTypeData.display = 'Select(Mentionable)' } break
				case ComponentType.RoleSelect: { interactionTypeData.display = 'Select(Role)' } break
				case ComponentType.TextInput: { interactionTypeData.display = 'TextInput' } break
				case ComponentType.UserSelect: { interactionTypeData.display = 'Select(User)' } break
				default: break
			}
		} break
		case InteractionType.Ping: { interactionTypeData.display = 'Ping' } break
		default: { interactionTypeData.display = 'Unknown' } break
	}

	switch (interaction.type) {
		case InteractionType.ApplicationCommand:
		case InteractionType.ApplicationCommandAutocomplete:
			{ interactionTypeData.commandKey = 'commandName' } break
		case InteractionType.MessageComponent:
			{ interactionTypeData.commandKey = 'customId' } break
		default: break
	}

	return interactionTypeData
}

export interface IInteractionHoistedOption {
	name: string
	type: number
	value: string
}
export function getHoistedOptions(optionsData: CommandInteractionOption[]): IInteractionHoistedOption[] {
	/*
		1: SUB_COMMAND { name: string, options: [array], type: 1 }
		2: SUB_COMMAND_GROUP { name: string, options: [array], type: 2 }
		3: STRING
		4: INTEGER
		5: BOOLEAN
		6: USER
		7: CHANNEL
		8: ROLE
		9: MENTIONABLE
		10: NUMBER
		11: ATTACHMENT
	*/
	let hoistedOptions: IInteractionHoistedOption[] = []

	for (const option of optionsData) {
		if (option.type == 1 || option.type == 2) {
			hoistedOptions.push(...getHoistedOptions(option.options as CommandInteractionOption[]))
		}
		else {
			hoistedOptions.push({
				name: option.name,
				type: option.type,
				value: option.value as string,
			})
		}
	}

	return hoistedOptions
}
