import { EmbedBuilder } from "discord.js"
import { EmitError } from "../events"

/*
All of the following limits are measured inclusively. 
Leading and trailing whitespace characters are 
not included (they are trimmed automatically).

- title 		256 characters
- description 	4096 characters
- fields 		25 maximum fields
- field.name 	256 characters
- field.value 	1024 characters
- footer.text 	2048 characters
- author.name 	256 characters

Additionally, the combined sum of characters in all 
title, description, field.name, field.value, footer.text, and author.name fields 
across all embeds attached to a message must not exceed 6000 characters. 
Violating any of these constraints will result in a Bad Request response.
*/

export const testEmbed = new EmbedBuilder({
	title: 'embed title: Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia, molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum!',
	description: '456',
	fields: [
		{name: '1', value: '1', inline: true},
		{name: '2', value: '2', inline: true},
		{name: '3', value: '3', inline: true},
		{name: '4', value: '4', inline: true},
		{name: '5', value: '5', inline: true},
		{name: '6', value: '6', inline: true},
		{name: '7', value: '7', inline: true},
		{name: '8', value: '8', inline: true},
		{name: '9', value: '9', inline: true},
		{name: '10', value: '10', inline: true},
		{name: '11', value: '11', inline: true},
		{name: '12', value: '12', inline: true},
		{name: '13', value: '13', inline: true},
		{name: '14', value: '14', inline: true},
		{name: '15', value: '15', inline: true},
		{name: '16', value: '16', inline: true},
		{name: '17', value: '17', inline: true},
		{name: '18', value: '18', inline: true},
		{name: '19', value: '19', inline: true},
		{name: '20', value: '20', inline: true},
		{name: '21', value: '21', inline: true},
		{name: '22', value: '22', inline: true},
		{name: '23', value: '23', inline: true},
		{name: '24', value: '24', inline: true},
		{name: '25', value: '25', inline: true},
		{name: '26', value: '26', inline: true},
	],
	footer: {text: `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Proin sed justo eu urna varius eleifend sit amet eget metus. Nam elementum congue elit, eu viverra libero bibendum ac. Suspendisse potenti. Aenean in justo vitae elit pretium iaculis sed vitae dolor. Morbi auctor varius diam, eget posuere ante ultrices a. Vestibulum imperdiet tristique felis, ut consequat massa bibendum id. Sed imperdiet, nulla at convallis consectetur, sem risus vestibulum ligula, ac blandit elit velit nec dui. Nunc vehicula varius magna eu scelerisque. Sed quis urna non odio mattis euismod. Ut ac urna ut arcu tristique consectetur eu ut justo.
In hac habitasse platea dictumst. Ut bibendum velit vitae felis fringilla, vel consequat neque malesuada. Phasellus gravida justo sed efficitur rhoncus. Nunc sed bibendum erat, nec viverra purus. Quisque vitae aliquet nisi, a ullamcorper velit. Fusce nec risus eu ipsum fermentum elementum. Etiam vehicula tincidunt enim, eu tincidunt nunc. Fusce nec mi ut nisi sodales rutrum.
In hac habitasse platea dictumst. Ut bibendum velit vitae felis fringilla, vel consequat neque malesuada. Phasellus gravida justo sed efficitur rhoncus. Nunc sed bibendum erat, nec viverra purus. Quisque vitae aliquet nisi, a ullamcorper velit. Fusce nec risus eu ipsum fermentum elementum. Etiam vehicula tincidunt enim, eu tincidunt nunc. Fusce nec mi ut nisi sodales rutrum.
Vivamus ac dapibus turpis. Sed non dui vel velit ultrices lacinia id vitae libero. Sed vestibulum justo eu diam tincidunt, ac gravida libero tincidunt. Suspendisse fringilla nulla et nisi feugiat, in tincidunt odio semper. Nullam gravida ipsum vel tortor sollicitudin, at aliquet ex malesuada. Vivamus facilisis lacus in erat hendrerit fermentum. Vivamus congue, justo eu vehicula posuere, purus lectus malesuada lacus, vitae accumsan metus leo id libero.`
	},
})

const overflowIndicator: string = '…';
const overflowLimits = {
	authorName: 256,
	title: 256,
	description: 4096,
	fields: 25,
	fieldName: 256,
	fieldValue: 1024,
	footerText: 2048,
	total: 6000,
}

/** Checks if an embed is valid to be sent to Discord 
 * @param {EmbedBuilder} embed The embed to validate
 * @emits ErrorObject if the embed exceeds any of the limits
 * @returns {EmbedBuilder} the embed that was passed as an argument (altered to be within limits if necessary)
 * @example limits:
- title 	256 characters
- description 	4096 characters
- fields 	25 maximum fields
- field.name 	256 characters
- field.value 	1024 characters
- footer.text 	2048 characters
- author.name 	256 characters
*/
export function validateEmbed(embed: EmbedBuilder): EmbedBuilder {
	const errorList: string[] = [];
	const overflowData: {[key: string]: number} = {
		authorName: 0,
		title: 0,
		description: 0,
		fields: 0,
		fieldName: 0,
		fieldValue: 0,
		footerText: 0,
		total: 0,
	}
	// const overflowSum = () => Object.values(overflowData).reduce((a: number, b: number|number[]) => a + (Array.isArray(b) ? b[0] : b), 0);

	if (!embed.data) {
		errorList.push('Embed.data is missing');
	}
	else {
		if (embed.data.author?.name && embed.data.author.name.length > overflowLimits.authorName) {
			overflowData.authorName = embed.data.author.name.length - overflowLimits.authorName;
			embed.setAuthor({name: embed.data.author.name.slice(0, (overflowLimits.authorName - overflowIndicator.length)) + overflowIndicator});
		}
		if (embed.data.title && embed.data.title.length > overflowLimits.title) {
			overflowData.title = embed.data.title.length - overflowLimits.title;
			embed.setTitle(embed.data.title.slice(0, (overflowLimits.title - overflowIndicator.length)) + overflowIndicator);
		}
		if (embed.data.description && embed.data.description.length > overflowLimits.description) {
			overflowData.description = embed.data.description.length - overflowLimits.description;
			embed.setDescription(embed.data.description.slice(0, (overflowLimits.description - overflowIndicator.length)) + overflowIndicator);
		}
		if (embed.data.fields && embed.data.fields.length > overflowLimits.fields) {
			overflowData.fields = embed.data.fields.length - overflowLimits.fields;
			embed.setFields(embed.data.fields.slice(0, overflowLimits.fields));
		}
		if (embed.data.footer?.text && embed.data.footer.text.length > overflowLimits.footerText) {
			overflowData.footerText = embed.data.footer.text.length - overflowLimits.footerText;
			embed.setFooter({text: embed.data.footer.text.slice(0, (overflowLimits.footerText - overflowIndicator.length)) + overflowIndicator});
		}

		for (const field of embed.data.fields ?? []) {
			if (field.name && field.name.length > overflowLimits.fieldName) {
				overflowData.fieldName += field.name.length - overflowLimits.fieldName;
				field.name = field.name.slice(0, (overflowLimits.fieldName - overflowIndicator.length)) + overflowIndicator;
			}
			if (field.value && field.value.length > overflowLimits.fieldValue) {
				overflowData.fieldValue += field.value.length - overflowLimits.fieldValue;
				field.value = field.value.slice(0, (overflowLimits.fieldValue - overflowIndicator.length)) + overflowIndicator;
			}
		}
	}
	
	const totalOverflow = Object.values(overflowData).reduce((a: number, b: number|number[]) => a + (Array.isArray(b) ? b[0] : b), 0);
	if (totalOverflow > 0) {
		let overflownFields: {[key: string]: number} = {};
		for (const [key, value] of Object.entries(overflowData)) {
			if (value > 0) {
				errorList.push(`[fg=orange]${key}[/>] exceeded limit by ${value} characters (${overflowLimits[key as keyof typeof overflowLimits]})`);
				overflownFields[key] = value;
			}
		}

		let footerAlertText = `${overflowIndicator}\n${overflowIndicator}  The following fields exceeded the character limit:\n`;
		for (const [key, value] of Object.entries(overflownFields)) {
			footerAlertText += `${key}: ${value}, `;
		}
		footerAlertText = footerAlertText.slice(0, -2);
		if (embed.data.footer?.text) {
			console.log(
				`${embed.data.footer!.text.length} >= (${overflowLimits.footerText} + ${footerAlertText.length}) [${(overflowLimits.footerText + footerAlertText.length)}]`, 
				embed.data.footer!.text.length >= (overflowLimits.footerText + footerAlertText.length)
			)
			if (embed.data.footer.text.length >= (overflowLimits.footerText + footerAlertText.length)) {
				embed.data.footer.text = embed.data.footer.text + footerAlertText;
			}
			else {
				embed.data.footer.text = embed.data.footer?.text.slice(0, (overflowLimits.footerText - footerAlertText.length)) + footerAlertText;
			}
		}
		else {
			if (embed.data.footer?.text) embed.data.footer.text = footerAlertText;
		}
	}

	if (errorList.length > 0) {
		const error = new Error('\n - ' + errorList.join('\n - '));
		error.name = 'Embed Validation Error';
		EmitError(error);
	}

	return embed;
}

/*

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Proin sed justo eu urna varius eleifend sit amet eget metus. Nam elementum congue elit, eu viverra libero bibendum ac. Suspendisse potenti. Aenean in justo vitae elit pretium iaculis sed vitae dolor. Morbi auctor varius diam, eget posuere ante ultrices a. Vestibulum imperdiet tristique felis, ut consequat massa bibendum id. Sed imperdiet, nulla at convallis consectetur, sem risus vestibulum ligula, ac blandit elit velit nec dui. Nunc vehicula varius magna eu scelerisque. Sed quis urna non odio mattis euismod. Ut ac urna ut arcu tristique consectetur eu ut justo.
In hac habitasse platea dictumst. Ut bibendum velit vitae felis fringilla, vel consequat neque malesuada. Phasellus gravida justo sed efficitur rhoncus. Nunc sed bibendum erat, nec viverra purus. Quisque vitae aliquet nisi, a ullamcorper velit. Fusce nec risus eu ipsum fermentum elementum. Etiam vehicula tincidunt enim, eu tincidunt nunc. Fusce nec mi ut nisi sodales rutrum.
Vivamus ac dapibus turpis. Sed non dui vel velit ultrices lacinia id vitae libero. Sed vestibulum justo eu diam tincidunt, ac gravida libero tincidunt. Suspendisse fringilla nulla et nisi feugiat, in tincidunt odio semper. Nullam gravida ipsum vel tortor sollicitudin, at aliquet ex malesuada. Vivamus facilisis lacus in erat hendrerit fermentum. Vivamus congue, justo eu vehicula posuere, purus lectus malesuada lacus, vitae accumsan metus leo id libero.
Phasellus scelerisque mi ac nunc tincidunt, a fermentum libero efficitur. Sed a arcu arcu. Nullam bibendum arcu ut elit fringilla, non tincidunt purus tincidunt. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nam vitae urna eu nunc sodales dapibus. Duis eu arcu ut mi pharetra convallis vel vel ligula. Nulla facilisi. Vestibulum varius malesuada fermentum. Curabitur ut justo nec risus tristique fringilla nec vel velit. Vivamus vel cursus elit.
Integer cursus felis a tellus condimentum malesuada. Sed sodales, orci ac euismod cursus, libero justo cursus libero, at varius odio lacus ac urna. Morbi euismod, nulla vitae suscipit fringilla, odio dolor euismod est, a fermentum justo orci eu lectus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vestibulum feugiat lacus id lacus tincidunt, a tincidunt nisl sodales. Phasellus vel justo eu orci facilisis sagittis. Aenean quis arcu ut elit tincidunt consequat.
Nulla facilisi. Fusce ut eros in massa tempor interdum. Phasellus condimentum, mauris in auctor lacinia, justo nisl efficitur tortor, et vulputate nisi justo eu neque. Proin nec odio vitae dui fermentum iaculis ut et dolor. Ut interdum, justo id suscipit volutpat, mauris ligula fermentum enim, eu finibus elit nunc eu arcu. Quisque sit amet justo ut mi tincidunt scelerisque. Sed vitae tincidunt risus. Fusce dapibus massa in mauris ultrices, et congue arcu hendrerit. Vivamus convallis purus ut tortor fringilla, non rhoncus justo congue. Vestibulum quis sapien vel mi eleifend tristique. Aenean at aliquam sem. In hac habitasse platea dictumst. Etiam vitae nisi nec nunc iaculis consectetur.
Nulla at accumsan nisi. Nunc aliquam, quam sit amet vulputate laoreet, ante sem dignissim augue, vel varius libero neque eu neque. Vivamus quis efficitur dui. In hac habitasse platea dictumst. Pellentesque vel interdum augue, vel tincidunt massa. Proin non dolor vel tellus sodales vulputate vel nec quam. Integer ut lectus vel nisi hendrerit semper id quis libero. Aliquam ac varius ex. Nulla in mi vitae odio malesuada tincidunt non nec velit. Sed malesuada bibendum nulla nec ultricies. Fusce auctor sapien sit amet tortor auctor, vel varius elit blandit.
Sed venenatis urna et nisl varius, vel fermentum dui interdum. Nulla facilisi. Sed laoreet arcu non sem bibendum, a hendrerit elit laoreet. Sed ac arcu elit. Fusce tristique, quam ut ultrices varius, velit felis lacinia ex, a euismod erat nulla vitae libero. Praesent eu lacus nec nisl tempus lacinia. Vivamus lacinia risus sit amet sem ultricies, a vulputate justo fringilla.
Aenean eu massa ut felis dapibus hendrerit. Vestibulum sed tortor nunc. Sed auctor felis eu dui congue vestibulum. Integer nec justo a justo fermentum fringilla. Integer auctor turpis eget urna efficitur ultricies. Sed in sapien vel risus aliquet feugiat sit amet nec erat. Proin ut augue justo. Sed luctus leo eu magna vehicula lacinia.
Sed vehicula quam sed justo iaculis, in euismod tortor fringilla. Vivamus id interdum quam. Sed et justo eget mauris fringilla malesuada.

*/
