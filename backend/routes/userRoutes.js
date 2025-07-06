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
  clearCart
} from '../controllers/user/userController.js';
import { authenticateAdmin, authenticateUser } from '../middleware/user/authMiddleware.js';

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

// --- Subscription plan routes (for users to browse) ---
router.get('/subscription-plans', getAllSubscriptionPlans);
router.get('/subscription-plans/vendor/:vendorId', getSubscriptionPlansByVendor);
router.get('/subscription-plans/:id', getSubscriptionPlanById);

// --- Admin-only routes (generic, must come last) ---
router.get('/', authenticateAdmin, getAllUsers);
router.delete('/:id', authenticateAdmin, deleteUser);
router.put('/:id', authenticateAdmin, updateUser);

// --- Catch-all for debugging ---
router.use((req, res, next) => {
  console.log('userRoutes catch-all:', req.method, req.originalUrl);
  next();
});

export default router; 