import * as fs from 'node:fs';

import { Client, Collection } from 'discord.js'; 

import { client, cons } from '..';
import { AnyInteractionObject, BaseButtonCollection, BaseSelectMenuCollection, CommandInteractionData, getInteractionObject, IButtonCollectionField } from '../handlers/commandBuilder';
import { EmitError } from '../events';
import { ColorTheme } from '../data';
import { BaseEmbedCollection, BaseMethodCollection, IAnyInteractionField, IBaseInteractionType, ICommandField, IContextMenuField, ISelectMenuCollectionField } from '../handlers/commandBuilder/data';
import { getAllFilesInDir, registeredLogString } from '.';
import { InteractionDataType } from '../@types/discord';

// function registerToClientCollection(client: Client, type: InteractionDataType, cmd: IAnyInteractionField, dir?: string, file?: string) {
// 	// let name: string;
// 	// let collection: string = type + 's';
// 	// console.log(cmd)
// 	// switch (type) {
// 	// 	case 'command': {
// 	// 		cmd = cmd as ICommandField;
// 	// 		name = cmd.content.name;
// 	// 	} break;
// 	// 	case 'contextMenu': {
// 	// 		cmd = cmd as IContextMenuField;
// 	// 		name = cmd.content.name;
// 	// 	} break;
// 	// 	case 'button': {
// 	// 		cmd = cmd as IButtonCollectionField;
// 	// 		name = cmd.content.customId;
// 	// 	} break;
// 	// 	case 'selectMenu': {
// 	// 		cmd = cmd as ISelectMenuCollectionField;
// 	// 		name = cmd.content.customId;
// 	// 	} break;
// 	// }

// 	if ((client.commands as Collection<string, CommandInteractionData>).get(name) !== undefined) {
// 		EmitError(new Error(`Duplicate Interaction name detected. The name "${name}" already exists in collection "${collection}"`))
// 		return;
// 	}

// 	cons.log(registeredLogString(type, name, dir, file));

// 	client[collection].set(name, cmd);
// 	// client[type + 'Objects'].set(name, getInteractionObject(content));
// }

function validateName(name: string, type: InteractionDataType) {
	if (client.commands.get(name) !== undefined) {
		EmitError(new Error(`Duplicate Interaction name detected. The name "${name}" already exists as a "${type}" and will be overwritten`))
	}
}

//? Register the command files to the client
function registerCommand(client: Client, dir: string, file: string) {
	const commandData = require(`../${dir}/${file}`).default as CommandInteractionData<BaseButtonCollection, BaseSelectMenuCollection, BaseEmbedCollection, BaseMethodCollection>;
	if (!(commandData instanceof CommandInteractionData)) {
		EmitError(new Error(`Command file "./${dir}/${file}" is not an instance of "CommandInteractionData"`));
		return;
	}

	const commandName = commandData.command.content.name;
	const commandType = (commandData.interactionType !== IBaseInteractionType.ContextMenu) ? 'command' : 'contextMenu'
	validateName(commandName, commandType);
	
	client.commands.set(commandName, commandData);
	cons.log(registeredLogString(commandType, commandName, dir, file));
	
	for (const button of commandData.collection.buttons.asArray()) {
		validateName(button.content.customId, 'button');
		client.buttons.set(button.content.customId, commandName);
		// cons.log(registeredLogString('button', button.content.customId));
	}
	for (const select of commandData.collection.selectMenus.asArray()) {
		validateName(select.content.customId, 'button');
		client.buttons.set(select.content.customId, commandName);
		// cons.log(registeredLogString('button', select.content.customId));
	}
	
}

// Get command files
export function registerAllCommands(client: any, dir: string) {
	getAllFilesInDir(client, registerCommand, dir);
}
