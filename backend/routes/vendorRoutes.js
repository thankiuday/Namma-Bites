import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { 
  createVendor, 
  getAllVendors, 
  getVendorById, 
  updateVendor, 
  deleteVendor, 
  loginVendor, 
  logoutVendor,
  updateCurrentVendorProfile,
  changeVendorPassword,
  getSelfVendor,
  updateCurrentVendorStatus,
  addMenuItem,
  getMenuItemsByVendor,
  updateMenuItem,
  deleteMenuItem,
  getPublicVendors,
  approveVendor,
  getAllMenuItems,
  getAllVegMenuItems,
  getAllNonVegMenuItems,
  getMenuItemById,
  rateMenuItem,
  createSubscriptionPlan,
  getMySubscriptionPlans,
  getMySubscriptionPlanById,
  updateMySubscriptionPlan,
  getPendingUserSubscriptions,
  approveUserSubscription,
  getApprovedUserSubscriptions,
  getRejectedUserSubscriptions,
  scanSubscriptionQr,
  getMealPrebookings
} from '../controllers/vendor/vendorController.js';
import { getVendorOrders, acceptOrder, rejectOrder, markOrderReady, completeOrder, scanOrderQr } from '../controllers/vendor/orderController.js';
import { authenticateAdmin, authenticateVendor, authenticateUser } from '../middleware/user/authMiddleware.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create upload directory if it doesn't exist
const vendorImagesDir = path.join(__dirname, '../../uploads/vendor-images');
if (!fs.existsSync(vendorImagesDir)) {
    fs.mkdirSync(vendorImagesDir, { recursive: true });
}

const itemImagesDir = path.join(__dirname, '../../uploads/items-images');
if (!fs.existsSync(itemImagesDir)) {
    fs.mkdirSync(itemImagesDir, { recursive: true });
}

// Configure multer for VENDOR image upload
const vendorStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'image') {
      cb(null, vendorImagesDir);
    } else if (file.fieldname === 'scanner') {
      cb(null, vendorScannerDir);
    } else {
      cb(new Error('Invalid field name'), null);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for MENU ITEM image upload
const itemStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, itemImagesDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure multer for VENDOR SCANNER image upload
const vendorScannerDir = path.join(__dirname, '../../uploads/vendor-scanner');
if (!fs.existsSync(vendorScannerDir)) {
  fs.mkdirSync(vendorScannerDir, { recursive: true });
}
const scannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, vendorScannerDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
export const uploadVendorScanner = multer({ storage: scannerStorage });

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const uploadVendorImage = multer({ 
    storage: vendorStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

const uploadItemImage = multer({
    storage: itemStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    }
});

// === PUBLIC ROUTES ===
// Note: These must be defined before any routes with parameters like /:id

// Get all public vendors (public)
router.get('/public', getPublicVendors);

// Get all public menu items (public)
router.get('/menu-items/all', getAllMenuItems);

// Get all veg menu items (public)
router.get('/menu-items/veg', getAllVegMenuItems);

// Get all non-veg menu items (public)
router.get('/menu-items/non-veg', getAllNonVegMenuItems);

// Get menu item by ID (public)
router.get('/menu-items/:id', getMenuItemById);

// Add rating to menu item (authenticated user only)
router.post('/menu-items/:id/rate', authenticateUser, rateMenuItem);

// Debug ping route
router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'pong' });
});

// === VENDOR-SPECIFIC ROUTES (must be before admin routes with /:id) ===

// Get current vendor details (protected, vendor only)
router.get('/me', authenticateVendor, getSelfVendor);

// Update current vendor profile (protected, vendor only)
router.put('/me', authenticateVendor, uploadVendorImage.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'scanner', maxCount: 1 }
]), updateCurrentVendorProfile);

// Update current vendor status (protected, vendor only)
router.put('/me/status', authenticateVendor, updateCurrentVendorStatus);

// Change vendor password (protected, vendor only)
router.post('/change-password', authenticateVendor, changeVendorPassword);

// Get all menu items for the vendor (protected, vendor only)
router.get('/menu-items', authenticateVendor, getMenuItemsByVendor);

// Add a new menu item (protected, vendor only)
router.post('/menu-items', authenticateVendor, uploadItemImage.single('image'), addMenuItem);

// Update a menu item (protected, vendor only)
router.put('/menu-items/:id', authenticateVendor, uploadItemImage.single('image'), updateMenuItem);

// Delete a menu item (protected, vendor only)
router.delete('/menu-items/:id', authenticateVendor, deleteMenuItem);

// Add a new subscription plan (protected, vendor only)
router.post('/subscription-plans', authenticateVendor, createSubscriptionPlan);

// Get all subscription plans for current vendor
router.get('/subscription-plans', authenticateVendor, getMySubscriptionPlans);

// Get a single subscription plan by ID
router.get('/subscription-plans/:id', authenticateVendor, getMySubscriptionPlanById);

// Update a subscription plan by ID
router.put('/subscription-plans/:id', authenticateVendor, updateMySubscriptionPlan);

// Vendor user subscription approval routes
router.get('/user-subscriptions/pending', authenticateVendor, getPendingUserSubscriptions);
router.post('/user-subscriptions/:subscriptionId/approve', authenticateVendor, approveUserSubscription);
router.get('/user-subscriptions/approved', authenticateVendor, getApprovedUserSubscriptions);
router.get('/user-subscriptions/rejected', authenticateVendor, getRejectedUserSubscriptions);
router.post('/scan-qr', authenticateVendor, scanSubscriptionQr);

// --- Order routes ---
router.get('/orders', authenticateVendor, getVendorOrders);
router.post('/orders/:orderId/accept', authenticateVendor, acceptOrder);
router.post('/orders/:orderId/reject', authenticateVendor, rejectOrder);
router.post('/orders/:orderId/ready', authenticateVendor, markOrderReady);
router.post('/orders/:orderId/complete', authenticateVendor, completeOrder);
router.post('/orders/scan-qr', authenticateVendor, scanOrderQr);

// Pre-bookings route for vendors
router.get('/prebookings', authenticateVendor, getMealPrebookings);

// === ADMIN-ONLY ROUTES ===

// Get all vendors (protected, admin only)
router.get('/', authenticateAdmin, getAllVendors);

// Get vendor by ID (protected, admin only)
router.get('/:id', authenticateAdmin, getVendorById);

// Create vendor route (protected, admin only)
router.post('/create', authenticateAdmin, uploadVendorImage.fields([
  { name: 'image', maxCount: 1 },
  { name: 'scanner', maxCount: 1 }
]), createVendor);

// Update vendor route (protected, admin only)
router.put('/:id', authenticateAdmin, uploadVendorImage.fields([
  { name: 'image', maxCount: 1 },
  { name: 'scanner', maxCount: 1 }
]), updateVendor);

// Approve vendor route (protected, admin only)
router.put('/:id/approve', authenticateAdmin, approveVendor);

// Delete vendor route (protected, admin only)
router.delete('/:id', authenticateAdmin, deleteVendor);


// === PUBLIC & GENERAL ROUTES ===

// Vendor login route (public)
router.post('/login', loginVendor);

// Vendor logout route
router.post('/logout', logoutVendor);

export default router; 