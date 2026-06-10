import { Router } from 'express';
import { sendMessage,getGroupMessages } from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; // <-- Import the bouncer

const router = Router();

router.post('/send/:targetId', authenticateToken, sendMessage);
router.get('/:groupId', authenticateToken, getGroupMessages);

export default router;