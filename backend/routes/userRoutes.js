import express from 'express';
import { 
  getAllUsers, 
  deleteUser, 
  updateUser, 
  getMe, 
  updateProfile,
  logoutUser
} from '../controllers/user/userController.js';
import { authenticateAdmin, authenticateUser } from '../middleware/user/authMiddleware.js';

const router = express.Router();

// Admin-only routes
router.get('/', authenticateAdmin, getAllUsers);
router.delete('/:id', authenticateAdmin, deleteUser);
router.put('/:id', authenticateAdmin, updateUser);

// Authenticated user routes
router.post('/logout', authenticateUser, logoutUser);
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, updateProfile);

// Catch-all for debugging
router.use((req, res, next) => {
  console.log('userRoutes catch-all:', req.method, req.originalUrl);
  next();
});

export default router; 