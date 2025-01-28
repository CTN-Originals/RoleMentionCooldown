import * as fs from 'node:fs';

import { Client } from 'discord.js'

import { cons } from '../index'
import { getAllFilesInDir, registeredLogString } from '.';

/** Register the event files to the client */
function registerEvent(client: Client, dir: string, file: string) {
	const event = require(`../${dir}/${file}`).default;
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
	// cons.log(`Registering [fg=#0080ff]Event[/>]: [fg=green]${event.name}[/>] - ./[fg=yellow]${dir}[/>]/[fg=cyan]${file}[/>]`);
	cons.log(registeredLogString('event', event.name, dir, file))
}


/** Get event files */
export function registertAllEvents(client: Client, dir: string) {
	getAllFilesInDir(client, registerEvent, dir, ['index.js', 'index.ts']);
}