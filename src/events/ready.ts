import 'dotenv/config';
import { APIUser, Channel, Client, Collection, CommandInteraction, EmbedBuilder, Events, Guild, GuildMember, Message, MessageCollector, REST, Routes, TextChannel, User } from 'discord.js';
// import { InteractionResponses } from "discord.js/src/structures/interfaces/InteractionResponses";

import { ConsoleInstance } from 'better-console-utilities';

import generalData from '../data';
import { devEnvironment } from '../data';
import { EmitError, customEvents } from '.';
import { cons, errorConsole, testWebhook } from '..';
import { testEmbed, validateEmbed } from '../utils/embedUtils';
import { SimBaseInteraction, defaultBaseInteractionArgs } from '../simulators';
import { SimCommandInteraction } from '../simulators/commandInteraction';
import { SimBaseComponentInteraction, SimStringSelectMenuInteraction } from '../simulators/componentInteraction';

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

		// const simBaseInteraction = new SimBaseInteraction();
		// const simInteraction = new SimCommandInteraction({
		// 	commandName: 'ping',
		// 	...defaultBaseInteractionArgs,
		// });

		// // console.log(InteractionResponses.prototype)
		// // cons.logDefault(simBaseInteraction);
		// // cons.logDefault(simInteraction);
		// // cons.logDefault('Command Simulation:', simInteraction.simulate());
		// simInteraction.simulate()
		// const simReply = await simInteraction.awaitReply();
		// let simComponentInteraction: SimBaseComponentInteraction;
		// if (simReply) {
		// 	try {
		// 		simComponentInteraction = new SimStringSelectMenuInteraction({customId: 'string-select-test', message: simReply, values: ['hello']});
		// 		simComponentInteraction.simulate()
		// 		cons.logDefault(simComponentInteraction.component)
		// 	} catch (err) {
		// 		errorConsole.log(`Error while trying to create SimBaseComponentInteraction`)
		// 	}
		// }
	}
};
