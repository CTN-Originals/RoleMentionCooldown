//? This script takes care of updating all the bot lists this server is registered on
//? lists like top.gg or discordlist.gg

import axios from "axios";
import { EmitError } from "../events";
import { GeneralData } from "../data";
import { client, cons } from "..";

type IListDefinition = Pick<ListDefinition, 'domain' | 'suffix' | 'urlFormat' | 'guildCountKey'> & Partial<Pick<ListDefinition, 'userCountKey'>>;
class ListDefinition {
	//? Collect the domain and suffix to be able to parse the .env entry
	public domain!: string;
	public suffix!: string;

	/** The format of the url with replacers to point to where variables should replace
	 * @usage replacers are the name of the variable wraped with <>
	 * @keys bot_id
	 * @example
	 * "https://top.gg/api/bots/<bot_id>"
	*/
	public urlFormat!: string;

	public guildCountKey!: string;
	public userCountKey: string|null = null;

	constructor(input: IListDefinition) {
		for (const key in input) {
			this[key] = input[key];
		}
	}

	public get url() {
		return this.urlFormat.replaceAll('<bot_id>', process.env.CLIENT_ID!);
	}

	public get auth(): string|undefined {
		return process.env[`BOT_LIST_AUTH_TOKEN_${this.domain.toUpperCase()}_${this.suffix.toUpperCase()}`];
	}

	public Update(guildCount: number, userCount: number): true|string {
		const auth = this.auth;
		if (!auth) {
			EmitError(new Error(`Could not find Autherization token for ${this.domain}.${this.suffix}`));
			return 'Missing Autherization token';
		}

		let data = {
			[this.guildCountKey]: guildCount
		};
		
		if (this.userCountKey != null) {
			data[this.userCountKey] = userCount;
		}

		let config = {
			method: 'post',
			maxBodyLength: Infinity,
			url: this.url,
			headers: { 
				'Authorization': auth,
				'Content-Type': 'application/json'
			},
			data : JSON.stringify(data)
		};

		axios.request(config)
		.then((response) => {
			if (GeneralData.development) {
				console.log('\n' + this.domain)
				console.log(JSON.stringify(response.data));
			}
		})
		.catch((error) => {
			console.log(this.domain);
			EmitError(error);
		});

		return true; //? even though the request might have failed, return true as we are not awaiting the request to save load times
	}
}

const listDefinitions: IListDefinition[] = [
	{
		domain: 'top',
		suffix: 'gg',
		urlFormat: 'https://top.gg/api/bots/<bot_id>/stats',
		guildCountKey: 'server_count',
	},
	{
		domain: 'discordlist',
		suffix: 'gg',
		urlFormat: 'https://api.discordlist.gg/v0/bots/<bot_id>/guilds',
		guildCountKey: 'count',
	},
	{
		domain: 'discordbotlist',
		suffix: 'com',
		urlFormat: 'https://discordbotlist.com/api/v1/bots/<bot_id>/stats',
		guildCountKey: 'guilds',
		userCountKey: 'users'
	},
]


export async function UpdateBotListStats() {
	let guildCount = 0;
	let userCount = 0;

	for (const guild of client.guilds.cache) {
		guildCount++;
		userCount += guild[1].memberCount;
	}
	
	cons.log(`-- Update bot lists --\nGuilds: ${guildCount}\nUsers: ${userCount}`);
	for (const item of listDefinitions) {
		const list = new ListDefinition(item);
		
		if (!GeneralData.development) {
			list.Update(guildCount, userCount);
		}
		else {
			cons.log(`Updated ${list.domain}.${list.suffix}`);
		}
	}
}