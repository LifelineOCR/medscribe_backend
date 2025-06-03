import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDb from './config/db.js';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import authRouter from './routes/auth.routes.js';
import documentRouter from './routes/document.routes.js';


const app = express();
const PORT = process.env.PORT || 4000;
// connect to database
await connectDb();

//middleware
app.use(express.json());
app.use(errorHandler)
app.use(express.urlencoded({ extended: true }));

//routes
app.get('/', (req, res) => {
	res.send(`MedScribe Backend API`);
});
app.use('/api/auth', authRouter);
app.use('/api/documents', documentRouter);




// start server
app.listen(PORT, () =>{
	logger.info(`MedScribe Backend Server running on http://localhost:${PORT}`);
});