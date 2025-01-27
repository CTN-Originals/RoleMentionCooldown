# Subject

Request ETA on app verification

# Description

Hello Discord Staff.

I am awaiting a response about my app intent verification and was wondering if you could share with me an ETA on that matter.
I am aware that these matters take time usually and that most of the time, your response is to explain exactly that, but the reasons I am a bit more eager then usual is that for one, my app has recently reached 100 guilds and will now not allow anyone else to invite the app to any other guild.
And reason two, the very first application that I submitted has been sent 2 days ago now, but that one got a response within 3 minutes of submitting, and was reject for the wrong reasons and was very likely not making an informed decision as it was not possible to read the content of the application in its entirety within 3 minutes.

So I am a bit confused now that my following request is taking exponentially longer then the first one and would like an explanation, other then "these things take time" or "this usually takes x days" as it was already proven that it can be done in 3 minutes as well.

I may sound a bit desperate and pushy in my wording and that may not be entirely wrong, but I do not mean to be rude to any staff that might be responding to me here, but I would appreciate it a ton if the response would be written out in your own words and not a general copy paste from a template as i have been dealing with those responses now for 3 days straight.

Here is the ticket id of my latest application verification request: 51163939 [MZMY47-6G0V2]

-- Here follows the content of the verification application for context --

# Application Details
### What does your application do? Please be as detailed as possible, and feel free to include links to image or video examples.

Role Mention Cooldown is a discord bot that allows users to mention a role once, then apply a cooldown to the role before it can be mentioned again.

Usage: After adding mentionable roles with the /rolecooldown add command, anyone will be able to mention these roles across the whole server as usual (@role-name or <@&roleid>). 
Once someone uses a monitored role mention, the bot will disable the "Allow anyone to @mention this role" permission for that role, preventing it from being mentioned during the cooldown. 
When the cooldown expires for that role, the bot will re-enable the "Allow anyone to @mention this role" permission. 
Important note: The bot can only put roles on cooldown in the channels it can read. Monitored role mentions in channels where the bot does not have read access will not start the cooldown.

Demonstration: https://imgur.com/Np8Cp8K 
README: https://github.com/CTN-Originals/RoleMentionCooldown/blob/stable/README.md

# Where is your Privacy Policy available?

There is a link to the terms of service in the bio of the bot, the terms of service refers to the privacy policy multiple times. 
The privacy policy has also been linked in anything that describes the bots functionality, like on the README for example.

## Share the Privacy Policy

Privacy Policy: https://github.com/CTN-Originals/RoleMentionCooldown/blob/stable/docs/legal/privacy-policy.md
Screenshot: https://imgur.com/xUqn0Hq

# Why do you need the Message Content intent?

In my case, I am not using message content command base interaction, I develop all my applications using the new slash command builders and methods.
I am also aware of slash command options and even message components that can be applied for an even better user experience and I make good use of those features too.

In my use case, the only thing I use message contents for it to check if a message contains a role ID, this role ID is usually a guilds role and it is being used by a regulair guild member, so for ease of use and continued improved user experience, I require message content intents for the guild members to be able to use this role without requiring anything else inside the message while also allowing to still attach some more text before or after the role mention.

The bot's main feature is to put any role on a cooldown once it has been used by any member in any channel. 
To be able to detect when a role is used that also has a cooldown registered to it, the bot needs to check the message content to see if it includes the role mention.
This feature is crucial to the bot as it is the core concept, it can help members with moderation, anti-spam, crowd control, permission handing and bring better role management usability to all kinds of servers that are based on games, gameplay, guides, support and much more. 
It offers a new unique utility to any server that has been requested by a lot of discord users in the past.

# Please provide links to screenshots and/or videos that demonstrate your use case

Demonstration: https://imgur.com/Np8Cp8K
README: https://github.com/CTN-Originals/RoleMentionCooldown/blob/stable/README.md

Thanks for taking the time to read through my support ticket, I am eager to hear back from you.

Kinds regards,
CTN

-- End Description

# Support Response

Hey ctn,
 
Thank you for reaching out.
 
Unfortunately, based on our system, your request was denied due to our policy of providing access to privileged gateway intents only for powering unique, compelling, user-facing functionality. We do not believe your use case meets this criteria.
 
I hope that clarifies it.
 
I'll go ahead and close this case as solved, but please reply to this ticket if you have any other queries, and I'll be happy to assist you.
 
Cheers,
Davis

-- End Response --
-- Ticket closed --