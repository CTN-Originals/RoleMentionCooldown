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
[ ] /list command to list all mention cooldowns with their current cooldown time raped in a relative timestamp
[ ] Tunr on/off permission to mention a role for everyone depending on its cooldown


# Thecnical
[x] add an OnGuildCreate event for when the bot enters a guild
- [x] have this event als create all relevant documents in the database so that a document should never not exist
[x] also listen for if the bot leaves a guild
- [x] either delete the documents of this guild, or give it a delay time to delete these documents
[ ] once a role cooldown is removed, turn off its permission for safety
[ ] On startup, interate through all servers, and all mentionables to check if any cooldown might have expired while it was down, and start the callbacks for all that are still on cooldown