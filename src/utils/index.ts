import { duration } from "moment";

//? a class that can take a string like 23s 69m 2h and turn it into a time length of 23 seconds, 9 minutes and 3 hours.
export class PeriodOfTime {
	public time: number;
	
	private formatedInput: string
	private readonly sortOrder: string[] = ['D', 'H', 'M', 'S']

	constructor(public input: string) {
		this.formatedInput = input.trim().toUpperCase();
		const split = this.formatedInput.split(' ')

		//? take out any time entries that dont have a correct flag after it
		for (let i = 0; i < split.length; i++) {
			const flag = split[i][split[i].length - 1]
			if (!this.sortOrder.includes(flag)) {
				split.splice(i, 1);
			}
		}

		//? sort the order of the input so the "moment" function can understand it
		this.formatedInput = split.sort((a, b) =>
			this.sortOrder.indexOf(a[a.length - 1]) - this.sortOrder.indexOf(b[b.length - 1])
		).join('');

		//? make sure PT is included the right way, put the day time input between the P and T if present
		this.formatedInput = (this.formatedInput.includes('D')) ? "P" + this.formatedInput.replace('D', 'DT') : "PT" + this.formatedInput;

		//? get the time in miliseconds
		this.time = duration(this.formatedInput).asMilliseconds();
	}
}