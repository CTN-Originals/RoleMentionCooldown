# ---- Rejection ----

Paolo (Discord Support)

Jan 13, 2025, 05:09 PST

Greetings ctn,

Thanks for reaching out to us with your intent request along with your screenshot.
 
Unfortunately, I am denying your Message Content Privileged Intent request. This is because we are only providing access to our privileged gateway intents to power unique, compelling, user-facing functionality, and we do not believe your use case meets this criteria.
 
If you end up building another feature that relies on this or any other intent, simply reapply through the developer portal and we can review again at that time! And, if you have any other questions, please don't hesitate to let me know.
 
Best,
Paolo

# ---- Reply ----

Hello Paolo,

Thanks for responding so swiftly.

Before I ask my question, let me first share some relevant context:
This is one of many rejections that I have received from you and your team, and in each one, you have given me the same reason without any elaboration on the reasoning behind it specifically.
This time around, I even provided an explanation on why my bot provides "unique, compelling, user-facing functionality" and is worthy of the intent it requests, but yet again, I am faced with the same exact response.

I understand that your work requires you to handle a great deal of tickets in a short amount of time and that, to help with that, a copy-paste template might be useful.
But I am desperately looking for better reasoning in your decision process so that I can also understand.

I dislike stating this, but I am relying on Discord's own Terms of Service, specifically the "Appeals" section, where it states the following: "We value transparency and work hard to give you context for the decisions we make."
I have submitted an appeal on this decision and have not heard back for about three weeks now, so I hope that you can at least provide me with a bit more than usual and give me closure on the matter.

In the previous rejections, where I also requested more information, the response was always the following:
"
Hey ctn,

Thank you for reaching out.

Unfortunately, based on our system, your request was denied due to our policy of providing access to privileged gateway intents only for powering unique, compelling, user-facing functionality. We do not believe your use case meets this criterion.

I hope that clarifies it.

I'll go ahead and close this case as solved, but please reply to this ticket if you have any other queries, and I'll be happy to assist you.
"

Please refrain from using this copy-paste template to respond to this and take a few moments to type something out by hand, as it would give me a far greater understanding.

Could you please elaborate on your decision to reject my request?

Feel free to adress the following counter arguments that were also present in my verification request:
# Unique
The bot's main feature is unique because it is not currently available in any other existing discord bot as its main feature.
The feature is not replicatable without the help of a discord bot.

# Compelling
The bot's feature to detect the usage of any guild's role and apply a cooldown on set role before it can be used again is compelling and self-explanatory as the usage is very quick to understand without prior knowledge of the bots functions, any user simply has to just use the role by starting to type "@" and then select it in the pop-up above the input box.

The bot does not use any message content trigger to execute anything except for a cooldown if a role id is present inside the message (the main feature). The rest of the features of the bot are all slash commands and also make use of the new options system and message component systems.

# Transformative
As explained before, the feature the bot offers is unique in every required way and offers an addition to the client itself as an extension.

The bot does not acknowledge any message if it does not contain a role id that has been registered for a cooldown, once a message does contain a role id, the bot does not do anything else with the message. 
Here is a code snippet that makes use of the intent, this snippet is also the only part of the bot's code that does anything with message content: 
if (message.content.includes(`<@&${key}>`))

The purpose of the snippet is to check if a role id is included in the message, and if so, it will find the role in that guild and mark it as "used" which updates a field in the database that contains a timestamp representing when this role was last used. Based on that, it is able to calculate if the role is on cooldown or not.

Kind regards,
- CTN


# ---- Response ----

Hello there CTN,
 
You're welcome. Thanks for responding.
 
While your use case on the platform is compelling, it is just not compelling for the need of the intent you are requesting.
 
Moreover, we cannot provide further guidelines or share detailed specifics on which features of your app do not meet the criteria due to our strict policy and procedures.
 
I understand this is not the answer you were looking for, but if there are any follow-up questions you have or anything else you need help with, then just respond to this ticket and I'll be happy to help you out.
 
Best,
Paolo

# ---- Reply ----

Hello again Paolo.

First off, thanks a lot for actually taking the time to write out your response, it brings me a great deal of releaf as I was expecting a copy paste once again.

Before I start to ask you more question, I would first like to ask a few things about how you are able to handle a case like this to allow me to ask better and more targeted questions that you then would be able to answer while still following your own internal policies. I hope that is oke, and I understand if you are not able to give me too much detail about the rules that apply to you as this might not all be public information.

First of, I would like to ask you for more detail on the matter and I understand that you are not really able to look deep into what my bot actually does, so, would it be possible if I would give you a specific example of a feature and then follow that up with a question about how that would be considered in either your decision process or how it would or could be transformed into something else that might have a better chance of passing?

Second off, I of course have a desire to defend my work against your decision, but I also understand that this might be ignored entirely as (in general in cases and tickets like this) that could escelate. So I still wanted to ask if it is okey if I try to counter argue against a specific reason that you have provided me, and if you allow me to do this, I will in term promise to not counter argue against it more then once to avoid falling in a back and forth that might not be worth the time.

Im eager to hear back from you again about these topics and in the mean time, I will prepair the questions in the case that either of these scenarios are allowed by your policy.

Kind regards,
- CTN


# ---- Response ----

Hi there CTN,
 
You're welcome. Thank you for responding.
 
While I understand that you would like to know more about our review process and features to get approval for the intent, I am sadly unable to provide further information, insight, or provide examples due to strict policies and procedures as previously mentioned. 
 
I hope for your kind understanding and I sincerely apologize for the hassle and inconvenience. If there's anything else I can help you with, please let me know.
 
Best,
Paolo