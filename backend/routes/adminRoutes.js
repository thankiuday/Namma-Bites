import express from 'express';
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  registerFirstAdmin,
  refreshToken
} from '../controllers/adminAuthController.js';
import { protect, superAdmin } from '../middleware/adminAuthMiddleware.js';
import { login, register } from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', loginAdmin);
router.post('/register/first', registerFirstAdmin);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(authenticateAdmin);
router.post('/register', registerAdmin);
router.get('/profile', protect, getAdminProfile);

export default router; 