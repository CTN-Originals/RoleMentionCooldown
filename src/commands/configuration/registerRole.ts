import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelSelectMenuBuilder, ChannelSelectMenuInteraction, ChannelType, CommandInteraction, EmbedBuilder, MentionableSelectMenuBuilder, MentionableSelectMenuInteraction, RoleSelectMenuBuilder, RoleSelectMenuInteraction, SlashCommandBuilder } from "discord.js";
import { AnyComponentInteraction } from "../../@types/discord";

import generalData from '../../data'

export default {
	command: {
		data: new SlashCommandBuilder()
			.setName("register-role")
			.setDescription("Register a new mention role and configure its behaviour")
			.addMentionableOption(option => option
				.setName('role')
				.setDescription('The role to be registered')
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('cooldown')
				.setDescription('The cooldown to apply to the mention once its used. (8s 28h 1d = 8 seconds, 4 hours and 2 days)')
				.setRequired(true)
				.setMinLength(2)
			),
		async execute(interaction: CommandInteraction) {
			const allowedRoleSelect = new RoleSelectMenuBuilder({
				custom_id: "register-role_allowed-role",
				min_values: 0,
				max_values: 25,
				placeholder: "Role(s) allowed to use (0 for all)"
			});
			const channelSelect = new ChannelSelectMenuBuilder({
				custom_id: "register-role_channel",
				min_values: 0,
				max_values: 25,
				placeholder: "Channels to allow (0 for all)",
				channelTypes: [ChannelType.GuildText, ChannelType.GuildForum, ChannelType.PrivateThread, ChannelType.PublicThread]
			})
			const submitButton = new ButtonBuilder({
				custom_id: "register-role_submit",
				label: "Submit",
				style: ButtonStyle.Success
			})

			// const row1: ActionRowBuilder<any> = new ActionRowBuilder().addComponents(roleSelect)
			const row1: ActionRowBuilder<any> = new ActionRowBuilder().addComponents(allowedRoleSelect)
			const row2: ActionRowBuilder<any> = new ActionRowBuilder().addComponents(channelSelect)
			const row3: ActionRowBuilder<any> = new ActionRowBuilder().addComponents(submitButton)

			await interaction.reply({
				embeds: [new EmbedBuilder({
					title: "Register Role Configuration",
					description: "Please fill out the fields below"
				})],
				components: [row1, row2, row3],
				ephemeral: !generalData.development
			});
		}
	},
	selectMenus: [
		{
			data: new SlashCommandBuilder().setName("register-role_allowed-role"),
			async execute(interaction: MentionableSelectMenuInteraction) { interaction.deferUpdate() }
		},
		{
			data: new SlashCommandBuilder().setName("register-role_channel"),
			async execute(interaction: ChannelSelectMenuInteraction) { interaction.deferUpdate() }
		},
	],
	buttons: [
		{
			data: new SlashCommandBuilder().setName("register-role_submit"),
			async execute(interaction: ButtonInteraction) { 
				interaction.reply({
					embeds: [new EmbedBuilder({
						title: "Saved Role Configurations",
						fields: [{name: 'TODO', value: 'Add resulting configuration fields'}]
					})],
					ephemeral: !generalData.development
				})
			}
		}
	]
}
// async function executeSelectMenu(interaction: AnyComponentInteraction) {
// 	await interaction.reply({
// 		content: "",
// 		embeds: [new EmbedBuilder({
// 			fields: [
// 				{name: "Selected", value: interaction.values.join(' | ') ?? "None"}
// 			]
// 		})],
// 	});

// 	return true;
// }