# Role Mention Cooldown
A discord bot that allows users to mention a role once, then apply a cooldown to the role before it can be mentioned again.

## Commands
### Admin
- **Cooldowns**
  - `/rolecooldown add <role> [global-cooldown] [channel-cooldown] [user-cooldown]`: Add a new role cooldown (At least one cooldown is required to be entered)
    - `role`: The role to add
    - `global-cooldown`: The cooldown that applies to everyone (overrides user/channel cooldown if its greater)
    - `channel-cooldown`: The cooldown that applies to the channel that the rolemention was used in
    - `user-cooldown`: The cooldown that applies to the user that used the rolemention
  - `/rolecooldown edit <role> [global-cooldown] [channel-cooldown] [user-cooldown]`: Edit an existing role cooldown (Omit cooldown options to preserve the current cooldown)
    - Same as `/rolecooldown add`
  - `/rolecooldown remove <role>`: Remove a role from having a cooldown
### User
- **General**
  - `/mention <role> [message]`: Mention a role in the current channel
    - `role`: The role to mention
    - `message`: A string of text to send after the role mention
- **List**
  - `/list all`: Display a list of all registered mentionable roles along with their cooldown
  - `/list cooldowns`: Display a list of all roles currently on cooldown along with their remaining cooldown time
- **Other**
  - `/help`: Displays an embed with all commands and their description
  - `/ping`: Show latency stats

## Cooldown input option instructions
The cooldown input should be separated with spaces for each timeframe entered.
Each timeframe should end in any of these letters:
> `s` = seconds
> `m` = minutes
> `h` = hours
> `d` = days

**Examples**:
> `8s 69m 28h 1d` = 2d 05:09:08
> `600s` = 0d 00:10:00

## Usage
After adding mentionable roles with the `/rolecooldown add` command, anyone can then user the command `/mention` and select the any role that is registered via `/rolecooldown add` in the command options.

Once someone uses the `/mention` command, the role that they select will be put on a cooldown. If someone uses the `/mention` command and select a role that is at that moment on cooldown, the bot will tell the user that the entered role is on cooldown followed by the remaining cooldown time.

## Links
- Bot Invite: <https://discord.com/oauth2/authorize?client_id=1308469474768457748>
- BETA bot invite: <https://discord.com/oauth2/authorize?client_id=1319723378873077842>
## Contributions
- [Maxine](<https://artstation.com/Maxine3D>): Icon designer
## Terms of Service and Privacy Policy
Please read the [Terms of Service](<https://github.com/CTN-Originals/RoleMentionCooldown/blob/stable/docs/legal/terms-of-service.md>) and [Privacy Policy](<https://github.com/CTN-Originals/RoleMentionCooldown/blob/stable/docs/legal/privacy-policy.md>) that apply to this bot.
