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
import { login, register, getPendingAdmins, approveAdmin, getAllAdmins, deleteAdmin } from '../controllers/admin/adminController.js';
import { authenticateAdmin, requireSuperAdmin } from '../middleware/user/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register); // Anyone can register, but needs approval
router.post('/register/first', registerFirstAdmin);
router.post('/refresh-token', refreshToken);

// Protected routes (all routes below this will use authenticateAdmin)
router.use(authenticateAdmin);
router.post('/logout', logoutAdmin);
router.get('/profile', getAdminProfile);

// Super Admin only routes (admin auth already applied by router.use above)
router.get('/pending-admins', requireSuperAdmin, getPendingAdmins);
router.post('/admins/:adminId/approve', requireSuperAdmin, approveAdmin);
router.get('/all-admins', requireSuperAdmin, getAllAdmins);
router.delete('/admins/:adminId', requireSuperAdmin, deleteAdmin);

export default router; 