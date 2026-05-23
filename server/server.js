import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import authRouter from './routes/authRouter.js';
import messageRoutes from './routes/messageRouter.js';


const app = express();

// Middleware
const allowedOrigins = ['http://localhost:5173'];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Crucial for handling cookies/refresh tokens
    optionsSuccessStatus: 200
};

// 2. Apply the middleware BEFORE your route handlers
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use('/api', authRouter);
app.use('/api/message', messageRoutes);;

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running with nodemon on port ${PORT}`);
});