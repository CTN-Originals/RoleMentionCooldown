import 'dotenv/config';
import { Client, Collection, WebhookClient } from 'discord.js';

import { ConsoleInstance, Theme, ThemeOverride, defaultThemeProfile, defaultFilterKeys } from 'better-console-utilities';

import { registertAllEvents } from './register/registerEvents';
import { registerAllCommands } from './register/registerCommands';
import { GeneralData } from './data';

import * as deployScript from './deployCommands';
import { Database } from './data/orm/connect';

//? Set the default theme profile to my preferences
defaultThemeProfile.overrides.push(...[]);
defaultFilterKeys.push(...((GeneralData.logging.streamSafe) ? ['token'] : []));

export const cons = new ConsoleInstance();

export const client: Client = new Client({
	intents: [
		'Guilds',
		'GuildMessages',
		'GuildMembers',
		'MessageContent'
	]
});
export const logWebhook = new WebhookClient({id: process.env.LOG_WEBHOOK_ID!, token: process.env.LOG_WEBHOOK_TOKEN!});
export const testWebhook = new WebhookClient({id: process.env.TEST_WEBHOOK_ID!, token: process.env.TEST_WEBHOOK_TOKEN!});

async function Awake() {
	client.commands = new Collection();
	// client.contextMenus = new Collection();
	client.buttons = new Collection();
	client.selectMenus = new Collection();
	
	registertAllEvents(client, 'events');
	registerAllCommands(client, 'commands');

	if (process.argv.includes('--deploy')) {
		cons.log(process.argv);
		// const deployScript = require('./deployCommands.ts');
		await deployScript.doDeployCommands(client).then(() => {
			process.exit(0);
		});
	}
	else {
		Start();
	}
}

async function Start() {
	const db = new Database();
	await db.connect();
	
	await client.login(process.env.TOKEN);
}

if (!process.argv.includes('--test')) {
	Awake();
}