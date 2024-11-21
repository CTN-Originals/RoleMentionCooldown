# Documentation
### Adding roles
#### cooldown
- [ ] seperate with spaces
- [ ] only up to days


# Features
## Configs
- [ ] Option to only apply the mentionable cooldown in specific channels
- [ ] Option to only permit surtain roles to use the mentionable
- [ ] Admin role, a role that can manage the configurations of this bot
- [ ] Option to keep track of a cooldown per channel, if mention is used in channel x, it will still be able to be used in channel y, but both x and y will have their own cooldown tracker
- [ ] 2 options to allow a mentionable to be mentioned in x time range a maximum of y amount of times

## Commands
- [ ] /list command to list all mention cooldowns with their current cooldown time raped in a relative timestamp
- [ ] /toggle , if set to false, it wont check if any mentionables are mentioned in messages
- [ ] Toggle all mentionables mention permission, if false, all mentionables cant be used nomatter the cooldown untill turned off again

## Other
- [x] Tunr on/off the mentionable permission for any role for members depending on its cooldown
- [ ] Think of a way to limit the mentionable usage to sertain channels while still keeping the mentionable role permission checked
	- a work around might be to have a config option where the bot will warn people if they use it outside the target channel and then also have a config option for the warning message. then add another config option ontop of that to have the bot time these people out once it happens with another config option for the timeout duration.
	- another (less scalable) way would be to have the bot manage automod rules and add some roles in some rulesets, but this would be bad as the automod rules are limited and only allows 8 or so variations where some of those will likely already be taken by the server


# Thecnical
- [x] add an OnGuildCreate event for when the bot enters a guild
- [x] have this event als create all relevant documents in the database so that a document should never not exist
- [x] also listen for if the bot leaves a guild
- [x] either delete the documents of this guild, or give it a delay time to delete these documents
- [x] once a role cooldown is removed, turn off its permission for safety
- [x] On startup, interate through all servers, and all mentionables to check if any cooldown might have expired while it was down, and start the callbacks for all that are still on cooldown
- [ ] When a role is added, check if that role is above the bots role, and if so, tell the user this is impossible
- [ ] Make an alternate system for cooldown tracking instead of setting a timeout for each cooldown as setTimeout might have unforseen performance impects.


# Prep for public
- [ ] Make a good landiing page for the bots documentation
- [ ] add a contribution guideline document to the github
- [ ] Create a .env-example file