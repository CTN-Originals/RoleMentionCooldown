import 'dotenv/config';
import { Client, ComponentType, EmbedBuilder, Events, Guild, Interaction, InteractionType, Message, Routes, TextChannel } from 'discord.js';

import { ConsoleInstance } from 'better-console-utilities';

import generalData from '../data';
import { devEnvironment } from '../data';
import { EmitError, customEvents } from '.';
import { cons, errorConsole, testWebhook } from '..';
import { testEmbed, validateEmbed } from '../utils/embedUtils';
import { TODO } from '../@types';

// import ErrorHandler from '../handlers/errorHandler';

const thisConsole = new ConsoleInstance();

export default {
	name: Events.ClientReady,
	once: true,

	async execute(client: Client, ...args: any[]) {
		thisConsole.log(`Logged in as ${client.user?.tag}!\n`);

		if (generalData.development) {
			devEnvironment.client = client;
			// devEnvironment.memberList = devGuildMembers as Collection<string, GuildMember>;

			devEnvironment.guild = client.guilds.cache.get(process.env.DEV_GUILD_ID!);
			devEnvironment.user = await client.users.fetch(process.env.DEV_TEST_USER_ID!);
			devEnvironment.member = devEnvironment.memberList.get(process.env.DEV_TEST_USER_ID!);
			devEnvironment.channel = devEnvironment.guild?.channels.cache.get(process.env.DEV_TEST_CHANNEL_ID!);

			devEnvironment.restCommands = await client.rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.DEV_GUILD_ID!)) as {id: string, name: string, type: number, guild_id: string}[];

			thisConsole.logDefault('Dev Environment:', devEnvironment);
		}

		// await new Promise(resolve => setTimeout(resolve, 1000));
		this.runTests(client);
	},

	async runTests(client: Client) {
		const guild: Guild|undefined = client.guilds.cache.get(process.env.DEV_GUILD_ID!);
		const channel: TextChannel = await devEnvironment.client?.channels.fetch(devEnvironment.channelId) as TextChannel;
		// const collector: MessageCollector = channel!.createMessageCollector({
		// 	filter: (message) => message.content.includes('test')
		// })

		// collector.on('collect', (message) => {
		// 	if (message.channel.isSendable()) {
		// 		message.channel.send({content: `${message.author.displayName} said the word!!`});
		// 	}
		// })

		// new FakeInteraction('rolecooldown', {
		// 	subCommand: 'add',
		// 	options: [
		// 		{name: 'role', value: '811667577998671923'},
		// 		{name: 'cooldown', value: '1.486h'}
		// 	]
		// }).execute();
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
	public client: Client<boolean> = devEnvironment.client!;
	public guild: Guild = devEnvironment.guild!;
	public type: InteractionType = InteractionType.ApplicationCommand;
	public componentType: ComponentType = 1;

	public user: TODO;
	public channel: TODO

	public options: FakeInteractionOptions;

	constructor(
		public commandName: string,
		options: FakeInteractionInput
	) {
		this.user = {
			id: process.env.DEV_TEST_USER_ID!,
			username: 'keybotkiller',
			_equals: (user) => {return true},
		}
		this.channel = {
			id: process.env.DEV_TEST_CHANNEL_ID!,
			name: 'bot-testing',
		}

		this.options = new FakeInteractionOptions(options.options, options.subCommand);
	}

	public get channelId() { return this.channel.id }
	public get guildId() { return this.guild.id };

	public isRepliable() {return true};
	public async reply(replyContent: string | {content: string, ephemeral: boolean, embeds: EmbedBuilder[], components: any[]}): Promise<Message|boolean> {
		const channel = this.guild.channels.cache.get(this.channel.id);
		if (!channel || !(channel instanceof TextChannel)) return false;
		return channel.send(replyContent);
	}

	public execute() {
		this.client.emit('interactionCreate', this as unknown as Interaction)
	}
}