import { ConsoleInstance } from "better-console-utilities";

import { ErrorObject } from "../handlers/errorHandler";
import errorEvent from "../events/error";
import { EventEmitter } from "events";

export const eventConsole = new ConsoleInstance();
export const customEvents = new EventEmitter();


export async function EmitError(error: Error, ...args: any): Promise<ErrorObject> {
	return errorEvent.execute(error, ...args) as Promise<ErrorObject>;
}
