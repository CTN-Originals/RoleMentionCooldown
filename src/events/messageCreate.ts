import { Events, Message } from "discord.js"
import { EmitError, eventConsole } from "."
import { ColorTheme, GeneralData } from "../data"
import { Mentionable } from "../data/orm/mentionables"
import { getTimeDisplay, getTimestamp } from "../utils"

export default {
	name: Events.MessageCreate,
	once: false,

	async execute(message: Message) {
		if (
			message.author.bot || 
			!message.channel.isSendable()
		) { return; }

		if (!message.guild) {
			EmitError(new Error(`Message did not contain guild`))
			return;
		}

		const mentionables = await Mentionable.getAll(message.guild.id);

		for (const key in mentionables) {
			if (message.content.includes(`<@&${key}>`)) {
				if (!Mentionable.isOncooldown(mentionables[key])) { //- if not on cooldown
					const role = message.guild.roles.cache.find(r => r.id == key);
					if (!role) {
						return EmitError(new Error(`Unable to find role (${key})`));
					}
					const res = await Mentionable.onUsed(message.guild, key);
					if (res == false) {
						return EmitError(new Error(`Attempted to update mentionable (${key})`));
					}

					eventConsole.log([
						`[fg=${ColorTheme.colors.yellow.asHex}]${message.guild.name}[/>]:`,
						`[fg=${ColorTheme.colors.cyan.asHex}]${message.author.username}[/>] used mentionable`,
						`[fg=${(role.hexColor != '#000000') ? role.hexColor : ColorTheme.colors.grey.asHex}]${role.name}[/>] | `,
						`cooldown started: [fg=${ColorTheme.colors.green.asHex}]${getTimeDisplay(mentionables[key].cooldown)}[/>]`
					].join(' '))
					
					if (GeneralData.development) {
						message.channel.send({
							content: `Starting mention cooldown: <t:${getTimestamp(Date.now() + mentionables[key].cooldown)}:R>`,
							reply: { messageReference: message }
						});
					}
				} else {
					if (GeneralData.development) {
						message.channel.send({
							content: `Cooldown remaining: <t:${getTimestamp(Date.now() + Mentionable.remainingCooldown(mentionables[key]))}:R>`,
							reply: { messageReference: message }
						});
					}
				}
			}
		}
	},
}
