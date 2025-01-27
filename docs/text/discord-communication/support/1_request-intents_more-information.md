# Subject
Require further information about bots varifiaction decision

# Description

Hello Discord Staff!

Today, I woke up to a message instructing me to apply my very own Discord bot for its Intents verification as it reached 75 servers.
I was stoked and got right on that. I first started looking over my code again to double-check what was actually needed in terms of intents and what could be missed while keeping the bot functioning.
After researching the API Gateway Intents and what it all applies to, I found out that the bot does not require "Server Members Intent" at all, so I turned that off and pushed a hotfix to the bot's code to not request it during the "Send Identify with Intents" phase.
I also tested the other intent it was requesting, which is the "Message Content Intent." I tried to turn that off in the development instance of the bot to see what happens, and it did indeed not function anymore after that as it depends on reading if a role ID is present inside the message content.

After doing all of this research, I prepared my application, wrote the requested guides, prepared proper demonstrations, and answered all the questions truthfully.
When I submitted the application, I thought it might take a few hours at least to hear anything back, but to my surprise, less than 3 minutes later, I got a response in my email.

-- This is where my question comes in --
The response to my application stated that it was denying my "Message Content Privileged Intent request," and the reason that was given for this is as follows:
"This is because we are only providing access to our privileged gateway intents to power unique, compelling, user-facing functionality, and we do not believe your use case meets this criteria."

This caught me off guard for multiple reasons, but the biggest one is the words that were used to deny my application, specifically "unique, compelling, user-facing functionality."
The reason it caught me so off guard is that those words don't describe the situation at all, and they strike me more as "buzzwords" instead of an actual explanation.

I followed up with a reply to the responding email and asked if they could share a bit more info about their decision and reasoning to deny my application.
Just 6 minutes later, I once again received a response, but it was once again very underwhelming and less than helpful...
It stated that "we cannot share any detailed specifics on which features of your app," which I guess I can understand on some level, but it was followed up with, "I would suggest you look at this article to learn more about privileged intents: Discord Privileged Intents," where the "Discord Privileged Intents" was masked with a link that directs you to the documentation of discord.py, which is also pretty strange in an official Discord message as this is not even an official Discord site. On top of that, there is an actual Discord API page about Gateway Intents that could have been used instead, which would have been more relevant in any case as not everyone is using the discord.py framework in the first place.

So I replied once more to that email explaining that I'm very unsatisfied with that response and shared my feelings of helplessness and distrust as I am pretty sure I researched all of the required things to know about this intent and how to gain access to it.
So that is why I am writing this request to you now as I am still pretty lost on what to do next.

I would love an actual explanation of why I might have been rejected and how I might be able to rectify that decision, as the bot that I developed will not be able to function without this intent.
I am very willing to share my code and more in-depth details on how I use the intent at length.