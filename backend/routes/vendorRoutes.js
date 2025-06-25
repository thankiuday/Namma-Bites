console.log('vendorRoutes.js loaded at', new Date().toISOString());
console.log('Vendor routes loaded');
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
  rateMenuItem
} from '../controllers/vendor/vendorController.js';
import { authenticateAdmin, authenticateVendor, authenticateUser } from '../middleware/user/authMiddleware.js';

const router = express.Router();
console.log('vendorRoutes.js router instance created at', new Date().toISOString());
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
        cb(null, vendorImagesDir);
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
        fileSize: 2 * 1024 * 1024 // 2MB max file size
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
router.put('/me', authenticateVendor, uploadVendorImage.single('logo'), updateCurrentVendorProfile);

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


// === ADMIN-ONLY ROUTES ===

// Get all vendors (protected, admin only)
router.get('/', authenticateAdmin, getAllVendors);

// Get vendor by ID (protected, admin only)
router.get('/:id', authenticateAdmin, getVendorById);

// Create vendor route (protected, admin only)
router.post('/create', authenticateAdmin, uploadVendorImage.single('image'), createVendor);

// Update vendor route (protected, admin only)
router.put('/:id', authenticateAdmin, updateVendor);

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