import express from 'express';
import {
  createNotification,
  getUserNotifications,
  getVendorNotifications,
  updateNotification
} from '../controllers/notificationController.js';
import { authenticateUser } from '../middleware/user/authMiddleware.js';
import { authenticateVendor } from '../middleware/vendor/authMiddleware.js';
import { authenticateAdmin } from '../middleware/admin/adminAuthMiddleware.js';

const router = express.Router();

// User routes
router.get('/user', authenticateUser, getUserNotifications);

// Vendor routes
router.post('/vendor', authenticateVendor, createNotification);
router.get('/vendor', authenticateVendor, getVendorNotifications);
router.patch('/vendor/:notificationId', authenticateVendor, updateNotification);

// Admin routes
router.post('/admin', authenticateAdmin, createNotification);
router.patch('/admin/:notificationId', authenticateAdmin, updateNotification);

export default router;
