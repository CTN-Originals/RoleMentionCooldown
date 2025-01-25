import { ConsoleInstance } from "better-console-utilities";

import { ErrorObject } from "../handlers/errorHandler";
import errorEvent from "../events/error";
import { EventEmitter } from "events";

export const eventConsole = new ConsoleInstance();
export const customEvents = new EventEmitter();


export async function EmitError(error: Error, ...args: any): Promise<ErrorObject> {
	return errorEvent.execute(error, ...args) as Promise<ErrorObject>;
}

/** Emits an error through the custom error object logger and then returns the error message string so it can be thrown at the callers position.
 * The upside to this is that it can log the error nicely and throw in the same line, instead of having to make an error object, then log it and then throw
 * @param {string} message The message of the error
 * @returns The error message
*/
export function onError(message: string): string {
	const err = new Error(message)
	EmitError(err);
	return err.message;
}