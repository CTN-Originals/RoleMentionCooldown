import mongoose from "mongoose";
import { cons, errorConsole } from "../..";
import generalData from '../index';
import { EmitError } from "../../events";

//? something like: mongodb+srv://<username>:<password>@<hostname>/<dbname>
const dbURITemplate: string = process.env.DATABASE_URI_TEMPLATE!

const mongoUser = encodeURIComponent(process.env.DATABASE_USERNAME!);
const mongoPass = encodeURIComponent(process.env.DATABASE_PASSWORD!);
const mongoHost = encodeURIComponent(process.env.DATABASE_HOSTNAME!);

const dbURI =  generalData.production ? 
	dbURITemplate
		.replace('<username>', mongoUser)
		.replace('<password>', mongoPass)
		.replace('<hostname>', mongoHost)
		.replace('<dbname>', process.env.PROJECT_NAME!) :
	(process.env.DATABASE_URI_LOCAL as string).replace('<dbname>', process.env.PROJECT_NAME!)
;

export class Database {
	public connection: mongoose.Connection|null
    constructor() {
        this.connection = null;
    }

    async connect() {
        cons.log('Connecting to [fg=blue st=bold]Database[/>]...')

		try {
			const conn = await mongoose.connect(dbURI);
			this.connection = conn.connection;
			
			if (generalData.development) {
				const ping = await conn.connection.db?.admin().ping();
				cons.logDefault(ping);
			}
		} catch (error) {
			cons.log('[st=bold][fg=cyan]Database[/>] connection ERROR:\n');
			errorConsole.log(error);
		}

		cons.log(`[fg=green st=bold]Connected[/>] to the [fg=blue st=bold]Database[/>]!`);
	}
}