import 'dotenv/config';
import { Client, Collection, WebhookClient } from 'discord.js';

import { ConsoleInstance, Theme, ThemeOverride, defaultThemeProfile, defaultFilterKeys } from 'better-console-utilities';

import { getEventFiles } from './startup/registerEvents';
import { getCommandFiles } from './startup/registerCommands';
import generalData from './data';

import * as deployScript from './deployCommands';
import { Database } from './data/orm/connect';

//? Set the default theme profile to my preferences
defaultThemeProfile.overrides.push(...[]);
defaultFilterKeys.push(...((generalData.logging.streamSafe) ? ['token'] : []));

export const cons = new ConsoleInstance();
export const errorConsole = new ConsoleInstance(defaultThemeProfile.clone());
errorConsole.theme.default = new Theme('#ff0000');
errorConsole.theme.typeThemes.default = new Theme('#dd0000');

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
	if (process.argv.includes('--deploy')) {
		cons.log(process.argv);
		// const deployScript = require('./deployCommands.ts');
		await deployScript.doDeployCommands(process.argv.slice(3)).then(() => {
			process.exit(0);
		});
	}
	else {
		Start();
	}
}

async function Start() {
	const db = new Database();
	db.connect();

	client.commands = new Collection();
	
	const getEventTime = [performance.now()];
	getEventFiles(client, 'events');
	getEventTime[1] = performance.now();

	const getCommandTime = [performance.now()];
	getCommandFiles(client, 'commands');
	getCommandTime[1] = performance.now();

	cons.log(`Registered ${client.eventNames().length} events in ${getEventTime[1] - getEventTime[0]}ms`);
	cons.log(`Registered ${client.commands.size} commands in ${getCommandTime[1] - getCommandTime[0]}ms`);
	
	await client.login(process.env.TOKEN);
}

Awake();