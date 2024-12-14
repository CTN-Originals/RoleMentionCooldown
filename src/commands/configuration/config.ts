import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, InteractionContextType, ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import { BaseButtonCollection, BaseEmbedCollection, BaseSelectMenuCollection, CommandInteractionData, IButtonCollection, ISelectMenuCollection } from "../../handlers/commandBuilder";

import { GuildConfig } from "../../data/orm/guildConfig";
import { PermissionObject } from "../../handlers/permissionHandler";
import { IGuildConfigData } from "../../data/orm/schemas/guildConfigData";
import { validateEmbed } from "../../utils/embedUtils";
import { ColorTheme } from "../../data";
import { hexToBit } from "../../utils";

type ActionType = 'add'|'remove';
async function adminRole(interaction: RequiredFields<ChatInputCommandInteraction, 'guildId'>, config: IGuildConfigData) {
	const action: ActionType  = interaction.options.getSubcommand() as ActionType;
	const role = interaction.options.getRole('role', true);

	const listIncludesRole = config.adminRoles.includes(role.id);
	if (
		(action == 'add' && listIncludesRole) ||
		(action == 'remove' && !listIncludesRole)
	) {
		await interaction.reply({
			embeds: [validateEmbed(command.embeds.duplicateRole(role.id, action))],
			ephemeral: true
		});
		return `Duplicate action`;
	}
	
	switch (action) {
		case 'add': {
			config.adminRoles.push(role.id);
		} break;
		case 'remove': {
			config.adminRoles.splice(config.adminRoles.indexOf(role.id), 1);
		} break;
		default: break;
	}

	await GuildConfig.update(config);

	await interaction.reply({
		embeds: [validateEmbed(command.embeds.success(role.id, action))],
		ephemeral: true
	})

	return true
}

class ButtonCollection extends BaseButtonCollection implements IButtonCollection<ButtonCollection> {}
class SelectMenuCollection extends BaseSelectMenuCollection implements ISelectMenuCollection<SelectMenuCollection> {}
class EmbedCollection extends BaseEmbedCollection {
	public displayConfig(interaction: ChatInputCommandInteraction, config: IGuildConfigData) {
		return new EmbedBuilder({
			title: `${interaction.guild!.name} Server Configurations`,
			fields: [
				{ name: 'Admin Roles', value: config.adminRoles.map(r => `<@&${r}>`).join(' ') || '-'}
			],
			color: hexToBit(ColorTheme.embeds.info),
			timestamp: Date.now()
		})
	}

	public duplicateRole(roleId: string, action: ActionType) {
		return new EmbedBuilder({
			description: `Role (<@&${roleId}>) is ${(action === 'add') ? 'already' : 'not'} present in the list`,
			color: hexToBit(ColorTheme.embeds.notice)
		})
	}


	public success(roleId: string, action: ActionType) {
		return new EmbedBuilder({
			description: (action === 'add') ? 
				`Successfully **added** <@&${roleId}> to the list` :
				`Successfully **removed** <@&${roleId}> from the list`,
			color: hexToBit(ColorTheme.embeds.reply)
		})
	}
}

const command = new CommandInteractionData<ButtonCollection, SelectMenuCollection, EmbedCollection>({
	command: {
		data: {
			name: 'config',
			description: 'Configure the bots settings',
			contexts: [InteractionContextType.Guild],
			default_member_permissions: (PermissionsBitField.Flags.Administrator).toString(),
			subcommands: [
				{
					name: 'display',
					description: 'Display the current server configurations'
				}
			],
			subcommandGroups: [
				{
					name: 'admin-role',
					description: 'Add/Remove an admin role to/from the list',
					subcommands: [
						{
							name: 'add',
							description: 'Add an admin role, these roles are able to configure the bots settings and role cooldowns',
							options: [
								{
									type: ApplicationCommandOptionType.Role,
									name: 'role',
									description: 'The role you would like to add',
									required: true
								}
							]
						},
						{
							name: 'remove',
							description: 'Remove an admin role, these roles are able to configure the bots settings and role cooldowns',
							options: [
								{
									type: ApplicationCommandOptionType.Role,
									name: 'role',
									description: 'The role you would like to remove',
									required: true
								}
							]
						}
					]
				}
			]
		},
		execute: async function (interaction: ChatInputCommandInteraction): Promise<true | string> {
			const config = await GuildConfig.get(interaction.guildId!);
			
			const subGroup = interaction.options.getSubcommandGroup();
			const subCommand = interaction.options.getSubcommand();

			switch (subCommand) {
				case 'display': { 
					await interaction.reply({
						embeds: [validateEmbed(command.embeds.displayConfig(interaction, config))],
						ephemeral: true
					});

					return true;
				}
				default: break;
			}
			switch (subGroup) {
				case 'admin-role': { return await adminRole(interaction, config); }
				default: break;
			}
			
			//? if code reaches here, that means that all subcommands and groups fell through somehow...
			throw new Error(`Unknown command command:${interaction.commandName} group:${subGroup} sub:${subCommand}`);
		},
	},
	buttons: new ButtonCollection(),
	selectMenus: new SelectMenuCollection(),
	embeds: new EmbedCollection()
})

export default command;

// const old = {
// 	command: {
// 		permissions: new PermissionObject({
// 			guildAdmin: true,
// 			configAdmin: true,
// 		}),
// 		data: new SlashCommandBuilder()
// 		.setName("config")
// 		.setDescription("Configure this bots settings")
// 		.addSubcommand(sub => sub
// 			.setName("display")
// 			.setDescription("Display the current server configurations")
// 		)
// 		.addSubcommandGroup(subGroup => subGroup
// 			.setName("admin-role")
// 			.setDescription("Add/Remove an admin role to/from the list")
// 			.addSubcommand(sub => sub
// 				.setName("add")
// 				.setDescription("Add an admin role, these roles are able to configure the bots settings and role cooldowns")
// 				.addRoleOption(opt => opt
// 					.setName('role')
// 					.setDescription('The role you would like to add')
// 					.setRequired(true)
// 				)
// 			)
// 			.addSubcommand(sub => sub
// 				.setName("remove")
// 				.setDescription("Remove an admin role, these roles are able to configure the bots settings and role cooldowns")
// 				.addRoleOption(opt => opt
// 					.setName('role')
// 					.setDescription('The role you would like to remove')
// 					.setRequired(true)
// 				)
// 			)
// 		),
// 		async execute(interaction: RequiredFields<ChatInputCommandInteraction, 'guildId'>) {
// 			const config = await GuildConfig.get(interaction.guildId!);
			
// 			const subGroup = interaction.options.getSubcommandGroup();
// 			const subCommand = interaction.options.getSubcommand();

// 			switch (subCommand) {
// 				case 'display': {
					

// 					return true;
// 				}
// 				default: break;
// 			}
// 			switch (subGroup) {
// 				case 'admin-role': { return await this.adminRole(interaction, config); }
// 				default: break;
// 			}
			
// 			//? if code reaches here, that means that all subcommands and groups fell through somehow...
// 			throw new Error(`Unknown command command:${interaction.commandName} group:${subGroup} sub:${subCommand}`);
// 		},

// 		async displayConfig(interaction: RequiredFields<ChatInputCommandInteraction, 'guildId'>, config: IGuildConfigData) {
// 			await interaction.reply({
// 				embeds: [validateEmbed(new EmbedBuilder({
// 					title: `${interaction.guild!.name} Server Configurations`,
// 					fields: [
// 						{ name: 'Admin Roles', value: config.adminRoles.map(r => `<@&${r}>`).join(' ') || '-'}
// 					],
// 					color: hexToBit(ColorTheme.embeds.info),
// 					timestamp: Date.now()
// 				}))],
// 				ephemeral: true
// 			});

// 			return true;
// 		},

// 		async adminRole(interaction: RequiredFields<ChatInputCommandInteraction, 'guildId'>, config: IGuildConfigData) {
// 			type ActionType = 'add'|'remove';
// 			const action: ActionType  = interaction.options.getSubcommand() as ActionType;
// 			const role = interaction.options.getRole('role', true);

// 			const listIncludesRole = config.adminRoles.includes(role.id);
// 			if (
// 				(action == 'add' && listIncludesRole) ||
// 				(action == 'remove' && !listIncludesRole)
// 			) {
// 				await interaction.reply({
// 					embeds: [validateEmbed(new EmbedBuilder({
// 						description: `Role (<@&${role.id}>) is ${(action === 'add') ? 'already' : 'not'} present in the list`,
// 						color: hexToBit(ColorTheme.embeds.notice)
// 					}))],
// 					ephemeral: true
// 				});
// 				return `Duplicate action`;
// 			}
			
// 			switch (action) {
// 				case 'add': {
// 					config.adminRoles.push(role.id);
// 				} break;
// 				case 'remove': {
// 					config.adminRoles.splice(config.adminRoles.indexOf(role.id), 1);
// 				} break;
// 				default: break;
// 			}

// 			await GuildConfig.update(config);

// 			await interaction.reply({
// 				embeds: [validateEmbed(new EmbedBuilder({
// 					description: (action === 'add') ? 
// 						`Successfully **added** <@&${role.id}> to the list` :
// 						`Successfully **removed** <@&${role.id}> from the list`,
// 					color: hexToBit(ColorTheme.embeds.reply)
// 				}))],
// 				ephemeral: true
// 			})

// 			return true
// 		},
// 	}
// }