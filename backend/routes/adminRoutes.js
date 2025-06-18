import express from 'express';
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  registerFirstAdmin
} from '../controllers/adminAuthController.js';
import { protect, superAdmin } from '../middleware/adminAuthMiddleware.js';
import { login, register } from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register/first', register);

// Protected routes
router.use(authenticateAdmin);
router.post('/register', register);
router.get('/profile', protect, getAdminProfile);

export default router; 