import { ConsoleInstance } from "better-console-utilities"
import { EventEmitter } from "events"
import errorEvent from "../events/error"
import { ErrorObject } from "../handlers/errorHandler"

export const eventConsole = new ConsoleInstance();
export const customEvents = new EventEmitter();


export async function EmitError(error: Error, ...args: any): Promise<ErrorObject> {
	return errorEvent.execute(error, ...args) as Promise<ErrorObject>;
}
