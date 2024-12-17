import * as fs from 'node:fs';

import { Client, Collection } from 'discord.js'; 

import { cons } from '..';
import { AnyInteractionObject, BaseButtonCollection, BaseSelectMenuCollection, CommandInteractionData, getInteractionObject, IButtonCollectionField } from '../handlers/commandBuilder';
import { EmitError } from '../events';
import { ColorTheme } from '../data';
import { IAnyInteractionField, IBaseInteractionType, ICommandField, IContextMenuField, ISelectMenuCollectionField } from '../handlers/commandBuilder/data';
import { getAllFilesInDir, registeredLogString } from '.';
import { InteractionDataType } from '../@types/discord';




function registerToClientCollection(client: Client, type: InteractionDataType, cmd: IAnyInteractionField, dir?: string, file?: string) {
	let name: string;
	let collection: string = type + 's';
	console.log(cmd)
	switch (type) {
		case 'command': {
			cmd = cmd as ICommandField;
			name = cmd.content.name;
		} break;
		case 'contextMenu': {
			cmd = cmd as IContextMenuField;
			name = cmd.content.name;
		} break;
		case 'button': {
			cmd = cmd as IButtonCollectionField;
			name = cmd.content.customId;
		} break;
		case 'selectMenu': {
			cmd = cmd as ISelectMenuCollectionField;
			name = cmd.content.customId;
		} break;
	}

	if ((client[collection] as Collection<string, IAnyInteractionField>).get(name) !== undefined) {
		EmitError(new Error(`Duplicate Interaction name detected. The name "${name}" already exists in collection "${collection}"`))
		return;
	}

	cons.log(registeredLogString(type, name, dir, file));

	client[collection].set(name, cmd);
	// client[type + 'Objects'].set(name, getInteractionObject(content));
}

//? Register the command files to the client
function registerCommand(client: Client, dir: string, file: string) {
	const commandData = require(`../${dir}/${file}`).default as CommandInteractionData;
	if (!(commandData instanceof CommandInteractionData)) {
		EmitError(new Error(`Command file "./${dir}/${file}" is not an instance of "CommandInteractionData"`));
		return;
	}

	registerToClientCollection(client, (commandData.interactionType !== IBaseInteractionType.ContextMenu) ? 'command' : 'contextMenu', commandData._command, dir, file);

	for (const button of (commandData.getCollection('button') as BaseButtonCollection).asArray()) {
		registerToClientCollection(client, 'button', button, dir, file);
	}
	for (const select of (commandData.getCollection('selectMenu') as BaseSelectMenuCollection).asArray()) {
		registerToClientCollection(client, 'selectMenu', select, dir, file);
	}
}

// Get command files
export function registerAllCommands(client: any, dir: string) {
	getAllFilesInDir(client, registerCommand, dir);
}
// // Get command files
// export function getCommandFiles(client: any, dir: string) {
// 	const commandFiles = fs.readdirSync(__dirname + '/../' + dir);
// 	for (const file of commandFiles) {
// 		if (file.endsWith('.ts') || file.endsWith('.js')) {
// 			if (file.startsWith('_')) { continue; } //* Skip files that start with '_' (private (non-command) files)
// 			registerCommand(client, dir, file);
// 		}
// 		// Check if the file is a folder
// 		else if (file.match(/[a-zA-Z0-9 -_]+/i)) {
// 			if (file == 'archive') { continue; } //* Skip the archive folder
// 			getCommandFiles(client, dir + '/' + file);
// 		}
// 	}
// }
