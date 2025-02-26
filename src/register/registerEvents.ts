
import type { Client } from 'discord.js';

import { getAllFilesInDir, registeredLogString } from '.';
import { GeneralData } from '../data';
import { cons } from '../index';

/** Register the event files to the client */
async function registerEvent(client: Client, dir: string, file: string): Promise<void> {
	const event = (await import(`../${dir}/${file}`)).default;
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
	// cons.log(`Registering [fg=#0080ff]Event[/>]: [fg=green]${event.name}[/>] - ./[fg=yellow]${dir}[/>]/[fg=cyan]${file}[/>]`);
	if (GeneralData.logging.startup.enabled && GeneralData.logging.startup.events) {
		cons.log(registeredLogString('event', event.name, dir, file));
	}
}


/** Get event files */
export async function registertAllEvents(client: Client, dir: string): Promise<void> {
	await getAllFilesInDir(client, registerEvent, dir, ['index.js', 'index.ts']);
}