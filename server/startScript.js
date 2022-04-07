import app from './server.js';
import { connect } from './db.js';

import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;
export const start = async () => {
	try {
		await connect()
			.then(() => {
				app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
			})
			.catch((error) => console.error(error));
	} catch (error) {
		console.log(error);
	}
};
