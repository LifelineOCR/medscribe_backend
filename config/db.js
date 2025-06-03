// connect to my MongoDB database
import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
	  logger.error('MONGO_URI is not defined in the environment variables');
  process.exit(1);
}

const connectDB = async () => {
	try {
		await mongoose.connect(MONGO_URI);
		logger.info('MongoDB connected successfully');
	} catch (error) {
		logger.error('MongoDB connection failed:', error.message);
		process.exit(1); // Exit the process if connection fails
	}
}

export default connectDB;