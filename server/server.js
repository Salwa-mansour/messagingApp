import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

const app = express();

// Middleware
app.use(cors()); // Connects to your React local server
app.use(express.json());
app.use(cookieParser());

// Simple Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: "Hello from the JavaScript Express backend!" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running with nodemon on port ${PORT}`);
});