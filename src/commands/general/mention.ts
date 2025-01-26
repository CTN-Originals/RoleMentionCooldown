import { ApplicationCommandOptionType, ChatInputCommandInteraction, InteractionContextType, Role } from "discord.js";
import { BaseButtonCollection, BaseEmbedCollection, BaseMethodCollection, BaseSelectMenuCollection, CommandInteractionData, IButtonCollection, ISelectMenuCollection } from "../../handlers/commandBuilder";

class ButtonCollection extends BaseButtonCollection implements IButtonCollection<ButtonCollection> {}
class SelectMenuCollection extends BaseSelectMenuCollection implements ISelectMenuCollection<SelectMenuCollection> {}
class EmbedCollection extends BaseEmbedCollection {}
class MethodCollection extends BaseMethodCollection {}

const command = new CommandInteractionData<ButtonCollection, SelectMenuCollection, EmbedCollection, MethodCollection>({
	command: {
		content: {
			name: 'mention',
			description: 'Mention a role in the current channel',
			contexts: [InteractionContextType.Guild],
			requiredPermissions: ['MentionEveryone'],
			options: [
				{
					type: ApplicationCommandOptionType.Role,
					name: 'role',
					description: 'The role to mention',
					required: true
				},
				{ //TODO add syntax to allow the user to place the role somewhere inside the message
					type: ApplicationCommandOptionType.String,
					name: 'message',
					description: 'A message you would like to be included',
				}
			]
		},
		execute: async function (interaction: ChatInputCommandInteraction) {
			const role: Role = interaction.options.getRole('role', true) as Role;
			const message: string | null = interaction.options.getString('message');
			await interaction.reply({
				content: `<@&${role.id}>${(message !== null) ? ` ${message}` : ''}`,
				allowedMentions: {roles: [role.id]}
			})
			return true;
		},
	},
	buttons: new ButtonCollection(),
	selectMenus: new SelectMenuCollection(),
	embeds: new EmbedCollection(),
	methods: new MethodCollection(),
});

export default command;