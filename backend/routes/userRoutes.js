import express from 'express';
import { 
  getAllUsers, 
  deleteUser, 
  updateUser, 
  getMe, 
  updateProfile,
  logoutUser,
  getAllSubscriptionPlans,
  getSubscriptionPlansByVendor,
  getSubscriptionPlanById,
  getCart,
  addOrUpdateCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  createUserSubscription,
  uploadPaymentProof,
  getUserSubscriptions,
  deleteUserSubscription,
  getSubscriptionQrData,
  prebookMeal,
  cancelUserSubscription
} from '../controllers/user/userController.js';
import { createOrder, uploadOrderPaymentProof, getUserOrders, getOrderQr, getUserOrderById, getOrderEstimate } from '../controllers/user/orderController.js';
import { userSseHandler } from '../utils/events.js';
import { getUserNotifications, getNotificationById, markAllUserNotificationsRead, getUnreadNotificationsCount } from '../controllers/notificationController.js';
import { authenticateAdmin, authenticateUser } from '../middleware/user/authMiddleware.js';
import { uploadPaymentProof as uploadPaymentProofMulter } from '../config/cloudinary.js';

const router = express.Router();

// --- Cart management routes (these must come first!) ---
router.get('/cart', authenticateUser, getCart);
router.post('/cart', authenticateUser, addOrUpdateCartItem);
router.delete('/cart', authenticateUser, clearCart);
router.put('/cart/:itemId', authenticateUser, updateCartItemQuantity);
router.delete('/cart/:itemId', authenticateUser, removeCartItem);

// --- Authenticated user routes ---
router.post('/logout', authenticateUser, logoutUser);
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, updateProfile);
router.get('/subscriptions', authenticateUser, getUserSubscriptions);
router.delete('/subscriptions/:subscriptionId', authenticateUser, deleteUserSubscription);
router.post('/subscriptions/:subscriptionId/cancel', authenticateUser, cancelUserSubscription);
router.post('/subscriptions/:subscriptionId/prebook', authenticateUser, prebookMeal);

// --- Subscription plan routes (for users to browse) ---
router.get('/subscription-plans', getAllSubscriptionPlans);
router.get('/subscription-plans/vendor/:vendorId', getSubscriptionPlansByVendor);
router.get('/subscription-plans/:id', getSubscriptionPlanById);

// --- Subscription routes ---
router.post('/subscriptions', authenticateUser, createUserSubscription);
router.post('/subscriptions/:subscriptionId/payment-proof', authenticateUser, uploadPaymentProofMulter.single('paymentProof'), uploadPaymentProof);
router.get('/subscriptions/:subscriptionId/qr', authenticateUser, getSubscriptionQrData);

// --- Order routes ---
router.post('/orders', authenticateUser, createOrder);
router.post('/orders/:orderId/payment-proof', authenticateUser, uploadPaymentProofMulter.single('paymentProof'), uploadOrderPaymentProof);
router.get('/orders', authenticateUser, getUserOrders);
router.get('/orders/:orderId', authenticateUser, getUserOrderById);
router.get('/orders/:orderId/qr', authenticateUser, getOrderQr);
router.get('/orders/:orderId/estimate', authenticateUser, getOrderEstimate);
// SSE stream for user order events
router.get('/orders/events', authenticateUser, userSseHandler);

// --- Notification routes ---
router.get('/notifications/user', authenticateUser, getUserNotifications);
router.get('/notifications/:notificationId', authenticateUser, getNotificationById);
router.post('/notifications/mark-all-read', authenticateUser, markAllUserNotificationsRead);
router.get('/notifications/unread-count', authenticateUser, getUnreadNotificationsCount);

// --- Admin-only routes (generic, must come last) ---
router.get('/', authenticateAdmin, getAllUsers);
router.delete('/:id', authenticateAdmin, deleteUser);
router.put('/:id', authenticateAdmin, updateUser);

// --- Catch-all for debugging ---
router.use((req, res, next) => {
  next();
});

export default router; 