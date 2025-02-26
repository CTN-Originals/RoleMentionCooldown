
import type { Client } from 'discord.js';

import { getAllFilesInDir, registeredLogString } from '.';
import { client, cons } from '..';
import type { InteractionDataType } from '../@types/discord';
import { GeneralData } from '../data';
import { EmitError } from '../events';
import type { BaseButtonCollection, BaseSelectMenuCollection } from '../handlers/commandBuilder';
import { CommandInteractionData } from '../handlers/commandBuilder';
import type { BaseEmbedCollection, BaseMethodCollection } from '../handlers/commandBuilder/data';
import { IBaseInteractionType } from '../handlers/commandBuilder/data';

function validateName(name: string, type: InteractionDataType): void {
	if (client.commands.get(name) !== undefined) {
		EmitError(new Error(`Duplicate Interaction name detected. The name "${name}" already exists as a "${type}" and will be overwritten`));
	}
}

//? Register the command files to the client
async function registerCommand(client: Client, dir: string, file: string): Promise<void> {
	const commandData = (await import(`../${dir}/${file}`)).default as CommandInteractionData<BaseButtonCollection, BaseSelectMenuCollection, BaseEmbedCollection, BaseMethodCollection>;
	if (!(commandData instanceof CommandInteractionData)) {
		EmitError(new Error(`Command file "./${dir}/${file}" is not an instance of "CommandInteractionData"`));
		return;
	}

	const commandName = commandData.command.content.name;
	const commandType = (commandData.interactionType !== IBaseInteractionType.ContextMenu) ? 'command' : 'contextMenu';
	validateName(commandName, commandType);
	
	client.commands.set(commandName, commandData);
	if (GeneralData.logging.startup.enabled && GeneralData.logging.startup.commands) {
		cons.log(registeredLogString(commandType, commandName, dir, file));
	}
	
	for (const button of commandData.collection.buttons.asArray()) {
		validateName(button.content.customId, 'button');
		client.buttons.set(button.content.customId, commandName);
		// cons.log(registeredLogString('button', button.content.customId));
	}
	for (const select of commandData.collection.selectMenus.asArray()) {
		validateName(select.content.customId, 'button');
		client.selectMenus.set(select.content.customId, commandName);
		// cons.log(registeredLogString('button', select.content.customId));
	}
	
}

// Get command files
export async function registerAllCommands(client: Client, dir: string): Promise<void> {
	await getAllFilesInDir(client, registerCommand, dir);
}
