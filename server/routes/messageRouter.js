import { Router } from 'express';
import { sendMessage } from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; // <-- Import the bouncer

const router = Router();

router.post('/send', authenticateToken, sendMessage);

export default router;