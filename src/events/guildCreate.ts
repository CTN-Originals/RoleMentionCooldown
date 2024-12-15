import { Events, Guild } from "discord.js";

import { Mentionable } from "../data/orm/mentionables";
import { DeployInstruction, doDeployCommands } from "../deployCommands";
import { eventConsole } from ".";
import { GuildConfig } from "../data/orm/guildConfig";
import { GeneralData } from "../data";
import { UpdateBotListStats } from "../handlers/botLists";
import { client } from "..";

export default {
	name: Events.GuildCreate,
	once: false,

	async execute(guild: Guild) {
		eventConsole.log(`\nOn: [fg=green]${this.name}[/>]\nName: ${guild.name}\nID: ${guild.id}\nMembers: ${guild.memberCount}\n`)

		if (GeneralData.development) {
			await doDeployCommands(client, [new DeployInstruction({
				guildId: guild.id,
				deployAll: true
			})])
		}

		await Mentionable.onGuildCreate(guild);
		await GuildConfig.onGuildCreate(guild);

		UpdateBotListStats();
	},
}