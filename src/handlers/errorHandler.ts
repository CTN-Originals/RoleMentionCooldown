import { Color, ConsoleInstance, Theme } from "better-console-utilities"
import { errorConsole } from ".."

const thisCons = new ConsoleInstance();
const rootPath = process.cwd();
const defaultColor = errorConsole.theme.typeThemes.default ?? errorConsole.theme.default;

interface IStackOptions {
	/** Remove the root path from the stack 
	 * @default true
	*/
	removeRootPath: boolean;
	/** Shorten the path by cutting out the middle of the path and replacing it with '...' 
	 * @default false
	*/
	shortenPaths: boolean;
	/** Ignore paths that start with 'node:' 
	 * @default false
	*/
	ignoreInternals: boolean;
	/** Apply color flags to the raw stack 
	 * @default false
	*/
	colorize: boolean;
	/** Exclude paths that start with this list of directories (e.g. ['node_modules', 'src\\tests']) 
	 * @default []
	*/
	excludeDirectories: string[];
	/** Seperator between Call and Path 
	 * @default ' '
	*/
	inlineSeperator: string;
	/** Prefix for each line 
	 * @default '    '
	*/
	linePrefix: string;
}
export class ErrorObject {
	public error: Error;
	public errorType: string;
	public errorMessage: string;
	public errorStack: string;
	public formattedError: string;

	constructor(error: Error, stackOptions?: Partial<IStackOptions>) {
		this.error = error;
		this.errorType = this.error.name ?? 'Error';
		this.errorMessage = this.error.message;
		this.errorStack = this.error.stack ?? '';
		this.formattedError = this.formatError(stackOptions);
	}

	formatError(stackOptions?: Partial<IStackOptions>): string {
		let formattedError = [
			`Error: ${this.errorType}`,
			`Message: ${this.errorMessage}`,
			`Stack:\n${this.formatStack(stackOptions)}`
		].join('\n');

		return formattedError;
	}

	formatStack(inputOptions?: Partial<IStackOptions>): string {
		const options: IStackOptions = {
			removeRootPath: inputOptions?.removeRootPath ?? true,
			shortenPaths: inputOptions?.shortenPaths ?? false,
			ignoreInternals: inputOptions?.ignoreInternals ?? false,
			colorize: inputOptions?.colorize ?? false,
			excludeDirectories: inputOptions?.excludeDirectories ?? [],
			inlineSeperator: inputOptions?.inlineSeperator ?? ' ',
			linePrefix: inputOptions?.linePrefix ?? '    ',
		};
		let formattedStack = '';
		
		if (options.removeRootPath && rootPath) {
			this.errorStack = this.errorStack.replaceAll(rootPath + '\\', ``);
		}
		
		let messageLineCount = this.errorMessage.split('\n').length;
		const stackArray = this.errorStack.split('\n');
		stackArray.splice(0, messageLineCount); //? Remove the lines that contain the error message
		stackArray.forEach(stackLine => {
			//> split: at Object.execute <-> (src\events\ready.ts:14:29)
			const lineSplit = stackLine.split(' (');
			let call = '', path = '';
			if (lineSplit.length == 2) {
				call = lineSplit[0].replace('at ', '').trimStart();
				path = lineSplit[1].replace(')', '');
			}
			else { //? stackLine likely didnt include the call
				call = 'at <unknown>';
				path = lineSplit[0].replace('at ', '').trimStart();
			}

			if (options.shortenPaths) { //? Shorten the path by cutting out the middle of the path and replacing it with '...'
				const pathSplit = path.split('\\');
				const pathLength = pathSplit.length;
				if (pathLength > 3) {
					path = `${pathSplit[0]}\\...\\${pathSplit[pathLength - 2]}\\${pathSplit[pathLength - 1]}`;
				}
			}

			if (options.ignoreInternals && path.startsWith('node:')) return;
			for (let i = 0; i < options.excludeDirectories.length; i++) {
				if (path.startsWith(`${options.excludeDirectories[i]}\\`)) return;
			}
			
			if (options.colorize) {
				const callTheme = new Theme(defaultColor.foreground, defaultColor.background, []);
				const pathTheme = new Theme('#aaaaaa', null, []);
	
				if (path.startsWith('node:')) {
					callTheme.addStyle('dim');
					callTheme.removeStyle('bold');
					pathTheme.addStyle('dim');
				}
				else if (path.startsWith('src\\')) {
					callTheme.foreground = new Color('#00a85a');
				}
				else if (path.startsWith('node_modules\\')) {
					callTheme.foreground = new Color('#cdaa7d');
				}
				path = `${pathTheme.getThemedString(`${path}`)}`;
				call = `${callTheme.getThemedString(`${call}`)}`;
			}

			formattedStack += `${options.linePrefix}${call}${options.inlineSeperator}(${path})\n`;
		});
		
		return formattedStack;
	}
}
