# Documentation
### Adding roles
#### cooldown
[ ] seperate with spaces
[ ] only up to days


# Features
[ ] Config option to only apply the mentionable cooldown in specific channels
[ ] Config option to only permit surtain roles to use the mentionable
[ ] Admin role, a role that can manage the configurations of this bot
[ ] Toggle all mentionables, if false, it wont check if any mentionables were mentioned
[ ] Toggle all mentionables mention permission, if false, all mentionables cant be used nomatter the cooldown
[ ] /list command to list all mention cooldowns registered


# Thecnical
[x] add an OnGuildCreate event for when the bot enters a guild
- [x] have this event als create all relevant documents in the database so that a document should never not exist
[x] also listen for if the bot leaves a guild
- [ ] either delete the documents of this guild, or give it a delay time to delete these documents