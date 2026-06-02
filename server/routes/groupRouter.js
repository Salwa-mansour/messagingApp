import {Router} from 'express';
import * as groupController from '../controllers/groupController.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; // <-- Import the bouncer

const router = Router();

router.get('/user-groups', authenticateToken, groupController.getUserGroups);

export default router;