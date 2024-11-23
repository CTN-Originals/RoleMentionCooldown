import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { GuildConfig } from "../../data/orm/guildConfig";
import { PermissionObject } from "../../handlers/permissionHandler";
import { RequiredFields } from "../../@types";

export default {
	command: {
		permissions: new PermissionObject({
			guildAdmin: true,
			configAdmin: true,
		}),
		data: new SlashCommandBuilder()
		.setName("config")
		.setDescription("Configure this bots settings")
		.addSubcommandGroup(subGroup => subGroup
			.setName("admin-role")
			.setDescription("Add/Remove an admin role to/from the list")
			.addSubcommand(sub => sub
				.setName("add")
				.setDescription("Add an admin role, these roles are able to configure the bots settings and role cooldowns")
				.addRoleOption(opt => opt
					.setName('role')
					.setDescription('The role you would like to add')
				)
			)
			.addSubcommand(sub => sub
				.setName("remove")
				.setDescription("Remove an admin role, these roles are able to configure the bots settings and role cooldowns")
				.addRoleOption(opt => opt
					.setName('role')
					.setDescription('The role you would like to remove')
				)
			)
		),
		async execute(interaction: RequiredFields<ChatInputCommandInteraction, 'guildId'>) {
			const config = await GuildConfig.get(interaction.guildId!);
			console.log(config)
			await interaction.reply('Under construction...');

			return true;
		}
	}
}