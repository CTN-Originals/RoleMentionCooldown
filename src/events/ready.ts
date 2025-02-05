import 'dotenv/config';
import { Client, ComponentType, EmbedBuilder, Events, Guild, Interaction, InteractionType, Message, PermissionFlagsBits, Routes, TextChannel } from 'discord.js';

import { ConsoleInstance } from 'better-console-utilities';

import { GeneralData } from '../data';
import { DevEnvironment } from '../data';
import { Mentionable } from '../data/orm/mentionables';
import { UpdateBotListStats } from '../handlers/botLists';
import { getInteractionObject } from '../handlers/commandBuilder';

import PingCommand from '../commands/test/ping';
import ListCommand from '../commands/info/list';
import { testWebhook } from '..';

// import ErrorHandler from '../handlers/errorHandler';

const thisConsole = new ConsoleInstance();

export default {
	name: Events.ClientReady,
	once: true,

	async execute(client: Client, ...args: any[]) {
		thisConsole.log(`Logged in as ${client.user?.tag}!\n`);

		if (GeneralData.development) {
			DevEnvironment.client = client;
			// devEnvironment.memberList = devGuildMembers as Collection<string, GuildMember>;

			DevEnvironment.guild = client.guilds.cache.get(process.env.DEV_GUILD_ID!);
			DevEnvironment.user = await client.users.fetch(process.env.DEV_TEST_USER_ID!);
			DevEnvironment.member = DevEnvironment.memberList.get(process.env.DEV_TEST_USER_ID!);
			DevEnvironment.channel = DevEnvironment.guild?.channels.cache.get(process.env.DEV_TEST_CHANNEL_ID!) as TextChannel;

			DevEnvironment.restCommands = await client.rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.DEV_GUILD_ID!)) as {id: string, name: string, type: number, guild_id: string}[];

			thisConsole.logDefault('Dev Environment:', DevEnvironment);
		}

		this.Initialize(client);

		if (GeneralData.development) {
			this.runTests(client);
		}
	},

	async Initialize(client: Client) {
		client.guilds.cache.forEach(async guild => {
			Mentionable.initialize(guild);
		})

		// UpdateBotListStats();

		// this.Update(client); //? Start the update cycle
	},

	/** This function runs every second and calls out to things that need to be checked on the regular 
	 * @deprecated The current only use case for this function was to call {@link Mentionable.validateGuildCooldowns()}, which has also been depricated
	*/
	async Update(client: Client) { //?? Initially this was inside index.ts, but that brought a bunch of errors so next best is here i guess...
		const interval = setInterval(() => {
			client.guilds.cache.forEach(guild => {
				// Mentionable.validateGuildCooldowns(guild);
			})
		}, 1000)
	},

	async runTests(client: Client) {
		const guild: Guild = client.guilds.cache.get(process.env.DEV_GUILD_ID!)!;
		const channel: TextChannel = await DevEnvironment.client?.channels.fetch(DevEnvironment.channelId) as TextChannel;

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

		// const collector: MessageCollector = channel!.createMessageCollector({
		// 	filter: (message) => message.content.includes('test')
		// })

		// collector.on('collect', (message) => {
		// 	if (message.channel.isSendable()) {
		// 		message.channel.send({content: `${message.author.displayName} said the word!!`});
		// 	}
		// })

		
		// new FakeInteraction('test').execute();
		// const mentionTest = new FakeInteraction('mention', {
		// 	options: [
		// 		{name: 'role', value: {id: '1309653896788050043', name: '!q', hexColor: '#ff0000'}}
		// 	]
		// });
		// mentionTest.execute();
		// await new Promise<void>((resolve) => setTimeout(() => {resolve()}, 2000));
		// mentionTest.execute();

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

		// removeRole.execute();
		// addRole.options[1] = new FakeInteractionOptions([addRole.options[0], {name: 'cooldown', value: '120.9 123'}]);
		// addRole.execute();
		// addRole.options[1] = new FakeInteractionOptions([addRole.options[0], {name: 'cooldown', value: '123minutes 456sec'}]);
		// addRole.execute();
		// await new Promise(resolve => setTimeout(resolve, 3000));
		// removeRole.execute();

		// new FakeInteraction('help').execute();
		
		// await devEnvironment.channel?.send({content: '<@&811667577985302534>'})

		// try {
		// 	const message = await DevEnvironment.channel?.messages.fetch().then(list => list.find(m => m.id === '1309304556127260732'))
		// 	await message?.edit({embeds: [await getCurrentCooldownsEmbed(DevEnvironment.guild!, 'all')]})
		// } catch (e) {
		// 	EmitError(e as Error)
		// }
	}
};

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
				name: this.subCommand,
				options: this._hoistedOptions,
				type: 1
			}]
		}
	}
}

class FakeInteraction {
	public client: Client<boolean> = DevEnvironment.client!;
	public guild: Guild = DevEnvironment.guild!;
	public type: InteractionType = InteractionType.ApplicationCommand;
	public componentType: ComponentType = 1;

	public user: TODO;
	public channel: TODO

	public options: FakeInteractionOptions;

	constructor(
		public commandName: string,
		options?: FakeInteractionInput
	) {
		this.user = {
			id: process.env.DEV_TEST_USER_ID!,
			username: 'keybotkiller',
			_equals: (user) => {return true},
		}
		this.channel = DevEnvironment.channel;

		this.options = new FakeInteractionOptions(options?.options, options?.subCommand);
	}

	public get channelId() { return this.channel.id }
	public get guildId() { return this.guild.id };

	public isChatInputCommand() {return true}
	public isRepliable() {return true}
	public inGuild() { return true; }

	public async reply(replyContent: string | {content: string, ephemeral: boolean, embeds: EmbedBuilder[], components: any[]}): Promise<Message|boolean> {
		const channel = this.guild.channels.cache.get(this.channel.id);
		if (!channel || !(channel instanceof TextChannel)) return false;
		return channel.send(replyContent);
	}


	public execute() {
		this.client.emit('interactionCreate', this as unknown as Interaction)
	}
}