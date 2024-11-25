import { Color } from "better-console-utilities"
import { Collection } from "discord.js"
import { duration } from "moment"
import { client } from ".."

//? a class that can take a string like 23s 69m 2h and turn it into a time length of 23 seconds, 9 minutes and 3 hours.
export class PeriodOfTime {
	public time: number

	private formatedInput: string
	private readonly sortOrder: string[] = ['D', 'H', 'M', 'S']

	constructor(public input: string) {
		this.formatedInput = input.trim().toUpperCase()
		const split = this.formatedInput.split(' ')

		//? take out any time entries that dont have a correct flag after it
		for (let i = 0; i < split.length; i++) {
			const flag = split[i][split[i].length - 1]
			if (!this.sortOrder.includes(flag)) {
				split.splice(i, 1)
			}
		}

		//? sort the order of the input so the "moment" function can understand it
		this.formatedInput = split.sort((a, b) =>
			this.sortOrder.indexOf(a[a.length - 1]) - this.sortOrder.indexOf(b[b.length - 1])
		).join('')

		//? make sure PT is included the right way, put the day time input between the P and T if present
		this.formatedInput = (this.formatedInput.includes('D')) ? "P" + this.formatedInput.replace('D', 'DT') : "PT" + this.formatedInput

		//? get the time in miliseconds
		this.time = duration(this.formatedInput).asMilliseconds()
	}

	public toString(): string {
		return getTimeDisplay(this.time)
	}

	public get dateTime(): Date {
		return new Date(this.time)
	}
}

/**
 * Converts milliseconds into greater time units as possible
 * 
 * source: https://stackoverflow.com/a/68673714
 * @param {int} ms - Amount of time measured in milliseconds
 * @return {?Object} Reallocated time units. NULL on failure.
 */
export function timeUnits(ms: number): {
	days: number,
	hours: number,
	minutes: number,
	seconds: number,
	milliseconds: number
} {
	if (!Number.isInteger(ms)) {
		return {
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		}
	}

	/**
	 * Takes as many whole units from the time pool (ms) as possible
	 * @param {int} msUnit - Size of a single unit in milliseconds
	 * @return {int} Number of units taken from the time pool
	 */
	const allocate = (msUnit: number) => {
		const units = Math.trunc(ms / msUnit)
		ms -= units * msUnit
		return units
	}

	// Property order is important here.
	// These arguments are the respective units in ms.
	return {
		// weeks: allocate(604800000), // Uncomment for weeks
		days: allocate(86400000),
		hours: allocate(3600000),
		minutes: allocate(60000),
		seconds: allocate(1000),
		milliseconds: ms // remainder
	}
}

//? discords needs a specific timestamp for their timestamp embeds to work...
export function getTimestamp(date: Date | number): number {
	let rawTime = '0'

	if (typeof date == 'number') {
		rawTime = date.toString()
	} else {
		rawTime = date.getTime().toString()
	}

	const timeSplit = rawTime.split('')
	const time = timeSplit.splice(0, 10).join('')

	return parseFloat(time)
}

export function getTimeDisplay(time: number) {
	const units = timeUnits(time)
	const formatTime = (t: number) => { return (t < 10) ? `0${t}` : t }

	return `${units.days}d ${formatTime(units.hours)}:${formatTime(units.minutes)}:${formatTime(units.seconds)}`
}

export function hexToBit(hex: string): number
export function hexToBit(color: Color): number
export function hexToBit(hex_color: string | Color): number {
	if (typeof hex_color == 'string') {
		return parseInt('0x' + hex_color.replace('#', ''))
	}
	else {
		return parseInt('0x' + hex_color.asHex.replace('#', ''))
	}
}

export function includesAny(target: string | string[], items: string[]): boolean {
	for (const item of items) {
		if (target.includes(item)) { return true }
	}

	return false
}
export function includesAll(target: string | string[], items: string[]): boolean {
	for (const item of items) {
		if (!target.includes(item)) { return false }
	}

	return true
}

type CommandInfo = {
	name: string
	description: string
	options?: OptionInfo[]
}

type OptionInfo = {
	name: string
	description: string
	required: boolean
	type: number
	min_length?: number
	max_length?: number
	options?: OptionInfo[]
}
//? this is not my best function... but it works and i dont wanna do more recursion stuff so f it
export function getExecutableCommands(commands: Collection<string, { data: CommandInfo }> = client.commands) {
	function parseCommands(commands: CommandInfo[], prefix: string = "") {
		const result: { command: string; description: string; options: OptionInfo[] }[] = []

		for (const command of commands) {
			if (!command.name || !command.description) { continue }

			const currentCommand = prefix ? `${prefix} ${command.name}` : `${command.name}`

			if (!command.options || command.options.every((opt) => !opt.options)) {
				// If there are no nested options or only terminal options, this is executable
				result.push({
					command: currentCommand,
					description: command.description,
					options: command.options || [],
				})
			} else {
				//? Recursively look for executable subcommands/groups
				const subcommandsOrGroups = command.options.filter((opt) => opt.options)
				for (const subcommandOrGroup of subcommandsOrGroups) {
					result.push(
						...parseCommands([subcommandOrGroup], currentCommand)
					)
				}
			}
		}

		return result
	}

	let cmds: CommandInfo[] = []
	for (const [k, v] of commands.entries()) {
		cmds.push(v.data)
	}

	return parseCommands(cmds)
}
