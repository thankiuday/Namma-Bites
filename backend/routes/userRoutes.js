import express from 'express';
import { getAllUsers } from '../controllers/userController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateAdmin, getAllUsers);

export default router; 