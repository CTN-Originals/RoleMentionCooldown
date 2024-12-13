import { Client } from "discord.js";
import * as fs from 'node:fs';
import { ColorTheme } from "../data";
import { InteractionDataType } from "../@types/discord";

// Get files
export function getAllFilesInDir(client: any, callback: (client: Client, dir: string, file: string) => void, dir: string, skipFilePatterns: string[] = []) {
	const commandFiles = fs.readdirSync(__dirname + '/../' + dir);
	for (const file of commandFiles) {
		if (file.endsWith('.ts') || file.endsWith('.js')) {
			//* Skip files that start with '_' (private (non-command) files)
			if (file.startsWith('_') || skipFilePatterns.includes(file)) { continue; } 
			callback(client, dir, file);
		}
		// Check if the file is a folder
		else if (file.match(/[a-zA-Z0-9 -_]+/i)) {
			if (file == 'archive') { continue; } //* Skip the archive folder
			getAllFilesInDir(client, callback, dir + '/' + file);
		}
	}
}

export function registeredLogString(type: InteractionDataType|string, name: string, dir?: string, file?: string): string {
	return [
		`Registering [fg=${ColorTheme.colors.blue.asHex}]${type}[/>]: `,
		`[fg=${ColorTheme.colors.green.asHex}]${name}[/>] - `,
		(dir !== undefined) ? `./[fg=${ColorTheme.colors.yellow.asHex}]${dir}[/>]` : ``,
		(file !== undefined) ? `/[fg=${ColorTheme.colors.orange.asHex}]${file}[/>]` : ``,
	].join('');
}