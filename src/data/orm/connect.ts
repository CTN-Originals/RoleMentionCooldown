import mongoose from 'mongoose';
import { cons } from '../..';
import { errorConsole } from '../../handlers/errorHandler';
import { GeneralData } from '../index';

//? something like: mongodb+srv://<username>:<password>@<hostname>/<dbname>
const dbURITemplate: string = process.env.DATABASE_URI_TEMPLATE!;

const mongoUser = encodeURIComponent(process.env.DATABASE_USERNAME!);
const mongoPass = encodeURIComponent(process.env.DATABASE_PASSWORD!);
const mongoHost = encodeURIComponent(process.env.DATABASE_HOSTNAME!);

const dbURI = (GeneralData.production || GeneralData.beta) ?
	dbURITemplate
		.replace('<username>', mongoUser)
		.replace('<password>', mongoPass)
		.replace('<hostname>', mongoHost)
		.replace('<dbname>', process.env.APP_NAME!) :
	(process.env.DATABASE_URI_LOCAL as string).replace('<dbname>', process.env.APP_NAME!);


export class Database {
	public connection: mongoose.Connection|null;
	constructor() {
		this.connection = null;
	}

	async connect() {
		if (GeneralData.logging.startup.enabled && GeneralData.logging.startup.database) {
			cons.log('Connecting to [fg=blue st=bold]Database[/>]...');
		}

		try {
			const conn = await mongoose.connect(dbURI);
			this.connection = conn.connection;
		} catch (error) {
			cons.log('[fg=cyan st=bold]Database[/>] connection ERROR:');
			errorConsole.log(error);
		}

		if (GeneralData.logging.startup.enabled && GeneralData.logging.startup.database) {
			cons.log('[fg=green st=bold]Connected[/>] to the [fg=blue st=bold]Database[/>]!');
		}
	}
}