import { SlashCommandBuilder } from 'discord.js'
import * as fs from 'node:fs'
import { cons, errorConsole } from '..'
import { PermissionObject } from '../handlers/permissionHandler'

// Get command files
export function getCommandFiles(client: any, dir: string) {
	const commandFiles = fs.readdirSync(__dirname + '/../' + dir)
	for (const file of commandFiles) {
		if (file.endsWith('.ts') || file.endsWith('.js')) {
			if (file.startsWith('_')) { continue } //* Skip files that start with '_' (private (non-command) files)
			registerCommand(client, dir, file)
		}
		// Check if the file is a folder
		else if (file.match(/[a-zA-Z0-9 -_]+/i)) {
			if (file == 'archive') { continue } //* Skip the archive folder
			getCommandFiles(client, dir + '/' + file)
		}
	}
}

export interface IInteraction {
	command: { permissions?: PermissionObject, data: SlashCommandBuilder, execute: (...args: any) => {} },
	selectMenus?: { data: SlashCommandBuilder, execute: (...args: any) => {} }[],
	buttons?: { data: SlashCommandBuilder, execute: (...args: any) => {} }[],
};
//? Register the command files to the client
function registerCommand(client: any, dir: string, file: string) {
	const commandFile = require(`../${dir}/${file}`).default

	const interaction: IInteraction = {
		command: { data: new SlashCommandBuilder(), execute: (...args: any): any => { } },
		selectMenus: [],
		buttons: [],
	}

	if ("command" in commandFile) {
		interaction.command = commandFile.command
		for (const interactionType in interaction) {
			if (interactionType == "command") { continue }
			if (interactionType in commandFile) {
				interaction[interactionType] = commandFile[interactionType]
			}
		}
	}
	else {
		interaction.command = commandFile
	}

	if (!interaction.command.data) {
		errorConsole.log(`No command data found for [fg=orange]${file}[/>]`)
		return
	}
	if (!interaction.command.execute) {
		errorConsole.log(`No command execute function found for [fg=orange]${file}[/>]`)
		return
	}

	//? Set a new item in the Collection
	//? With the key as the command name and the value as the exported module
	client.commands.set(interaction.command.data.name, interaction.command)
	cons.log(`Registering [fg=0080ff]Command[/>]: [fg=green]${interaction.command.data.name}[/>] - [fg=cyan]${file}[/>]`)

	//? Check if there are any components to register
	for (const interactionType in interaction) {
		if (interactionType == "command") { continue }
		if (interaction[interactionType] && interaction[interactionType].length > 0) {
			for (const component of interaction[interactionType]) {
				client.commands.set(component.data.name, component)
				cons.log(`Registering [fg=0080ff]${interactionType}[/>]: [fg=green]${component.data.name}[/>] - [fg=cyan]${file}[/>]`)
			}
		}
	}
}
