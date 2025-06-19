import express from 'express';
import { getAllUsers, deleteUser, updateUser } from '../controllers/userController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateAdmin, getAllUsers);

// Delete user by ID (admin only)
router.delete('/:id', authenticateAdmin, deleteUser);

// Update user by ID (admin only)
router.put('/:id', authenticateAdmin, updateUser);

export default router; 