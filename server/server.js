import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import authRouter from './routes/authRouter.js';
import messageRoutes from './routes/messageRouter.js';

const app = express();

// Middleware
app.use(cors()); // Connects to your React local server
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