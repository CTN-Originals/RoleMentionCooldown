import { Client, Collection, WebhookClient } from 'discord.js';
import 'dotenv/config';

import { ConsoleInstance, defaultThemeProfile } from 'better-console-utilities';

import { GeneralData } from './data';
import { registerAllCommands } from './register/registerCommands';
import { registertAllEvents } from './register/registerEvents';

import { Database } from './data/orm/connect';
import * as deployScript from './deployCommands';
import { EmitError } from './events';

//? Set the default theme profile to my preferences
defaultThemeProfile.overrides.push(...[]);

export const cons = new ConsoleInstance();

export const client: Client = new Client({
	intents: [
		'Guilds',
	]
});
export const logWebhook = new WebhookClient({id: process.env.LOG_WEBHOOK_ID!, token: process.env.LOG_WEBHOOK_TOKEN!});
export const testWebhook = new WebhookClient({id: process.env.TEST_WEBHOOK_ID!, token: process.env.TEST_WEBHOOK_TOKEN!});

async function Awake(): Promise<void> {
	//- Check if more then one flag is true
	if (
		GeneralData.production && (GeneralData.beta || GeneralData.development) ||
		GeneralData.beta && (GeneralData.development || GeneralData.production) ||
		GeneralData.development && (GeneralData.production || GeneralData.beta)
	) {
		EmitError(new Error([
			'More then one startup flags are set to true, these flags need to be exclusive',
			`production (${GeneralData.production}), beta (${GeneralData.beta}), development (${GeneralData.development})`,
		].join('\n')));
		throw 'Start-up flags are non-exclusive';
	}

	client.commands = new Collection();
	client.buttons = new Collection();
	client.selectMenus = new Collection();
	
	await registertAllEvents(client, 'events');
	await registerAllCommands(client, 'commands');

	if (process.argv.includes('--deploy')) {
		cons.log(process.argv);
		await deployScript.doDeployCommands(client).then(() => {
			process.exit(0);
		});
	}
	else {
		Start();
	}
}

async function Start(): Promise<void> {
	const db = new Database();
	await db.connect();
	
	await client.login(process.env.TOKEN);
}

if (!process.argv.includes('--test')) {
	Awake();
}