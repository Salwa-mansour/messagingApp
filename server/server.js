import express from 'express';
import { createServer } from "http"; // 💡 Grouped native imports neatly
import { Server } from "socket.io";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { setupSocketAuth } from './middleware/socketAuth.js'; // Adjust path as needed

import authRouter from './routes/authRouter.js';
import messageRoutes from './routes/messageRouter.js';
import groupRoutes from './routes/groupRouter.js';
import usersRouter from './routes/usersRouter.js';

const app = express();

// Base Middleware Configuration
app.use(cookieParser()); 
app.use(express.json());

const allowedOrigins = ['http://localhost:5173'];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, 
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// 💡 Initialize HTTP Server Wrapper right after Express configurations
const httpServer = createServer(app);

// Initialize Socket.io attaching it to our shared HTTP server
const io = new Server(httpServer, {
    cors: corsOptions // Reuses your robust HTTP CORS layout natively!
});
setupSocketAuth(io); // 💡 Register your socket authentication middleware

// Attach Socket Instance to your Express Context Pipeline
app.set('io', io); 

// Socket Event Receivers
io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);
    
    socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });
});

// App Base API Router Targets
app.use('/api', authRouter);
app.use('/api/message', messageRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/users', usersRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// 💡 FIX: Start the httpServer wrapper on your execution port instead of app.listen
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running smoothly with nodemon on port ${PORT}`);
});