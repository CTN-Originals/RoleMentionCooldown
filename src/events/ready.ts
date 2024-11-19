import 'dotenv/config';
import { APIUser, Client, Collection, CommandInteraction, EmbedBuilder, Events, Guild, GuildMember, Message, REST, Routes, TextChannel, User } from 'discord.js';
import { InteractionResponses } from "discord.js/src/structures/interfaces/InteractionResponses";

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
		// thisConsole.logDefault(client);
		// thisConsole.log(client);
		
		// const t0 = performance.now();
		// const devGuildMembers = await client.guilds.cache.get(process.env.DEV_GUILD_ID!)?.members.fetch();
		// const t1 = performance.now();
		// thisConsole.log(`Fetched ${devGuildMembers?.size} guild members in ${t1 - t0}ms`);

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
		
		/* //? discord token generation test
			try {
				const genToken = await request('https://discord.com/api/oauth2/token', {
					method: 'POST',
					body: new URLSearchParams({
						client_id: process.env.CLIENT_ID!,
						client_secret: process.env.TOKEN!,
						grant_type: 'authorization_code',
						scope: 'bot',
						redirect_uri: 'http://localhost:5000',
						code: process.env.TOKEN!,
					}).toString(),
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				});

				const genTokenData = await genToken.body.json();
				thisConsole.log(genTokenData);
			} 
			catch (error) {
				EmitError(error as Error);
			}
		*/

		/* //? A test for token filtering
		const testObj = {id: '123', token: 'a1b2c3d4e5f6g7h8i9j10k11l12m13n14o15p16q17r18s19t20u21v22w23x24y25z', 
			client: {
				application: {
					id: '123',
					name: 'Test',
					description: 'Test',
					age: 48,
					bot: true,
					token: 'a1b2c3d4e5f6g7h8i9j10k11l12m13n14o15p16q17r18s19t20u21v22w23x24y25z',
					rec: {},
				}
			}
		};
		testObj.client.application.rec = testObj.client.application;
		cons.logDefault(testObj);
		*/

		// const rest = new REST({ version: '9' }).setToken(process.env.TOKEN!);
		// var t0 = performance.now();
		
		// var t1 = performance.now();
		// thisConsole.log(`execution time: ${t1 - t0} ms`);

		// const simBaseInteraction = new SimBaseInteraction();
		// const simInteraction = new SimCommandInteraction({
		// 	commandName: 'sub-ping',
		// 	...defaultBaseInteractionArgs,
		// });

		// console.log(InteractionResponses.prototype)
		// cons.logDefault(simBaseInteraction);
		// cons.logDefault(simInteraction);
		// cons.logDefault('Command Simulation:', simInteraction.simulate());
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

		/* //? This is using a fake interaction object to test slash
			//? This is using a fake interaction object to test commands
			const fakeInteraction: any = {
				client: client,
				guild: guild as Guild,
				commandName: 'ping',
				type: 2,
				componentType: 1,
				guildId: guild?.id,
				channelId: process.env.DEV_TEST_CHANNEL_ID,
				user: {
					id: process.env.DEV_TEST_USER_ID,
					username: 'keybotkiller',
					_equals: (user) => {return true},
				},
				channel: {
					id: process.env.DEV_TEST_CHANNEL_ID,
					name: 'bot-testing',
				} as Partial<TextChannel>,
				options: {
					data: {}
				},
				isRepliable: () => {return true},
				reply: async (replyContent: string | {content: string, ephemeral: boolean, embeds: EmbedBuilder[], components: any[]}): Promise<Message|boolean> => {
					const channel = guild?.channels.cache.get(fakeInteraction.channel.id);
					if (!channel || !(channel instanceof TextChannel)) return false;
					return channel.send(replyContent);
				},
			}
			//? This is testing the error handler
			client.emit(Events.InteractionCreate, fakeInteraction);
		*/

		/* //? This is using a fake message object to test the embed validator
		const validatedTestEmbed = validateEmbed(testEmbed);
		console.log(validatedTestEmbed);
		testWebhook.send({
			embeds: [validatedTestEmbed]
		});
		 */
	}
};


/* //? string builder to filter out a 72 char discord token and replace it
import (
    "fmt"
    "strings"
)

func main() {
    myString := "Hahaha world [code here] Yes"
    n := len(myString)
    last := 0
    var sb strings.Builder
    for i := 0; i <= n; i++ {
        if i >= n || myString[i] == ' ' {
            if i-last == 72 {
                sb.WriteString(strings.Repeat("*", i-last))
            } else {
                sb.WriteString(myString[last:i])
            }
            sb.WriteRune(' ')
            last = i + 1
        }
    }

    fmt.Println(sb.String())
}
*/
