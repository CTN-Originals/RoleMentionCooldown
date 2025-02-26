import type { Client } from 'discord.js';
import * as fs from 'node:fs';
import type { InteractionDataType } from '../@types/discord';
import { ColorTheme } from '../data';

// Get files
export async function getAllFilesInDir(client: Client, callback: (client: Client, dir: string, file: string) => Promise<void>, dir: string, skipFilePatterns: string[] = []): Promise<void> {
	const commandFiles = fs.readdirSync(__dirname + '/../' + dir);
	for (const file of commandFiles) {
		if (file.endsWith('.ts') || file.endsWith('.js')) {
			//* Skip files that start with '_' (private (non-command) files)
			if (file.startsWith('_') || skipFilePatterns.includes(file)) { continue; } 
			await callback(client, dir, file);
		}
		// Check if the file is a folder
		else if (file.match(/[a-zA-Z0-9 -_]+/i)) {
			if (file == 'archive') { continue; } //* Skip the archive folder
			await getAllFilesInDir(client, callback, dir + '/' + file);
		}
	}
}

export function registeredLogString(type: InteractionDataType|string, name: string, dir?: string, file?: string): string {
	return [
		`Registering [fg=${ColorTheme.colors.blue.asHex}]${type}[/>]: `,
		`[fg=${ColorTheme.colors.green.asHex}]${name}[/>]`,
		(dir !== undefined) ? ` - ./[fg=${ColorTheme.colors.yellow.asHex}]${dir}[/>]` : '',
		(file !== undefined) ? `/[fg=${ColorTheme.colors.orange.asHex}]${file}[/>]` : '',
	].join('');
}