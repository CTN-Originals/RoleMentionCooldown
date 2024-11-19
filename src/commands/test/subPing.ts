import { 
	EmbedBuilder,
	SlashCommandBuilder,
	CommandInteraction,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	UserSelectMenuBuilder,
	ChannelSelectMenuBuilder,
	ChannelType,
	MessageComponentInteraction,
	MentionableSelectMenuBuilder,
	RoleSelectMenuBuilder
} from "discord.js";
import { InteractionInstanceList } from "../../handlers/interactionInstanceHandler";
import { IInteraction } from "../../startup/registerCommands";
import { AnyComponentInteraction } from "../../@types/discord";


const interactionInstances = new InteractionInstanceList('sub-ping');
export default {
	command: {
		data: new SlashCommandBuilder()
			.setName("sub-ping")
			.setDescription("Sub command Replies with Pong! [Test Command]")
			.addSubcommandGroup(group =>
				group.setName('subgroup')
				.setDescription('Some subgroup')
				.addSubcommand(subcommand => 
					subcommand.setName('sub-group-ping')
					.setDescription('Replies with Pong! [Test Command]')
					.addStringOption(option => 
						option.setName('string')
						.setDescription('Some description')
						.setRequired(false)
						.addChoices(
							{name: 'Hello', value: 'hello'},
							{name: 'World', value: 'world'},
						)
					)
					.addUserOption(option =>
						option.setName('user')
						.setDescription('Some user')
						.setRequired(false)
					)
				)
			)
			.addSubcommand(subcommand =>
				subcommand.setName('sub-ping')
				.setDescription('Replies with Pong! [Test Command]')
				.addStringOption(option => 
					option.setName('string')
					.setDescription('Some description')
					.setRequired(false)
					.addChoices(
						{name: 'Hello', value: 'hello'},
						{name: 'World', value: 'world'},
					)
				)
				.addUserOption(option =>
					option.setName('user')
					.setDescription('Some user')
					.setRequired(false)
				)
			),
		async execute(interaction: CommandInteraction) {
			const instance = interactionInstances.createInstance(interaction);
			const select = new StringSelectMenuBuilder({
				custom_id: 'string-select-test',
				options: [
					{
						label: 'Hello',
						value: 'hello',
						description: 'Hello world'
					},
					{
						label: 'World',
						value: 'world',
						description: 'Hello world'
					},
				]
			});
			const userSelect = new UserSelectMenuBuilder({
				custom_id: 'user-select-test',
			});
			const channelSelect = new ChannelSelectMenuBuilder({
				custom_id: 'channel-select-test',
				channel_types: [ChannelType.GuildCategory, ChannelType.GuildText],
				max_values: 25
			});
			const mentionableSelect = new MentionableSelectMenuBuilder({
				custom_id: 'mentionable-select-test',
			});
			const roleSelect = new RoleSelectMenuBuilder({
				custom_id: 'role-select-test',
			});
			const row: any = new ActionRowBuilder().addComponents(select);
			const row2: any = new ActionRowBuilder().addComponents(channelSelect);
			const row3: any = new ActionRowBuilder().addComponents(mentionableSelect);

			await interaction.reply({
				content: "Pong!",
				embeds: [new EmbedBuilder({
					title: "Pong!",
				})],
				components: [row, row2, row3],
				ephemeral: true,
				fetchReply: true,
			});

			return true;
		},
	},
	selectMenus: [
		{
			data: new SlashCommandBuilder().setName("string-select-test"),
			async execute(interaction: StringSelectMenuInteraction) { return await executeSelectMenu(interaction); }
		},
		{
			data: new SlashCommandBuilder().setName("user-select-test"),
			async execute(interaction: StringSelectMenuInteraction) { return await executeSelectMenu(interaction); }
		},
		{
			data: new SlashCommandBuilder().setName("channel-select-test"),
			async execute(interaction: StringSelectMenuInteraction) { return await executeSelectMenu(interaction); }
		},
		{
			data: new SlashCommandBuilder().setName("mentionable-select-test"),
			async execute(interaction: StringSelectMenuInteraction) { return await executeSelectMenu(interaction); }
		},
		{
			data: new SlashCommandBuilder().setName("role-select-test"),
			async execute(interaction: StringSelectMenuInteraction) { return await executeSelectMenu(interaction); }
		}
	],
	
}
async function executeSelectMenu(interaction: AnyComponentInteraction) {
	await interaction.reply({
		content: "",
		embeds: [new EmbedBuilder({
			fields: [
				{name: "Selected", value: interaction.values.join(' | ') ?? "None"}
			]
		})],
	});

	return true;
}