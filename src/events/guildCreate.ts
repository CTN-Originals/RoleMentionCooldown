import { Events, Guild } from "discord.js";

import { Mentionable } from "../data/orm/mentionables";
import { DeployInstruction, doDeployCommands } from "../deployCommands";
import { eventConsole } from ".";
import { GuildConfig } from "../data/orm/guildConfig";

export default {
	name: Events.GuildCreate,
	once: false,

	async execute(guild: Guild) {
		eventConsole.log(`\nOn: [fg=green]${this.name}[/>]\nName: ${guild.name}\nID: ${guild.id}\nMembers: ${guild.memberCount}\n`)

		doDeployCommands([new DeployInstruction({
			guildId: guild.id,
			deployAll: true
		})])

		Mentionable.onGuildCreate(guild);
		GuildConfig.onGuildCreate(guild);
	},
}