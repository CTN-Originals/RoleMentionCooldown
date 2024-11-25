import * as fs from 'node:fs';

import { Client } from 'discord.js'

import { cons } from '../index'

/** Get event files */
export function getEventFiles(client: Client, dir: string) {
	const eventfiles = fs.readdirSync(__dirname + '/../' + dir);
	for (const file of eventfiles) {
		if (file.startsWith('_') || ['index.ts', 'index.js'].includes(file)) { continue; } //* Skip files that start with '_' (private (non-event) files
		if (file.endsWith('.ts') || file.endsWith('.js')) {
			registerEvent(client, dir, file);
		}
		else if (file.match(/[a-zA-Z0-9 -_]+/i)) {
			if (file == 'Archive') { continue; }
			getEventFiles(client, dir + '/' + file);
		}
	}
}

/** Register the event files to the client */
function registerEvent(client: Client, dir: string, file: string) {
	const event = require(`../${dir}/${file}`).default;
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
	cons.log(`Registering [fg=#0080ff]Event[/>]: [fg=green]${event.name}[/>] - ./[fg=yellow]${dir}[/>]/[fg=cyan]${file}[/>]`);
}
