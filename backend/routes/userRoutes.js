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
  deleteUserSubscription
} from '../controllers/user/userController.js';
import { authenticateAdmin, authenticateUser } from '../middleware/user/authMiddleware.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Ensure uploads/payment-proofs directory exists
const paymentProofDir = path.join(process.cwd(), 'uploads/payment-proofs');
if (!fs.existsSync(paymentProofDir)) {
  fs.mkdirSync(paymentProofDir, { recursive: true });
}

const paymentProofStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads/payment-proofs'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: paymentProofStorage });

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

// --- Subscription plan routes (for users to browse) ---
router.get('/subscription-plans', getAllSubscriptionPlans);
router.get('/subscription-plans/vendor/:vendorId', getSubscriptionPlansByVendor);
router.get('/subscription-plans/:id', getSubscriptionPlanById);

// --- Subscription routes ---
router.post('/subscriptions', authenticateUser, createUserSubscription);
router.post('/subscriptions/:subscriptionId/payment-proof', authenticateUser, upload.single('paymentProof'), uploadPaymentProof);

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