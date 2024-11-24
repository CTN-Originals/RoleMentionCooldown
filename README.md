# Role Mention Cooldown
A discord bot that allows users to mention a role once, and then applying a cooldown to this role before it can be mentioned again.


# Commands
## Admin
> `/config`: Configure this bots settings
> - `/config display`: Display the current server configurations
> - `/config admin-role`: Add/Remove an admin role to/from the list
> - - `/config admin-role add`: Add an admin role, these roles are able to configure the bots settings and role cooldowns
> - - - `role`: The role you would like to add
> - - `/config admin-role remove`: Remove an admin role, these roles are able to configure the bots settings and role cooldowns
> - - - `role`: The role you would like to remove

> `/rolecooldown`: Manage role cooldowns
> - `/rolecooldown add`: Add a new role to the list, or edit an existing one
> - - `role`: The role to add
> - - `cooldown`: The cooldown to apply to the this once its used (seperate with spaces). 8s 69m 28h 1d = 2d 05:09:08
> - `/rolecooldown add`: Manage role cooldowns
> - - `role`: The role to remove

## User
> `/list`: Display a list of mentionables
> - `/list all`: Display a list of all registered mentionable roles along with their cooldown
> - `/list cooldowns`: Display a list of all roles currently on cooldown along with their remaining cooldown time

> `/ping`: Replies with latency stats


# Usage
Once you have set up a few mentionables with the `/rolecooldown add` command, anyone will be able to mention this role across the whole server as usual (`@role-name` or `<@&roleid>`).
Once someone uses this role mention, the bot will disable the "Allow anyone to @mention this role" permission on that role so that no is able to ping this role again.
After that, when the cooldown expires for that role, the bot will enable that same permission again to allow the role to be mentioned once again.

**Important note**: If the bot (or any role that the bot has) is not registered to a channels permission, the bot wont be able to read the messages in that channel, so make sure to add the bot's role (or any other role it might have) to all channels that you want it to be able to monitor for role mentions.
Also worth to not is that the role is mentionable across the whole server, so if it is used in one of the channels where the bot doesnt have permission to read, it wont start a cooldown for that role and the role can be pinged again right away.


# Contributions
- [Maxine](https://artstation.com/Maxine3D): Icon designer