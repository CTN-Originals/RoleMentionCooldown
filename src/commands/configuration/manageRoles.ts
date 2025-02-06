
import { ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, ApplicationCommandOptionType, PermissionFlagsBits, GuildMember, Role } from "discord.js";
import { BaseButtonCollection, BaseEmbedCollection, BaseSelectMenuCollection, CommandInteractionData, IButtonCollection, ISelectMenuCollection } from "../../handlers/commandBuilder";

import { ColorTheme, GeneralData } from '../../data'
import { hexToBit, PeriodOfTime, includesAny } from "../../utils";
import { Mentionable } from "../../data/orm/mentionables";
import { ConsoleInstance } from "better-console-utilities";
import { validateEmbed } from "../../utils/embedUtils";
import { BaseMethodCollection } from "../../handlers/commandBuilder/data";
import { CooldownDefinition, IMentionableItem } from "../../data/orm/schemas/mentionableData";

const thisConsole = new ConsoleInstance();

const timeframes = ['s', 'm', 'h', 'd'];

class ButtonCollection extends BaseButtonCollection implements IButtonCollection<ButtonCollection> {}
class SelectMenuCollection extends BaseSelectMenuCollection implements ISelectMenuCollection<SelectMenuCollection> {}
class EmbedCollection extends BaseEmbedCollection {
	public getCooldownInstructionEmbed(cooldownInput: string, field: string, message?: string): EmbedBuilder[] {
		return [
			new EmbedBuilder({
				title: `Invalid Cooldown Input: \`${cooldownInput}\``,
				description: [
					`The cooldown option (\`${field}\`) you have entered is incorrect.${(message !== undefined) ? `\n${message}` : ''}`,
				].join('\n'),
				footer: {text: `Press "Arrow-Up" key to retry`},
				color: hexToBit(ColorTheme.embeds.notice)
			}),
			new EmbedBuilder({
				title: `Cooldown Instructions`,
				description: [
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
				color: hexToBit(ColorTheme.embeds.info)
			})
		];
	}

	public registeredNewRole(roleId: string, cooldown: PeriodOfTime) {
		return new EmbedBuilder({
			title: "Registered New Role Cooldown",
			description: [
				`**Note:** For users to mention this role,`,
				`they have to use the \`/mention\` command `,
				`followed by the \`role\` they like to mention.`,
			].join('\n'),
			fields: [
				{name: 'role', value: `<@&${roleId}>`, inline: true},
				{name: 'cooldown', value: `\`${cooldown.toString()}\``, inline: true},
				{name: '\u200B', value: `\u200B`, inline: true},
			],
			color: hexToBit(ColorTheme.embeds.reply),
		})
	}

	public targetRoleTooHigh(botMember: GuildMember, role: Role) {
		return new EmbedBuilder({
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
		})
	}

	public targetRoleNotRegistered(role: Role) {
		return new EmbedBuilder({
			description: [
				`The role you entered (<@&${role.id}>) is not registered as a rolecooldown.`,
				`Please first register this role for a cooldown with the following command:`,
				`\`/rolecooldown add role:${role.id}\``
			].join('\n'),
			color: hexToBit(ColorTheme.embeds.notice)
		});
	}
}
class MethodCollection extends BaseMethodCollection {
	//#region Utility Methods
	/** Validate the cooldown input that the user has provided
	 * @param input The cooldown input the user has provided
	 * @returns If valid, the PeriodOfTime object. If invalid, a message explaining why it is invalid
	*/
	private validateCooldownInput(input: string): PeriodOfTime | string {
		//? help out the user a bit and prevent the time from being 0 ms if they enter the full word time frame (yes, this happend before)
		input = input
		.replaceAll('seconds', 's').replaceAll('second', 's').replaceAll('sec', 's')
		.replaceAll('minutes', 'm').replaceAll('minute', 'm').replaceAll('min', 'm')
		.replaceAll('hours', 'h').replaceAll('hour', 'h')
		.replaceAll('days', 'd').replaceAll('day', 'd');

		//- no timeframe letters included but only single value
		if (!includesAny(input, timeframes) && input.split(' ').length == 1 && input.split('').every((n => '1234567890'.includes(n)))) {
			input += 's' //? convert it to seconds for ease of use
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
		
		//- input includes unknow character(s)
		for (const timeframe of input.split(' ')) {
			const suffix = timeframe.replace(parseFloat(timeframe).toString(), '')
			if (!timeframes.includes(suffix)) {
				return `\`${timeframe}\` contains unknown timeframe suffix: \`${suffix}\``;
			}
		}

		//- no timeframe letters included
		if (!includesAny(input, timeframes)) {
			return 'Some/All timeframes entered did not end in any of the timeframe letters.';
		}
		
		const cooldown = new PeriodOfTime(input);

		//- cooldown returned as 0
		if (cooldown.time === 0 && cooldown.input !== '0s') {
			return 'The cooldown time resulted to be `0` from the input that was given.\nThis usually happens when the input contains unexpected characters.'
		}

		return cooldown;
	}
	//#endregion

	//#region Add
	//TODO Add global, channel and user cooldown command options to the add subcommand as well but require the user to input at least one in any for the command to be valid
	public async addRole(interaction: ChatInputCommandInteraction) {
		if (!interaction.guild) {
			throw new Error(`Interaction did not contain guild`)
		}
		const roleId = interaction.options.get('role', true).value;
		
		let cooldownInput = interaction.options.getString('cooldown', true);

		const cooldown = this.validateCooldownInput(cooldownInput);
		
		//? if cooldown is a string, the input was invalid and coolodwn contains the message why it is invalid
		if (typeof cooldown === 'string') {
			await interaction.reply({
				embeds: command.embeds.getCooldownInstructionEmbed(cooldownInput, 'cooldown', cooldown),
				ephemeral: !GeneralData.development
			});

			return cooldown; //`Invalid cooldown input`
		}

		const newMentionable: IMentionableItem = Mentionable.make();
		newMentionable.cooldownTime.global = cooldown.time;

		const res = await Mentionable.add(interaction.guild?.id, roleId as string, newMentionable);

		if (res) {
			await interaction.reply({
				embeds: [validateEmbed(command.embeds.registeredNewRole(roleId as string, cooldown))],
				ephemeral: !GeneralData.development
			});
		} else {
			throw new Error(`"${interaction.guild.name}" Attempted to add new mentionable (${roleId}) unsuccessfully`)
		}

		return true;
	}
	//#endregion

	//#region Edit
	private async getCooldownObject(interaction: ChatInputCommandInteraction): Promise<CooldownDefinition<PeriodOfTime | null> | string> {
		const cooldownInput: CooldownDefinition<string|null> = {
			global: interaction.options.getString('global-cooldown'),
			channel: interaction.options.getString('channel-cooldown'),
			user: interaction.options.getString('user-cooldown'),
		}

		const cooldown: CooldownDefinition<PeriodOfTime | null | string> = {
			global: (cooldownInput.global !== null) ? this.validateCooldownInput(cooldownInput.global) : null,
			channel: (cooldownInput.channel !== null) ? this.validateCooldownInput(cooldownInput.channel) : null,
			user: (cooldownInput.user !== null) ? this.validateCooldownInput(cooldownInput.user) : null,
		}

		for (const field in cooldown) {
			if (typeof cooldown[field] === 'string') {
				await interaction.reply({
					embeds: command.embeds.getCooldownInstructionEmbed(cooldownInput[field], `${field}-cooldown`, cooldown[field]),
					ephemeral: !GeneralData.development
				});
				
				return `${field}-cooldown: ${cooldown[field]}`;
			}
		}

		return cooldown as CooldownDefinition<PeriodOfTime | null>;
	}

	public async editRole(interaction: ChatInputCommandInteraction) {
		const role = interaction.options.getRole('role', true) as Role;
		const mentionableDoc = await Mentionable.getDocument(interaction.guildId!);
		const mentionable = mentionableDoc.mentionables[role.id];

		if (!mentionable) {
			await interaction.reply({
				embeds: [command.embeds.targetRoleNotRegistered(role)],
				ephemeral: !GeneralData.development,
			});

			return `Target role not registered as mentionable`;
		}

		const cooldownInputs = await this.getCooldownObject(interaction);
		if (typeof cooldownInputs === 'string') {
			return cooldownInputs;
		}
		
		if (!Object.values(cooldownInputs).every(cd => cd === null)) {
			for (const cooldownField in cooldownInputs) {
				if (cooldownInputs[(cooldownField as keyof CooldownDefinition<PeriodOfTime>)] === null) { continue; }
				mentionable.cooldownTime[(cooldownField as keyof CooldownDefinition<any>)] = cooldownInputs[(cooldownField as keyof CooldownDefinition<PeriodOfTime>)]!.time;
			}

			await Mentionable.update(mentionableDoc);

			await interaction.reply({
				content: `Successfully updated <@&${role.id}>\n-# TODO: Send embed containing the current settings of the rolecooldown`,
				ephemeral: !GeneralData.development,
			});
		}
		else {
			await interaction.reply({
				content: `-# TODO: Send embed containing the current settings of the rolecooldown`,
				ephemeral: !GeneralData.development,
			});
		}

		return true;
	}
	//#endregion

	//#region Remove
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

		const res = await Mentionable.remove(interaction.guild?.id, roleId as string)

		if (res) {
			thisConsole.log(`[fg=green]${interaction.guild.name}[/>] Removed mentionable ${roleId}: ${res}`)
			
			// await role.setMentionable(false, 'RoleMentionCooldown - Removed'); //? set the role to mentionable so its able to be used
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
	//#endregion
}

const command = new CommandInteractionData<ButtonCollection, SelectMenuCollection, EmbedCollection, MethodCollection>({
	command: {
		content: {
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
							description: 'The cooldown to apply to this once its used (seperate with spaces). 8s 69m 28h 1d = 2d 05:09:08',
							minLength: 2,
							required: true,
						}
					]
				},
				{
					name: 'edit',
					description: 'Edit an existing role cooldown (Omit cooldown options to preserve the current cooldown)',
					options: [
						{
							type: ApplicationCommandOptionType.Role,
							name: 'role',
							description: 'The role to edit',
							required: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'global-cooldown',
							description: 'The cooldown that applies to everyone (overrides user/channel cooldown if its greater)',
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'channel-cooldown',
							description: 'The cooldown that applies to the channel that the rolemention was used in',
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'user-cooldown',
							description: 'The cooldown that applies to the user that used the rolemention',
						},
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
				case 'edit': return await command.methods.editRole(interaction);
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
