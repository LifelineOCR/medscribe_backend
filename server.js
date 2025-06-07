import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
import connectDb from './config/db.js';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import authRouter from './routes/auth.routes.js';
import documentRouter from './routes/document.routes.js';
import patientRouter from './routes/patient.routes.js'; 


const app = express();
const PORT = process.env.PORT || 4000;
// connect to database
await connectDb();

//middleware
app.use(express.json());
app.use(errorHandler)
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = ['http://localhost:3000']; 

    const corsOptions = {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
          const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
      credentials: true, // If you need to handle cookies or authorization headers
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allowed HTTP methods
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allowed headers
    };

    // Enable CORS with the specified options
    app.use(cors(corsOptions));
//routes
app.get('/', (req, res) => {
	res.send(`MedScribe Backend API`);
});
app.use('/api/auth', authRouter);
app.use('/api/documents', documentRouter);
app.use('/api/patients', patientRouter);



// start server
app.listen(PORT, () =>{
	logger.info(`MedScribe Backend Server running on http://localhost:${PORT}`);
});