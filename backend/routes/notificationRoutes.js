import express from 'express';
import {
  createNotification,
  getUserNotifications,
  getVendorNotifications,
  updateNotification,
  getNotificationById,
  markAllUserNotificationsRead,
  getUnreadNotificationsCount
} from '../controllers/notificationController.js';
import { authenticateUser, authenticateVendor, authenticateAdmin } from '../middleware/user/authMiddleware.js';

const router = express.Router();

// User routes
router.get('/user', authenticateUser, getUserNotifications);
router.get('/unread-count', authenticateUser, getUnreadNotificationsCount);
router.post('/mark-all-read', authenticateUser, markAllUserNotificationsRead);
router.get('/:notificationId', authenticateUser, getNotificationById);

// Vendor routes
router.post('/vendor', authenticateVendor, createNotification);
router.get('/vendor', authenticateVendor, getVendorNotifications);
router.patch('/vendor/:notificationId', authenticateVendor, updateNotification);

// Admin routes
router.post('/admin', authenticateAdmin, createNotification);
router.patch('/admin/:notificationId', authenticateAdmin, updateNotification);

export default router;
