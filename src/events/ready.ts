import type { Client, ComponentType, EmbedBuilder, Guild, Interaction, Message } from 'discord.js'
import { Events, InteractionType, Routes, TextChannel } from 'discord.js'
import 'dotenv/config'

import { ConsoleInstance } from 'better-console-utilities'

import { DevEnvironment, GeneralData } from '../data'
import { Mentionable } from '../data/orm/mentionables'

import { EmitError } from '.'


// import ErrorHandler from '../handlers/errorHandler';

const thisConsole = new ConsoleInstance()

export default {
	name: Events.ClientReady,
	once: true,

	async execute(client: Client, ...args: any[]) {
		thisConsole.log(`Logged in as ${client.user?.tag}!\n`)

		if (GeneralData.development) {
			DevEnvironment.client = client
			// devEnvironment.memberList = devGuildMembers as Collection<string, GuildMember>;

			DevEnvironment.guild = client.guilds.cache.get(process.env.DEV_GUILD_ID!)
			DevEnvironment.user = await client.users.fetch(process.env.DEV_TEST_USER_ID!)
			DevEnvironment.member = DevEnvironment.memberList.get(process.env.DEV_TEST_USER_ID!)
			DevEnvironment.channel = DevEnvironment.guild?.channels.cache.get(process.env.DEV_TEST_CHANNEL_ID!) as TextChannel

			DevEnvironment.restCommands = await client.rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.DEV_GUILD_ID!)) as {id: string, name: string, type: number, guild_id: string}[]

			// thisConsole.logDefault('Dev Environment:', DevEnvironment);
		}

		this.Initialize(client)

		if (GeneralData.development) {
			this.runTests(client)
		}
	},

	async Initialize(client: Client) {
		client.guilds.cache.forEach(async guild => {
			Mentionable.initialize(guild)
		})
	},

	async runTests(client: Client) {
		const guild: Guild = client.guilds.cache.get(process.env.DEV_GUILD_ID!)!
		const channel: TextChannel = await DevEnvironment.client?.channels.fetch(DevEnvironment.channelId) as TextChannel

		// const role = await guild.roles.cache.get('1309653896788050043')!;
		// const mentionable = await Mentionable.get(guild.id, role.id)!;

		// const channelSelect = RoleCooldownCommand.selectMenus.buildOne<ChannelSelectMenuBuilder>(RoleCooldownCommand.selectMenus.channelSelection.content);
		// const row: any = new ActionRowBuilder().addComponents(channelSelect);

		// const msg = await channel.send({
		// 	embeds: RoleCooldownCommand.embeds.mentionableInfo(mentionable!, role),
		// 	components: [row]
		// });

		// testWebhook.send({
		// 	embeds: [await ListCommand.embeds.getCurrentCooldownsEmbed(guild, 'all')]
		// })

		// console.log(getInteractionObject(PingCommand.command));
		// console.log(getInteractionObject(PingCommand.buttons.butt));
		// console.log(getInteractionObject(PingCommand.selectMenus.str));

		// const commands = await client.application?.commands.fetch({force: true, cache: true, guildId: DevEnvironment.guildId});
		// const ping = commands?.get('1310295745215336482')!;
		// console.log(ping);
		// console.log(await guild.commands.permissions.fetch({}))
		// console.log(await ping.permissions.fetch({guild: guild}))

		
		// const mentionTest = new FakeInteraction('rolecooldown', {
		// 	subCommand: 'edit',
		// 	options:    [
		// 		{name: 'role', value: {id: '1309653896788050043', name: '!q', hexColor: '#000000'}},
		// 		// {name: 'global-cooldown', value: '0'},
		// 		{name: 'channel-cooldown', value: '6127s'},
		// 		{name: 'user-cooldown', value: '24d 23h 5m 32s'},
		// 	]
		// })
		// await mentionTest.execute()

		// channel.send({
		// 	content: '``` ```',
		// 	embeds: [RoleCooldownCommand.embeds.scopeSettingInstructions('channel'), RoleCooldownCommand.embeds.scopeSettingInstructions('role')]
		// });

		// await new Promise<void>((resolve) => setTimeout(() => {resolve()}, 2000));
		// mentionTest.execute();

		
		//#region cooldown input validation
		// new FakeInteraction('test').execute();
		// new FakeInteraction('rolecooldown', {
		// 	subCommand: 'add',
		// 	options: [
		// 		{name: 'role', value: '1309653896788050043'},
		// 		{name: 'cooldown', value: '1203'}
		// 	]
		// }).execute();
		// new FakeInteraction('rolecooldown', {
		// 	subCommand: 'add',
		// 	options: [
		// 		{name: 'role', value: '1309653896788050043'},
		// 		{name: 'cooldown', value: '123minutes456sec'}
		// 	]
		// }).execute();
		// new FakeInteraction('rolecooldown', {
		// 	subCommand: 'add',
		// 	options: [
		// 		{name: 'role', value: '1309653896788050043'},
		// 		{name: 'cooldown', value: '12s-1m'}
		// 	]
		// }).execute();
		// new FakeInteraction('rolecooldown', {
		// 	subCommand: 'add',
		// 	options: [
		// 		{name: 'role', value: '1309653896788050043'},
		// 		{name: 'cooldown', value: '0d 15m 0:00'}
		// 	]
		// }).execute();
		// new FakeInteraction('rolecooldown', {
		// 	subCommand: 'add',
		// 	options: [
		// 		{name: 'role', value: '1309653896788050043'},
		// 		{name: 'cooldown', value: '23grm 43rts'}
		// 	]
		// }).execute();
		// new FakeInteraction('rolecooldown', {
		// 	subCommand: 'add',
		// 	options: [
		// 		{name: 'role', value: '1309653896788050043'},
		// 		{name: 'cooldown', value: '123gr 456te'}
		// 	]
		// }).execute();

		// const removeRole = new FakeInteraction('rolecooldown', {
		// 	subCommand: 'remove',
		// 	options: [
		// 		{name: 'role', value: '1309653896788050043'}
		// 	]
		// })
		//#endregion


		// try {
		// 	const message = await DevEnvironment.channel?.messages.fetch().then(list => list.find(m => m.id === '1309304556127260732'))
		// 	await message?.edit({embeds: [await getCurrentCooldownsEmbed(DevEnvironment.guild!, 'all')]})
		// } catch (e) {
		// 	EmitError(e as Error)
		// }
	}
}

type InteractionOptionEntry = {name: string, value: any}
type FakeInteractionInput = {
	subCommand?: string,
	options: InteractionOptionEntry[]
}

class FakeInteractionOptions {
	constructor(
		public _hoistedOptions: InteractionOptionEntry[] = [],
		public subCommand?: string,
		public group?: string
	) {}

	public get(option: string) {
		return this._hoistedOptions.find(o => o.name === option)
	}
	public getString(option: string) { return this.get(option)?.value }
	public getRole(option: string) { return this.get(option)?.value }
	//TODO add typed getters like getString or getRole...

	public getSubcommand(required: boolean) { return this.subCommand }
	public getSubcommandGroup(required: boolean) { return this.group }

	public get _subcommand() { return this.subCommand }

	public get data() { //TODO include groups
		if (!this.subCommand) { return this._hoistedOptions }
		else {
			return [{
				name:    this.subCommand,
				options: this._hoistedOptions,
				type:    1
			}]
		}
	}
}

class FakeInteraction {
	public client: Client<boolean> = DevEnvironment.client!
	public guild: Guild = DevEnvironment.guild!
	public type: InteractionType = InteractionType.ApplicationCommand
	public componentType: ComponentType = 1

	public user: TODO
	public channel: TODO

	public options: FakeInteractionOptions

	constructor(
		public commandName: string,
		options?: FakeInteractionInput
	) {
		this.user = {
			id:       process.env.DEV_TEST_USER_ID!,
			username: 'TEST_USER',
			_equals:  (user) => {return true},
		}
		this.channel = DevEnvironment.channel

		this.options = new FakeInteractionOptions(options?.options, options?.subCommand)
	}

	public get channelId() { return this.channel.id }
	public get guildId() { return this.guild.id };

	private message: Message | null = null

	public isChatInputCommand() {return true}
	public isRepliable() {return true}
	public inGuild() { return true }

	public fetchReply(): Promise<Message<boolean>> {
		if (!this.message) {
			EmitError(new Error('Unable to fetch reply of interaction'))
		}

		return new Promise((resolve) => {resolve(this.message!)})
	}

	public async reply(replyContent: string | {content: string, ephemeral: boolean, embeds: EmbedBuilder[], components: any[]}): Promise<Message|boolean> {
		const channel = this.guild.channels.cache.get(this.channel.id)
		if (!channel || !(channel instanceof TextChannel)) return false

		this.message = await channel.send(replyContent)
		return this.message
	}


	public execute() {
		this.client.emit('interactionCreate', this as unknown as Interaction)
	}
}