import * as fs from 'node:fs';

import { Client, Collection } from 'discord.js'; 

import { cons } from '..';
import { BaseButtonCollection, BaseSelectMenuCollection, CommandInteractionData, IButtonCollectionField } from '../handlers/commandBuilder';
import { EmitError } from '../events';
import { ColorTheme } from '../data';
import { IAnyInteractionField, IBaseInteractionType, ICommandField, IContextMenuField, ISelectMenuCollectionField } from '../handlers/commandBuilder/data';
import { getAllFilesInDir, registeredLogString } from '.';
import { InteractionDataType } from '../@types/discord';




function registerToClientCollection(client: Client, type: InteractionDataType, content: IAnyInteractionField, dir?: string, file?: string) {
	let name: string;
	let collection: string = type + 's';
	switch (type) {
		case 'command': {
			content = content as ICommandField
			name = content.data.name;
		} break;
		case 'contextMenu': {
			content = content as IContextMenuField
			name = content.data.name;
		} break;
		case 'button': {
			content = content as IButtonCollectionField
			name = content.data.customId;
		} break;
		case 'selectMenu': {
			content = content as ISelectMenuCollectionField
			name = content.data.customId;
		} break;
	}

	if ((client[collection] as Collection<string, IAnyInteractionField>).get(name) !== undefined) {
		EmitError(new Error(`Duplicate Interaction name detected. The name "${name}" already exists in collection "${collection}"`))
		return;
	}

	cons.log(registeredLogString(type, name, dir, file));

	client[collection].set(name, content);
}

//? Register the command files to the client
function registerCommand(client: Client, dir: string, file: string) {
	const commandData = require(`../${dir}/${file}`).default as CommandInteractionData;
	if (!(commandData instanceof CommandInteractionData)) {
		EmitError(new Error(`Command file "./${dir}/${file}" is not an instance of "CommandInteractionData"`));
		return;
	}

	registerToClientCollection(client, (commandData.interactionType !== IBaseInteractionType.ContextMenu) ? 'command' : 'contextMenu', commandData.command, dir, file);

	for (const button of (commandData.buttonCollection as BaseButtonCollection).asArray()) {
		registerToClientCollection(client, 'button', button, dir, file);
	}
	for (const select of (commandData.selectMenuCollection as BaseSelectMenuCollection).asArray()) {
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
