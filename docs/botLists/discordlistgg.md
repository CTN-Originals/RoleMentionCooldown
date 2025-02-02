## Commands

### Admin
- `/rolecooldown add`: Add a new role to the list, or edit an existing one
- --`role`: The role to add
- --`cooldown`: The cooldown to apply to the this once its used (seperate with spaces). 8s 69m 28h 1d = 2d 05:09:08
- `/rolecooldown remove`: Manage role cooldowns
- --`role`: The role to remove

### User
- `/mention <role> [message]`: Mention a role in the current channel
- --`role`: The role to mention
- --`message`: A string of text to send after the role mention

- `/list all`: Display a list of all registered mentionable roles along with their cooldown
- `/list cooldowns`: Display a list of all roles currently on cooldown along with their remaining cooldown time

- `/ping`: Replies with latency stats

- `/help`: Displays an embed with all commands and their description

## Usage

After adding mentionable roles with the `/rolecooldown add` command, anyone can then user the command `/mention` and select the any role that is registered via `/rolecooldown add` in the command options.

Once someone uses the `/mention` command, the role that they select will be put on a cooldown. If someone uses the `/mention` command and select a role that is at that moment on cooldown, the bot will tell the user that the entered role is on cooldown followed by the remaining cooldown time.

## Links

- Bot Invite: https://discord.com/oauth2/authorize?client_id=1308469474768457748
- BETA bot invite: https://discord.com/oauth2/authorize?client_id=1319723378873077842
- Official Discord Support Server: https://discord.gg/5eYZQNzMnx

## Contributions

[Maxine](https://artstation.com/Maxine3D): Icon designer

## Terms of Service and Privacy Policy

Please read the [Terms of Service](https://github.com/CTN-Originals/RoleMentionCooldown/blob/stable/docs/legal/terms-of-service.md) and [Privacy Policy](https://github.com/CTN-Originals/RoleMentionCooldown/blob/stable/docs/legal/privacy-policy.md) that applies to this bot.