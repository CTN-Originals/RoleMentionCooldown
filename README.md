If you are unable to invite the bot to your server, the reason is likely because the bot is currently going through discords Verification process.
In the mean time, you could instead invite the BETA version of the bot to your server: https://discord.com/oauth2/authorize?client_id=1319723378873077842

# Role Mention Cooldown

A discord bot that allows users to mention a role once, then apply a cooldown to the role before it can be mentioned again.

## Commands

### Admin

- Configuration
  - `/config display`: Display the current server configurations
  - `/config admin-role add <role>`: Add an admin role, which is able to configure the bot's settings and role cooldowns
  - `/config admin-role remove <role>`: Remove an admin role
- Cooldowns
  - `/rolecooldown add <role> <cooldown>`: Add a new role to the monitored list, or change the cooldown for an existing one
    - `cooldown`: The cooldown to apply to the role on use (separate with spaces). Ex: `8s 69m 28h 1d = 2d 05:09:08`, `600s = 0d 00:10:00`
  - `/rolecooldown remove <role>`: Remove a role from having a cooldown

### User

- List
  - `/list all`: Display a list of all registered mentionable roles along with their cooldown
  - `/list cooldowns`: Display a list of all roles currently on cooldown along with their remaining cooldown time
- Other
  - `/help`: Displays an embed with all commands and their description
  - `/ping`: Show latency stats

## Usage

After adding mentionable roles with the `/rolecooldown add` command, anyone will be able to mention these roles across the whole server as usual (`@role-name` or `<@&roleid>`).

Once someone uses a monitored role mention, the bot will disable the "Allow anyone to @mention this role" permission for that role, preventing it from being mentioned during the cooldown.

When the cooldown expires for that role, the bot will re-enable the "Allow anyone to @mention this role" permission.

**Important note**: The bot can only put roles on cooldown in the channels it can read. Monitored role mentions in channels where the bot does not have read access will not start the cooldown.

## Links

- Bot Invite: https://discord.com/oauth2/authorize?client_id=1308469474768457748
- Discord App Discovery Page: https://discord.com/application-directory/1308469474768457748
- Official Discord Support Server: https://discord.gg/5eYZQNzMnx

## Contributions

- [Maxine](https://artstation.com/Maxine3D): Icon designer

## Terms of Service and Privacy Policy

Please read the [Terms of Service](https://github.com/CTN-Originals/RoleMentionCooldown/blob/stable/docs/legal/terms-of-service.md) and [Privacy Policy](https://github.com/CTN-Originals/RoleMentionCooldown/blob/stable/docs/legal/privacy-policy.md) that apply to this bot.
