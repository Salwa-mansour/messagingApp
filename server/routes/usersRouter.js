 import { Router } from 'express';
import * as usersController from '../controllers/usersController.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; // <-- Import the bouncer

const router = Router();
router.get('/', authenticateToken, usersController.getAllUsers);

export default router;