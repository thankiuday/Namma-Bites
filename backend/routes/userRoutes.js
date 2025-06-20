import express from 'express';
import { getAllUsers, deleteUser, updateUser, getMe, updateProfile } from '../controllers/user/userController.js';
import { authenticateAdmin, authenticateUser } from '../middleware/user/authMiddleware.js';

const router = express.Router();

// User self profile routes (must come first)
router.get('/me', authenticateUser, getMe);
router.put('/update-profile', authenticateUser, updateProfile);

// Admin-only routes
router.get('/', authenticateAdmin, getAllUsers);
router.delete('/:id', authenticateAdmin, deleteUser);
router.put('/:id', authenticateAdmin, updateUser);

// Catch-all for debugging
router.use((req, res, next) => {
  console.log('userRoutes catch-all:', req.method, req.originalUrl);
  next();
});

export default router; 