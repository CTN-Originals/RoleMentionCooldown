import { ChannelType, Events, Guild, Message, PermissionFlagsBits } from "discord.js"

import { EmitError, eventConsole } from "."
import { Mentionable } from "../data/orm/mentionables"
import { getTimestamp } from "../utils"
import { devEnvironment } from "../data"
import generalData from '../data'

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
				if (!Mentionable.Utils.isOncooldown(mentionables[key])) { //- if not on cooldown
					const role = message.guild.roles.cache.find(r => r.id == key);
					if (!role) {
						return EmitError(new Error(`Unable to find role (${key})`));
					}
					const res = await Mentionable.onUsed(message.guild, key);
					if (res == false) {
						return EmitError(new Error(`Attempted to update mentionable (${key})`));
					}
					
					if (generalData.development) {
						message.channel.send({
							content: `Starting mention cooldown: <t:${getTimestamp(Date.now() + mentionables[key].cooldown)}:R>`,
							reply: { messageReference: message }
						});
					}
				} else {
					if (generalData.development) {
						message.channel.send({
							content: `Cooldown remaining: <t:${getTimestamp(Date.now() + Mentionable.Utils.remainingCooldown(mentionables[key]))}:R>`,
							reply: { messageReference: message }
						});
					}
				}
			}
		}
	},
}