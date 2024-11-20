# Documentation
### Adding roles
#### cooldown
- seperate with spaces
- only up to days


# Features
- Config option to only apply the mentionable cooldown in specific channels
- Config option to only permit surtain roles to use the mentionable


# Thecnical
- add an OnGuildCreate event for when the bot enters a guild
- - have this event als create all relevant documents in the database so that a document should never not exist
- also listen for if the bot leaves a guild
- - either delete the documents of this guild, or give it a delay time to delete these documents