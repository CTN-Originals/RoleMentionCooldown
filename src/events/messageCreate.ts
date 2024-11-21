import { ChannelType, Events, Guild, Message } from "discord.js"

import { EmitError, eventConsole } from "."
import { Mentionable } from "../data/orm/mentionables"
import { getTimestamp } from "../utils"

export default {
	name: Events.MessageCreate,
	once: false,

	async execute(message: Message) {
		if (!message.guild) {
			EmitError(new Error(`Message did not contain guild`))
			return;
		}
		if (!message.channel.isSendable()) { return; }

		const mentionables = await Mentionable.getAll(message.guild.id);

		for (const key in mentionables) {
			if (message.content.includes(`<@&${key}>`)) {
				if (!Mentionable.Utils.onCooldown(mentionables[key])) {
					const res = await Mentionable.onUsed(message.guild.id, key);
					if (res == false) {
						EmitError(new Error(`Attempted to update mentionable (${key})`))
					}

					message.channel.send({
						content: `Starting mention cooldown: <t:${getTimestamp(Date.now() + mentionables[key].cooldown)}:R>`
					});
				} else {
					await message.delete();
					message.channel.send({
						content: `Cooldown time remaining: <t:${getTimestamp(Date.now() + Mentionable.Utils.remainingCooldown(mentionables[key]))}:R>`
					});
				}
			}
		}
	},
}