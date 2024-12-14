import { Client, ContextMenuCommandBuilder, REST, Routes, SlashCommandBuilder } from 'discord.js';

import 'dotenv/config';
import * as fs from 'node:fs';
import path = require('node:path');

import { cons } from '.';
import { GeneralData } from './data'
import { CommandObject, ContextMenuCommandObject, IBaseInteractionType, ICommandObject, IContextMenuCommandObject } from './handlers/commandBuilder';

export class DeployInstruction {
	public guildId: string | undefined;
	public deploy: string[]; //? The commands to deploy
	public deployAll: boolean; //? Whether to deploy all commands or not
	public deployAllGlobal: boolean; //? Whether to deploy all commands or not
	
	public deleteAll: boolean; //? Whether to delete all commands or not
	public deleteCommands: string[]; //? The commands to delete

	public deleteAllGlobal: boolean; //? Whether to delete all commands or not
	public deleteGlobalCommands: string[]; //? The commands to delete globally

	constructor(data: Partial<DeployInstruction>) {
		this.guildId = data.guildId;
		this.deploy = data.deploy || [];
		this.deployAll = data.deployAll || false;
		this.deployAllGlobal = data.deployAllGlobal || false;

		this.deleteCommands = data.deleteCommands || [];
		this.deleteAll = data.deleteAll || false;

		this.deleteGlobalCommands = data.deleteGlobalCommands || [];
		this.deleteAllGlobal = data.deleteAllGlobal || false;
	}
}

const clientID: string = process.env.CLIENT_ID as string;
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN!);

type IRawCommandData = (ICommandObject | IContextMenuCommandObject);
type ICommandData = (SlashCommandBuilder | ContextMenuCommandBuilder);
export async function doDeployCommands(client: Client, deployInstructions: DeployInstruction[] = []): Promise<boolean> {
	cons.log('Deploying commands...');
	// getCommandFiles('commands');
	// console.log(guildId);
	
	//> deploy commands: --guildId=1234567890 deploy=ping,help --guild=0987654321 deployAll=true
	//> deleting all commands: --guild=12345 delete=0987654321,43723374678 --guild=1234567890 deleteAll=true
	//> deleting all Global commands: --deleteAllGlobal=true

	const rawCommandData: IRawCommandData[] = [
		...client.commands.map(c => c.data),
		...client.contextMenus.map(c => c.data),
	]

	const commandData: ICommandData[] = [];

	for (const cmd of rawCommandData) {
		if (Object.keys(cmd).includes('description')) { //- its a chat command
			commandData.push(new CommandObject(cmd as ICommandObject).build());
		} else {
			commandData.push(new ContextMenuCommandObject(cmd as IContextMenuCommandObject).build());
		}
	}

	const commandDumpPath = path.resolve(__dirname + '/../resources/dump/commands.json');
	if (fs.existsSync(commandDumpPath)) {
		fs.writeFile(commandDumpPath, JSON.stringify(commandData), (err) => {
			if (err) { console.error(err); }
			console.log(`Successfully dumped commands json to ${commandDumpPath}`)
		})
	}
	
	const args = process.argv.slice(3).join(' ').split('--').slice(1);
	
	for (const arg of args) {
		const instruction = arg.split(' ');
		const deployInstruction: Partial<DeployInstruction> = {};
		for (const part of instruction) {
			const partSplit = part.trim().split('=');
			const key = partSplit[0];
			const value = partSplit[1];
			switch (key) { //TODO make this dynamic (get keys from the class)
				case 'guild':
				case 'guildID':
				case 'guildId': {
					deployInstruction.guildId = (value === 'dev' || value === 'DEV_GUILD_ID') ? process.env.DEV_GUILD_ID : value;
				} break;
				
				case 'deploy': deployInstruction.deploy = value.split(','); break;
				case 'deployAll': deployInstruction.deployAll = (value == 'true'); break;
				case 'deployAllGlobal': deployInstruction.deployAllGlobal = (value == 'true'); break;
	
				case 'delete': deployInstruction.deleteCommands = value.split(','); break;
				case 'deleteAll': deployInstruction.deleteAll = (value == 'true'); break;
	
				case 'deleteGlobal': deployInstruction.deleteGlobalCommands = value.split(','); break;
				case 'deleteAllGlobal': deployInstruction.deleteAllGlobal = (value == 'true') ; break;
				default: 
					cons.log(`[fg=red]Unknown argument[/>]: ${part}`);
					continue;
			}

			cons.log(`${key}: ${value}`);
		}
		deployInstructions.push(new DeployInstruction(deployInstruction));
	}
	
	if (deployInstructions.length == 0) {
		cons.log('[fg=800000]No arguments provided[/>]');
		process.exit(0);
	}
	else {
		cons.log(`Instructions provided: ${deployInstructions.length}`);
		if (GeneralData.development) {
			cons.log(deployInstructions);
		}
	}
	
	for (const instruction of deployInstructions) {
		if (instruction.guildId) {
			cons.log('\nInstruction for: ' + instruction.guildId);
			const guildID = instruction.guildId;
	
			if (instruction.deployAll) { //? Deploy all commands
				await deployCommands(commandData, guildID);
			}
			else if (instruction.deploy.length > 0) { //? Deploy specific commands
				await deployCommands(commandData.filter((command) => instruction.deploy.includes(command.name)), guildID);
			}
			
			if (instruction.deleteAll) { //? Delete all commands
				await deleteCommands(true, guildID);
			}
			else if (instruction.deleteCommands.length > 0) { //? Delete specific commands
				await deleteCommands(instruction.deleteCommands, guildID);
			}
		}
		else {
			cons.log('Global Instruction');
			if (instruction.deployAllGlobal) { //? Deploy all commands globally
				await deployCommands(commandData);
			}
			else if (instruction.deleteAllGlobal) { //? Delete all commands globally
				await deleteCommands(true);
			}
		}
	}

	return true;
}


async function deployCommands(commands: ICommandData[], guildID?: string) {
	if (guildID) {
		cons.log(`Deploying ${commands.length} command(s) for Guild: ${guildID}`);
		await rest.put(Routes.applicationGuildCommands(clientID, guildID), { body: commands }).then(() =>
			console.log(`Successfully registered ${commands.length} application commands for Guild: ${guildID}.`)
		).catch((error) => console.log(error));
	}
	else {
		cons.log('No Guild ID provided, registering commands Globally.');
		await rest.put(Routes.applicationCommands(clientID), { body: commands }).then(() =>
			console.log(`Successfully registered ${commands.length} application commands Globally.`)
		).catch((error) => console.log(error));
	}
}

/** Delete commands
 * @param {string[]|boolean} commands The list command ID's to delete or true to delete all commands
*/
async function deleteCommands(commands: string[]|boolean, guildID?: string) {
	if (guildID) {
		if (commands instanceof Array) {
			cons.log(`Deleting ${commands.length} command(s) for Guild: ${guildID}`);
			for (const commandID of commands) {
				await rest.delete(Routes.applicationGuildCommand(clientID, guildID, commandID))
				.then(() => console.log(`Successfully registered ${commands.length} application commands for Guild: ${guildID}.`))
				.catch((error) => console.log(error));
			}
		}
		else if (commands === true) {
			console.log(`Deleting all guild commands for Guild: ${guildID}`);
			// for guild-based commands
			await rest.put(Routes.applicationGuildCommands(clientID, guildID), { body: [] })
			.then(() => console.log('Successfully deleted all guild commands.'))
			.catch(console.error);
		}
	}
	else {
		if (commands instanceof Array) {
			cons.log(`Deleting ${commands.length} global command(s)`);
			for (const commandID of commands) {
				await rest.delete(Routes.applicationCommand(clientID, commandID))
				.then(() => console.log(`Successfully deleted application command: ${commandID}.`))
				.catch((error) => console.log(error));
			}
		}
		else if (commands === true) {
			cons.log('Deleting all global commands');
			// for global commands
			await rest.put(Routes.applicationCommands(clientID), { body: [] })
			.then(() => console.log('Successfully deleted all global commands.'))
			.catch(console.error);
		}
	}
}