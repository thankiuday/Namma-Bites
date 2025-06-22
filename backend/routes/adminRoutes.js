import express from 'express';
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  registerFirstAdmin,
  refreshToken
} from '../controllers/admin/adminAuthController.js';
import { protect, superAdmin } from '../middleware/admin/adminAuthMiddleware.js';
import { login, register } from '../controllers/admin/adminController.js';
import { authenticateAdmin } from '../middleware/user/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register/first', registerFirstAdmin);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(authenticateAdmin);
router.post('/register', registerAdmin);
router.post('/logout', logoutAdmin);
router.get('/profile', getAdminProfile);

export default router; 