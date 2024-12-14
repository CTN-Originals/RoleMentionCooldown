
import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, InteractionContextType, ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { BaseButtonCollection, BaseEmbedCollection, BaseSelectMenuCollection, CommandInteractionData, IButtonCollection, ISelectMenuCollection } from "../../handlers/commandBuilder";

import { ColorTheme, GeneralData } from '../../data'
import { hexToBit, PeriodOfTime, includesAll, includesAny } from "../../utils";
import { Mentionable } from "../../data/orm/mentionables";
import { EmitError } from "../../events";
import { ConsoleInstance } from "better-console-utilities";
import { validateEmbed } from "../../utils/embedUtils";
import { client } from "../..";
import { PermissionObject } from "../../handlers/permissionHandler";
import { BaseMethodCollection } from "../../handlers/commandBuilder/data";

const thisConsole = new ConsoleInstance();

const timeframes = ['s', 'm', 'h', 'd'];

class ButtonCollection extends BaseButtonCollection implements IButtonCollection<ButtonCollection> {}
class SelectMenuCollection extends BaseSelectMenuCollection implements ISelectMenuCollection<SelectMenuCollection> {}
class EmbedCollection extends BaseEmbedCollection {
	public getCooldownInstructionEmbed(cooldownInput: string, message?: string): EmbedBuilder {
		return new EmbedBuilder({
			title: `Invalid Cooldown Input: \`${cooldownInput}\``,
			description: [
				`The cooldown you have entered is incorrect.${(message !== undefined) ? `\n${message}` : ''}`,
				``,
				`**Cooldown Instructions**:`,
				`The cooldown input should be seperated with spaces for each timeframe entered.`,
				``,
				`Each timeframe should end in any of these letters:`,
				`\`s\` = \`seconds\``,
				`\`m\` = \`minutes\``,
				`\`h\` = \`hours\``,
				`\`d\` = \`days\``,
				``,
				`**Examples**:`,
				`\`8s 69m 28h 1d\` = \`2d 05:09:08\``,
				`\`600s\` = \`0d 00:10:00\``
			].join('\n'),
			color: hexToBit(ColorTheme.embeds.notice)
		});
	}
}
class MethodCollection extends BaseMethodCollection {
	/** Validate the cooldown input that the user has provided
	 * @param input The cooldown input the user has provided
	 * @returns If valid, the PeriodOfTime object. If invalid, a message explaining why it is invalid
	*/
	public validateCooldownInput(input: string): PeriodOfTime | string {
		//- input includes unknow character(s)
		for (const timeframe of input.split(' ')) {
			const end = timeframe[timeframe.length - 1]
			if (!timeframes.includes(end)) {
				return `\`${timeframe}\` contains unknown timeframe suffix: \`${end}\``;
			}
		}
		
		//- no timeframe letters included
		if (!includesAny(input, timeframes)) {
			if (input.split(' ').length == 1) { //- is the input just a single number
				input += 's' //? convert it to seconds for ease of use
			}
			else {
				return 'Some/All timeframes entered did not end in any of the timeframe letters.';
			}
		}

		//- not seperated by spaces
		let timeframeCount = 0;
		for (const timeframe of timeframes) {
			if (input.includes(timeframe)) {
				timeframeCount++;
			}
		}

		if (timeframeCount > 1 && !input.includes(' ')) {
			return 'The timeframes were not seperated by spaces.';
		}

		const cooldown = new PeriodOfTime(input);

		//- cooldown returned as 0
		if (cooldown.time === 0) {
			return 'The cooldown time resulted to be `0` from the input that was given.\nThis usually happens when the input contains unexpected characters.'
		}

		return cooldown;
	}

	public async addRole(interaction: ChatInputCommandInteraction) {
		if (!interaction.guild) {
			throw new Error(`Interaction did not contain guild`)
		}
		const roleId = interaction.options.get('role', true).value;
		
		let cooldownInput = interaction.options.getString('cooldown', true);

		//? help out the user a bit and prevent the time from being 0 ms if they enter the full word time frame (yes, this happend before)
		cooldownInput = cooldownInput
		.replaceAll('seconds', 's').replaceAll('second', 's').replaceAll('sec', 's')
		.replaceAll('minutes', 'm').replaceAll('minute', 'm').replaceAll('min', 'm')
		.replaceAll('hours', 'h').replaceAll('hour', 'h')
		.replaceAll('days', 'd').replaceAll('day', 'd');

		const cooldown = this.validateCooldownInput(cooldownInput)
		
		//? if cooldown is a string, the input was invalid and coolodwn contains the message why it is invalid
		if (typeof cooldown === 'string') { 
			await interaction.reply({
				embeds: [command.embeds.getCooldownInstructionEmbed(cooldownInput, cooldown)],
				ephemeral: true
			});

			return cooldown; //`Invalid cooldown input`
		}
		
		const role = interaction.guild.roles.cache.find(r => r.id == roleId);
		if (!role) {
			throw new Error(`Unable to find role (${roleId})`);
		}
		else {
			const botMember = interaction.guild.members.cache.get(client.user!.id);
			if (!botMember?.roles.highest.position || botMember?.roles.highest.position < role.position) {
				await interaction.reply({
					embeds: [validateEmbed(new EmbedBuilder({
						title: 'Unable to add role',
						description: [
							`My highest role (<@&${botMember?.roles.highest.id}>)`,
							`is positioned below the role you tried to add (<@&${role.id}>)`,
							`I can not manage roles that are placed above my own.\n`,
							`If you still like to add this role to this list,`,
							`you have to raise my highest role (<@&${botMember?.roles.highest.id}>)`,
							`above the role you want to add (<@&${role.id}>) or vise versa.`,
						].join('\n'),
						color: hexToBit(ColorTheme.embeds.notice)
					}))],
					ephemeral: true
				});

				return `Selected role is above my highest role`
			}
		}

		const res = await Mentionable.add(interaction.guild?.id, roleId as string, {
			cooldown: cooldown.time,
			lastUsed: -1
		})

		if (res) {
			// thisConsole.log(`[fg=green]${interaction.guild.name}[/>] Added new mentionable ${roleId}: ${res}`)

			await role.setMentionable(true, 'RoleMentionCooldown - Registered'); //? set the role to mentionable so its able to be used
			await interaction.reply({
				embeds: [validateEmbed(new EmbedBuilder({
					title: "Registered New Role Cooldown",
					description: [
						`**Note:** If I dont have permission to view a channel,`,
						`I will also not be able to detect the usage of these roles.`,
						`Make sure to add my role to any channel that you want to monitor for role usage.`,
					].join('\n'),
					fields: [
						{name: 'role', value: `<@&${roleId}>`, inline: true},
						{name: 'cooldown', value: `\`${cooldown.toString()}\``, inline: true},
						{name: '\u200B', value: `\u200B`, inline: true},
					],
					color: hexToBit(ColorTheme.embeds.reply),
				}))],
				ephemeral: !GeneralData.development
			});
		} else {
			throw new Error(`"${interaction.guild.name}" Attempted to add new mentionable (${roleId}) and was unsuccessfull`)
		}

		return true;
	}

	public async removeRole(interaction: ChatInputCommandInteraction) {
		if (!interaction.guild) {
			throw new Error(`Interaction did not contain guild`)
		}
		
		const roleId = interaction.options.get('role', true).value;
		const mentionable = await Mentionable.get(interaction.guild.id, roleId as string);
		
		if (mentionable === undefined) {
			await interaction.reply({
				embeds: [validateEmbed(new EmbedBuilder({
					description: `<@&${roleId}> is not included in the mention cooldown list.`,
					color: hexToBit(ColorTheme.embeds.notice)
				}))],
				ephemeral: true
			});
			return 'Role not present in list';
		}

		const role = interaction.guild.roles.cache.find(r => r.id == roleId);
		if (!role) {
			throw new Error(`Unable to find role (${roleId})`);
		}

		const res = await Mentionable.remove(interaction.guild?.id, roleId as string)

		if (res) {
			thisConsole.log(`[fg=green]${interaction.guild.name}[/>] Removed mentionable ${roleId}: ${res}`)
			
			await role.setMentionable(false, 'RoleMentionCooldown - Removed'); //? set the role to mentionable so its able to be used
			await interaction.reply({
				embeds: [validateEmbed(new EmbedBuilder({
					description: `Successfully removed <@&${roleId}> from the list.\nDisabled the ability to mention <@&${roleId}> for everyone.`,
					color: hexToBit(ColorTheme.embeds.reply)
				}))],
				ephemeral: true
			});
		} else {
			throw new Error(`"${interaction.guild.name}" Attempted to remove mentionable (${roleId}) and was unsuccessfull`)
		}

		return true
	}
}

const command = new CommandInteractionData<ButtonCollection, SelectMenuCollection, EmbedCollection, MethodCollection>({
	command: {
		data: {
			name: 'rolecooldown',
			description: 'Manage role cooldowns',
			contexts: [InteractionContextType.Guild],
			default_member_permissions: (PermissionFlagsBits.ManageRoles).toString(),
			subcommands: [
				{
					name: 'add',
					description: 'Add a new role to the list, or edit an existing one',
					options: [
						{
							type: ApplicationCommandOptionType.Role,
							name: 'role',
							description: 'The role to add',
							required: true,
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'cooldown',
							description: 'The cooldown to apply to the this once its used (seperate with spaces). 8s 69m 28h 1d = 2d 05:09:08',
							minLength: 2,
							required: true,
						}
					]
				},
				{
					name: 'remove',
					description: 'Remove a role from the list',
					options: [
						{
							type: ApplicationCommandOptionType.Role,
							name: 'role',
							description: 'The role to remove',
							required: true
						}
					]
				}
			]
		},
		execute: async function (interaction: ChatInputCommandInteraction) {
			const subCommand = interaction.options.getSubcommand();
			switch (subCommand) {
				case 'add': return await command.methods.addRole(interaction);
				case 'remove': return await command.methods.removeRole(interaction);
				default: break;
			}

			//? if code reaches here, that means that all subcommands and groups fell through somehow...
			throw new Error(`Unknown command command:${interaction.commandName} sub:${subCommand}`);
		},
	},
	buttons: new ButtonCollection(),
	selectMenus: new SelectMenuCollection(),
	embeds: new EmbedCollection(),
	methods: new MethodCollection()
});

export default command;

// const old = {
// 	command: {
// 		permissions: new PermissionObject({
// 			guildAdmin: true,
// 			configAdmin: true,
// 		}),
// 		data: new SlashCommandBuilder()
// 			.setName("rolecooldown")
// 			.setDescription("Manage role cooldowns")
// 			.addSubcommand(sub => sub
// 				.setName("add")
// 				.setDescription("Add a new role to the list, or edit an existing one")
// 				.addRoleOption(option => option
// 					.setName('role')
// 					.setDescription('The role to add')
// 					.setRequired(true)
// 				)
// 				.addStringOption(option => option
// 					.setName('cooldown')
// 					.setDescription('The cooldown to apply to the this once its used (seperate with spaces). 8s 69m 28h 1d = 2d 05:09:08')
// 					.setRequired(true)
// 					.setMinLength(2)
// 				)
// 			)
// 			.addSubcommand(sub => sub
// 				.setName("remove")
// 				.setDescription("Remove a role from the list")
// 				.addRoleOption(option => option
// 					.setName('role')
// 					.setDescription('The role to remove')
// 					.setRequired(true)
// 				)
// 			),
// 		async execute(interaction: ChatInputCommandInteraction) {
// 			const subCommand = interaction.options.getSubcommand();
// 			switch (subCommand) {
// 				case 'add': return await this.addRole(interaction);
// 				case 'remove': return await this.removeRole(interaction);
// 				default: break;
// 			}

// 			//? if code reaches here, that means that all subcommands and groups fell through somehow...
// 			throw new Error(`Unknown command command:${interaction.commandName} sub:${subCommand}`);
// 		},
// 		async addRole(interaction: ChatInputCommandInteraction) {
// 			if (!interaction.guild) {
// 				throw new Error(`Interaction did not contain guild`)
// 			}
// 			const roleId = interaction.options.get('role', true).value;

			
// 			let cooldownInput = interaction.options.getString('cooldown', true);

// 			//? help out the user a bit and prevent the time from being 0 ms if they enter the full word time frame (yes, this happend before)
// 			cooldownInput = cooldownInput
// 			.replaceAll('seconds', 's').replaceAll('second', 's').replaceAll('sec', 's')
// 			.replaceAll('minutes', 'm').replaceAll('minute', 'm').replaceAll('min', 'm')
// 			.replaceAll('hours', 'h').replaceAll('hour', 'h')
// 			.replaceAll('days', 'd').replaceAll('day', 'd');

// 			const cooldown = validateCooldownInput(cooldownInput)
			
// 			//? if cooldown is a string, the input was invalid and coolodwn contains the message why it is invalid
// 			if (typeof cooldown === 'string') { 
// 				await interaction.reply({
// 					embeds: [getCooldownInstructionEmbed(cooldownInput, cooldown)],
// 					ephemeral: true
// 				});

// 				return cooldown; //`Invalid cooldown input`
// 			}
			
// 			const role = interaction.guild.roles.cache.find(r => r.id == roleId);
// 			if (!role) {
// 				throw new Error(`Unable to find role (${roleId})`);
// 			}
// 			else {
// 				const botMember = interaction.guild.members.cache.get(client.user!.id);
// 				if (!botMember?.roles.highest.position || botMember?.roles.highest.position < role.position) {
// 					await interaction.reply({
// 						embeds: [validateEmbed(new EmbedBuilder({
// 							title: 'Unable to add role',
// 							description: [
// 								`My highest role (<@&${botMember?.roles.highest.id}>)`,
// 								`is positioned below the role you tried to add (<@&${role.id}>)`,
// 								`I can not manage roles that are placed above my own.\n`,
// 								`If you still like to add this role to this list,`,
// 								`you have to raise my highest role (<@&${botMember?.roles.highest.id}>)`,
// 								`above the role you want to add (<@&${role.id}>) or vise versa.`,
// 							].join('\n'),
// 							color: hexToBit(ColorTheme.embeds.notice)
// 						}))],
// 						ephemeral: true
// 					});

// 					return `Selected role is above my highest role`
// 				}
// 			}

// 			const res = await Mentionable.add(interaction.guild?.id, roleId as string, {
// 				cooldown: cooldown.time,
// 				lastUsed: -1
// 			})

// 			if (res) {
// 				// thisConsole.log(`[fg=green]${interaction.guild.name}[/>] Added new mentionable ${roleId}: ${res}`)
	
// 				await role.setMentionable(true, 'RoleMentionCooldown - Registered'); //? set the role to mentionable so its able to be used
// 				await interaction.reply({
// 					embeds: [validateEmbed(new EmbedBuilder({
// 						title: "Registered New Role Cooldown",
// 						description: [
// 							`**Note:** If I dont have permission to view a channel,`,
// 							`I will also not be able to detect the usage of these roles.`,
// 							`Make sure to add my role to any channel that you want to monitor for role usage.`,
// 						].join('\n'),
// 						fields: [
// 							{name: 'role', value: `<@&${roleId}>`, inline: true},
// 							{name: 'cooldown', value: `\`${cooldown.toString()}\``, inline: true},
// 							{name: '\u200B', value: `\u200B`, inline: true},
// 						],
// 						color: hexToBit(ColorTheme.embeds.reply),
// 					}))],
// 					ephemeral: !GeneralData.development
// 				});
// 			} else {
// 				throw new Error(`"${interaction.guild.name}" Attempted to add new mentionable (${roleId}) and was unsuccessfull`)
// 			}

// 			return true;
// 		},
// 		async removeRole(interaction: ChatInputCommandInteraction) {
// 			if (!interaction.guild) {
// 				throw new Error(`Interaction did not contain guild`)
// 			}
			
// 			const roleId = interaction.options.get('role', true).value;
// 			const mentionable = await Mentionable.get(interaction.guild.id, roleId as string);
			
// 			if (mentionable === undefined) {
// 				await interaction.reply({
// 					embeds: [validateEmbed(new EmbedBuilder({
// 						description: `<@&${roleId}> is not included in the mention cooldown list.`,
// 						color: hexToBit(ColorTheme.embeds.notice)
// 					}))],
// 					ephemeral: true
// 				});
// 				return 'Role not present in list';
// 			}

// 			const role = interaction.guild.roles.cache.find(r => r.id == roleId);
// 			if (!role) {
// 				throw new Error(`Unable to find role (${roleId})`);
// 			}

// 			const res = await Mentionable.remove(interaction.guild?.id, roleId as string)

// 			if (res) {
// 				thisConsole.log(`[fg=green]${interaction.guild.name}[/>] Removed mentionable ${roleId}: ${res}`)
				
// 				await role.setMentionable(false, 'RoleMentionCooldown - Removed'); //? set the role to mentionable so its able to be used
// 				await interaction.reply({
// 					embeds: [validateEmbed(new EmbedBuilder({
// 						description: `Successfully removed <@&${roleId}> from the list.\nDisabled the ability to mention <@&${roleId}> for everyone.`,
// 						color: hexToBit(ColorTheme.embeds.reply)
// 					}))],
// 					ephemeral: true
// 				});
// 			} else {
// 				throw new Error(`"${interaction.guild.name}" Attempted to remove mentionable (${roleId}) and was unsuccessfull`)
// 			}

// 			return true
// 		},
// 	},
// }

