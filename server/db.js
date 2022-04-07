import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

export const connect = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log('database connected successfully');
	} catch (error) {
		console.error(error);
		console.log('could not connect');
	}
};
