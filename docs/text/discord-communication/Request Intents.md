# Application Details
### What does your application do? Please be as detailed as possible, and feel free to include links to image or video examples.

Role Mention Cooldown is a discord bot that allows users to mention a role once, then apply a cooldown to the role before it can be mentioned again.

Usage: After adding mentionable roles with the `/rolecooldown add` command, anyone will be able to mention these roles across the whole server as usual (@role-name or <@&roleid>). 
Once someone uses a monitored role mention, the bot will disable the "Allow anyone to @mention this role" permission for that role, preventing it from being mentioned during the cooldown. 
When the cooldown expires for that role, the bot will re-enable the "Allow anyone to @mention this role" permission. 
Important note: The bot can only put roles on cooldown in the channels it can read. Monitored role mentions in channels where the bot does not have read access will not start the cooldown.

Demonstration: https://imgur.com/Np8Cp8K 
README: https://github.com/CTN-Originals/RoleMentionCooldown/blob/stable/README.md

## Privileged Gateway Intents
### Which intents are you applying for, if any? (Leave blank if you do not need any of these)

[ ] Server Member Intent
[ ] Presence Intent
[x] Message Content Intent

> You have the following limited intents and may apply for their full intents: Message Content Intent.

## Message Content Intent
- Can users opt-out of having their message content data tracked?: "Yes"
- Are you storing message content data off-platform (outside of Discord)?: "No"
- Do you have a public Privacy Policy telling your users about their data usage?: "Yes"

### Where is your Privacy Policy available?

There is a link to the terms of service in the bio of the bot, the terms of service refers to the privacy policy multiple times. 
The privacy policy has also been linked in anything that describes the bots functionality, like on the README for example.

### Please share your Privacy Policy

Privacy Policy: https://github.com/CTN-Originals/RoleMentionCooldown/blob/stable/docs/legal/privacy-policy.md
Screenshot: https://imgur.com/xUqn0Hq

- Will the message content data be used to train machine learning or AI Models?: "No"

### Why do you need the Message Content intent?

To explain the reasoning why my bot needs Message Content intent, I will provide an answer that explains why the bot meets each criteria listed on an official discord terms and policy page.

# Unique
The bot's main feature is unique because it is not currently available in any other existing discord bot as its main feature.
The feature is not replicatable without the help of a discord bot.

# Compelling
The bot's feature to detect the usage of any guild's role and apply a cooldown on set role before it can be used again is compelling and self-explanatory as the usage is very quick to understand without prior knowledge of the bots functions, any user simply has to just use the role by starting to type "@" and then select it in the pop-up above the input box.

The bot does not use any message content trigger to execute anything except for a cooldown if a role id is present inside the message (the main feature). The rest of the features of the bot are all slash commands and also make use of the new options system and message component systems.

# Transformative
As explained before, the feature the bot offers is unique in every required way and offers an addition to the client itself as an extension.

The bot does not acknowledge any message if it does not contain a role id that has been registered for a cooldown, once a message does contain a role id, the bot does not do anything else with the message. 
Here is a code snippet that makes use of the intent, this snippet is also the only part of the bot's code that does anything with message content: 
if (message.content.includes(`<@&${key}>`))

The purpose of the snippet is to check if a role id is included in the message, and if so, it will find the role in that guild and mark it as "used" which updates a field in the database that contains a timestamp representing when this role was last used. Based on that, it is able to calculate if the role is on cooldown or not.

### Please provide links to screenshots and/or videos that demonstrate your use case

Demonstration: https://imgur.com/Np8Cp8K
README: https://github.com/CTN-Originals/RoleMentionCooldown/blob/stable/README.md