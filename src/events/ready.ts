import 'dotenv/config';
import { Client, ComponentType, EmbedBuilder, Events, Guild, Interaction, InteractionType, Message, Routes, TextChannel } from 'discord.js';

import { ConsoleInstance } from 'better-console-utilities';

import { GeneralData } from '../data';
import { DevEnvironment } from '../data';
import { EmitError, customEvents, eventConsole } from '.';
import { cons, errorConsole, testWebhook } from '..';
import { testEmbed, validateEmbed } from '../utils/embedUtils';
import { TODO } from '../@types';
import { Mentionable } from '../data/orm/mentionables';
import { IMentionableStorage, default as MentionableData } from '../data/orm/schemas/mentionableData'
import { timeUnits } from '../utils';
import { getCurrentCooldownsEmbed } from '../commands/info/list';
import { UserPermissions } from '../handlers/permissionHandler';

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

		this.Update(client); //? Start the update cycle
	},

	/** This function runs every second and calls out to things that need to be checked on the regular */
	async Update(client: Client) { //?? Initially this was inside index.ts, but that brought a bunch of errors so next best is here i guess...
		const interval = setInterval(() => {
			client.guilds.cache.forEach(guild => {
				Mentionable.validateGuildCooldowns(guild);
			})
		}, 1000)
	},

	async runTests(client: Client) {
		const guild: Guild|undefined = client.guilds.cache.get(process.env.DEV_GUILD_ID!);
		const channel: TextChannel = await DevEnvironment.client?.channels.fetch(DevEnvironment.channelId) as TextChannel;
		// const collector: MessageCollector = channel!.createMessageCollector({
		// 	filter: (message) => message.content.includes('test')
		// })

		// collector.on('collect', (message) => {
		// 	if (message.channel.isSendable()) {
		// 		message.channel.send({content: `${message.author.displayName} said the word!!`});
		// 	}
		// })

		
		// const addRole = new FakeInteraction('rolecooldown', {
		// 	subCommand: 'add',
		// 	options: [
		// 		{name: 'role', value: '1309653896788050043'},
		// 		{name: 'cooldown', value: '120.9 123'}
		// 	]
		// })
		// const removeRole = new FakeInteraction('rolecooldown', {
		// 	subCommand: 'remove',
		// 	options: [
		// 		{name: 'role', value: '1309653896788050043'}
		// 	]
		// })

		// removeRole.execute();
		// addRole.execute();
		// await new Promise(resolve => setTimeout(resolve, 3000));
		// removeRole.execute();

		// new FakeInteraction('list').execute();
		
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
		this.channel = {
			id: process.env.DEV_TEST_CHANNEL_ID!,
			name: 'bot-testing',
		}

		this.options = new FakeInteractionOptions(options?.options, options?.subCommand);
	}

	public get channelId() { return this.channel.id }
	public get guildId() { return this.guild.id };

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