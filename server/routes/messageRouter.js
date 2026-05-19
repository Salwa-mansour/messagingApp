import { Router } from 'express';
// import { getChatMessages, createNewMessage } from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; // <-- Import the bouncer

const router = Router();


// PROTECTED ROUTES: Only logged-in users with a valid access token can read or post messages
// router.get('/messages', authenticateToken, getChatMessages);
// router.post('/messages', authenticateToken, createNewMessage);

export default router;