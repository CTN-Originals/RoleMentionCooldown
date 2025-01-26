# Subject

Appeal request - bot intent verification request rejection

# Description

Hello Discord Staff.

I would like to appeal the rejection of my bot's member content intent verification request.
The bot's ID is: 1308469474768457748.
My user ID (The bot's developer and owner) is: 306395424690929674.

The following tickets have been created and closed over the last two days and are of relevance:
51135902 [7L5ED2-Y7K34] (Davis), 
51139098 [Z36X0Z-WVX9K] (ignored), 
51145490 [P3XR97-P6ZN1] (Bertha),
51246882 [2G6DK5-KR60Y] (Davis) (latest).

Here is the start of a ticket I sent two days ago that explains the situation best, this message was written after the first time my request was rejected:

-- Ticket 51145490 [P3XR97-P6ZN1] Description --

Hello Discord Staff!

Today, I woke up to a message instructing me to apply my very own Discord bot for its Intents verification as it reached 75 servers.
I was stoked and got right on that. I first started looking over my code again to double-check what was actually needed in terms of intents and what could be missed while keeping the bot functioning.
After researching the API Gateway Intents and what it all applies to, I found out that the bot does not require "Server Members Intent" at all, so I turned that off and pushed a hotfix to the bot's code to not request it during the "Send Identify with Intents" phase.
I also tested the other intent it was requesting, which is the "Message Content Intent." I tried to turn that off in the development instance of the bot to see what happens, and it did indeed not function anymore after that as it depends on reading if a role ID is present inside the message content.

After doing all of this research, I prepared my application, wrote the requested guides, prepared proper demonstrations, and answered all the questions truthfully.
When I submitted the application, I thought it might take a few hours at least to hear anything back, but to my surprise, less than 3 minutes later, I got a response in my email.

The response to my application stated that it was denying my "Message Content Privileged Intent request," and the reason that was given for this is as follows:
"This is because we are only providing access to our privileged gateway intents to power unique, compelling, user-facing functionality, and we do not believe your use case meets this criteria."

This caught me off guard for multiple reasons, but the biggest one is the words that were used to deny my application, specifically "unique, compelling, user-facing functionality."
The reason it caught me so off guard is that those words don't describe the situation at all, and they strike me more as "buzzwords" instead of an actual explanation.

I followed up with a reply to the responding email and asked if they could share a bit more info about their decision and reasoning to deny my application.
Just 6 minutes later, I once again received a response, but it was once again very underwhelming and less than helpful...
It stated that "we cannot share any detailed specifics on which features of your app," which I guess I can understand on some level, but it was followed up with, "I would suggest you look at this article to learn more about privileged intents: Discord Privileged Intents," where the "Discord Privileged Intents" was masked with a link that directs you to the documentation of discord.py, which is also pretty strange in an official Discord message as this is not even an official Discord site. On top of that, there is an actual Discord API page about Gateway Intents that could have been used instead, which would have been more relevant in any case as not everyone is using the discord.py framework in the first place.

So I replied once more to that email explaining that I'm very unsatisfied with that response and shared my feelings of helplessness and distrust as I am pretty sure I researched all of the required things to know about this intent and how to gain access to it.
So that is why I am writing this request to you now as I am still pretty lost on what to do next.

-- Additional information --
I received a response from Bertha here where she tried to help me out a little by guessing what could be relevant information for me.
It was not quite the right information but that was likely due to me not adding the context of what my bot actually does. 
-- End Information - Start of second reply --

Hello Bertha.

Thanks for your helpful response, I appriciate it a lot that you are trying to direct me to proper resources.

I realize that I might have been holding back some relevant context to the situation.
In my case, I am not using message content command base interaction, I develop all my applications using the new slash command builders and methods.
I am indeed also aware of slash command options and even message components that can be applied for an even better user experience.

In my use case, the only thing I use message contents for it to check if a message contains a role ID, this role ID is usually a guilds role and it is being used by a regulair guild member, so for ease of use and continued improved user experience, I require message content intents for the guild members to be able to use this role without requiring anything else inside the message while also allowing to still attach some more text before or after the role mention.

I hope I was able to explain this context properly for you to get a better understanding of this specific case, I am very eager to hear if you are able to provide some more information about the situation with this context.

Kind regards,
CTN

-- End of ticket Description --

My apologies in advance for the amount of text that im supplying here, I just dont want to leave out anything and repeat the same mistakes that I made with the first few tickets.

As you can see here, that day, I was already in a state of hopelessness, but after that ticket, I submitted another application with even more detail, that intent verification request is also the latest one I submitted and for context, I will put it here as well:

-- Latest Intent Verification Application --

# Application Details
### What does your application do? Please be as detailed as possible, and feel free to include links to image or video examples.

Role Mention Cooldown is a discord bot that allows users to mention a role once, then apply a cooldown to the role before it can be mentioned again.

Usage: After adding mentionable roles with the /rolecooldown add command, anyone will be able to mention these roles across the whole server as usual (@role-name or <@&roleid>). 
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

In my case, I am NOT using message content command base interaction, I develop all my applications using the new slash command builders and methods.
I am also aware of slash command options and even message components that can be applied for an even better user experience and I make good use of those features too.

In my use case, the only thing I use message contents for it to check if a message contains a role ID, this role ID is usually a guilds role and it is being used by a regular guild member, so for ease of use and continued improved user experience, I require message content intents for the guild members to be able to use this role without requiring anything else inside the message while also allowing to still attach some more text before or after the role mention.

The bot's main feature is to put any role on a cooldown once it has been used by any member in any channel. 
To be able to detect when a role is used that also has a cooldown registered to it, the bot needs to check the message content to see if it includes the role mention.
This feature is crucial to the bot as it is the core concept, it can help members with moderation, anti-spam, crowd control, permission handing and bring better role management usability to all kinds of servers that are based on games, gameplay, guides, support and much more. 
It offers a new unique utility to any server that has been requested by a lot of discord users in the past.

### Please provide links to screenshots and/or videos that demonstrate your use case

Demonstration: https://imgur.com/Np8Cp8K
README: https://github.com/CTN-Originals/RoleMentionCooldown/blob/stable/README.md

-- End Intent Verification Application --

Today, I didn't receive a response on any of my submissions and felt reluctant to send more messages, however, I decided to send a polite reminder in another support ticket (Ticket 51246882 [2G6DK5-KR60Y]).
Requesting an ETA on the matter as others are relying on me in this time sensitive case.

Davis replied very quickly, which gives me suspicion to believe that my case was not reviewed by a human or at least given enough attention.
Please may I know exactly why my request was denied?

A reason for my request being declined helps me understand what to improve and allows me to give those who depend on me answers.

Not enough consideration or time as been given to my request and I would appreciate it if you could escalate this case to someone who can review my application and provide me with a clear reason, if declined.

Here follows an even more detailed description of why I think the bot does meet the required criteria.

The exact argument that was given for the rejection was "This is because we are only providing access to our privileged gateway intents to power unique, compelling, user-facing functionality, and we do not believe your use-case meet this criteria.", where "unique, compelling, user-facing functionality" is the baseline.
This is taken from the official discord terms policy on the following page: https://support-dev.discord.com/hc/en-us/articles/5324827539479-Message-Content-Intent-Review-Policy#h_01FJ9G3RTCBDCXCBEN59PTG195

Among the reasons for my appeal, the main one would be that I do not understand why my bot does not meet these criteria, and there for I will list each header that defines the 3 criteria and do my best to explain why I believe my bot does meet each criteria.
I do not mean to do this as an attack on the previous decision made, I intent to help along the though process for deciding the outcome of the request.

(Any text following a ">" is a quote directly from the page)

# Unique
> 📝 We consider UNIQUE to be features that are not currently available in any capacity within the client.
The bot's main feature is unique because it is not currently available in any other existing discord bot as its main feature.

> If a feature you are building is something the client already does to some capacity, we likely wouldn't grant you intents approval for that feature.
The feature is not replicatable without the help of a discord bot and the features use case is, in a way, how a lot of people would expect discords own client to apply the feature and is there for also very user friendly and intuitive.

# Compelling
> 📝 We think of COMPELLING as features that are clear, self-explanatory, and immediately understandable why this feature should exist and where it would be useful.
> Of all our criteria, features being considered compelling is perhaps the most nuanced, which is why we encourage you to share as much detail as you possibly can.
> Describe your features in-depth. Tell us why you think your features are cool, and why you think your users need them. We love it when you tell us stories about the software you're making, so tell us your stories!
The bot's feature to detect the usage of any guild's role and apply a cooldown on set role before it can be used again is compelling and self-explanatory as the usage is very quick to understand without prior knowledge of the bots functions, any user simply has to just use the role by starting to type "@" and then select it in the pop-up above the input box. This works for them because the have guild permission to mention this role specifically as the bot has set it like that. Then once the user sends the message, the bot simply just notices that the role was used and it then start the cooldown and disables the permission to mention that role for all members. That means that members will now not be able to select the role in the pop-up to avoid confusion, but if they like to know the remaining cooldown on that role, they can make use of a slash command `/list cooldowns` which will reply with a neatly formatted embed listing all the roles currently on cooldown along with the remaining cooldown time next to them.

> With that in mind, simply requesting approval for messages so you can maintain custom prefixes or traditional command interfaces will result in a denial, as we don't believe that to be a compelling use case on its own.
The bot does not use any sort of message content trigger to execute anything else except for a cooldown if a role id is present inside the message (the main feature). The rest of the features of the bot are all slash commands and also make use of the new options system and message component systems.

# Transformative
> 📝 We consider TRANSFORMATIVE as using the information you collect through message intents to provide new functionality or features.
As explained before, the feature the bot offers is unique in every required way and offers an addition to the client itself as an extension.

> Just resurfacing the message content you're collecting in a new way generally isn't considered "transformative". Often, developers will request approval for intents simply so they can share user information, server data, or other statistics. For the most part, that kind of thing isn't transformative.
The bot does not acknowledge any message if it does not contain a role id that has been registered for a cooldown, once a message does contain a role id, the bot does not do anything else with the message. 
Here is a code snippet that makes use of the intent, this snippet is also the only part of the bot's code that does anything with message content: 
```ts 
if (message.content.includes(`<@&${key}>`))
```
This snippet is located in the following script (currently on line 27, but this may change in any update to the code): https://github.com/CTN-Originals/RoleMentionCooldown/blob/stable/src/events/messageCreate.ts

The purpose of the snippet is to check if `<@&[role-id]>` is included in the message, and if so, it will find the role in that guild and mark it as "used" which updates a field in the database that contains a timestamp representing when this role was last used. Base on that, it is able to calculate if the role is on cooldown or not. Inside that if statement, the role is also disabled for public use. There is another function that runs every second, this function simply iterates over each role that is on cooldown and then runs the following check:
```ts
return (mentionable.cooldown + mentionable.lastUsed >= Date.now())
```
If this snippet returns `false`, it means that the role is no longer on cooldown, which then triggers a function that re-enables the permission for guild members to ping this role again.

Here are some other headers of the page that might be considered in the review process:

# Non-Invasive
> In addition to looking for features that are unique, compelling, and transformative, we also require that use cases respect user privacy and safety.
The bot does not do anything with the message except for checking if it includes a role id, as specified in "# Transformative".
The bot has a well thought out privacy policy that outlines what the bot collects and how it uses this data.
The privacy policy is publicly available here: https://github.com/CTN-Originals/RoleMentionCooldown/blob/stable/docs/legal/privacy-policy.md


As I was writing out the proof of concept about why the bot meets all criteria that it was rejected on, I realized that I should have also included this in my initial Verification request.
So in that spirit, I will be submitting yet another Verification request and update the content to include these descriptions.

I am eager to hear back from you.

Kind regards,
CTN