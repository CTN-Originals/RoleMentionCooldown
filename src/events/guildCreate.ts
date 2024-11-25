import { Events, Guild } from "discord.js"
import { eventConsole } from "."
import { GeneralData } from "../data"
import { GuildConfig } from "../data/orm/guildConfig"
import { Mentionable } from "../data/orm/mentionables"
import { DeployInstruction, doDeployCommands } from "../deployCommands"

export default {
	name: Events.GuildCreate,
	once: false,

	async execute(guild: Guild) {
		eventConsole.log(`\nOn: [fg=green]${this.name}[/>]\nName: ${guild.name}\nID: ${guild.id}\nMembers: ${guild.memberCount}\n`)

		if (GeneralData.development) {
			await doDeployCommands([new DeployInstruction({
				guildId: guild.id,
				deployAll: true
			})])
		}

		await Mentionable.onGuildCreate(guild)
		await GuildConfig.onGuildCreate(guild)
	},
}
