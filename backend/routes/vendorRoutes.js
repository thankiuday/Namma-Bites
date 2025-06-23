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
  updateCurrentVendorStatus
} from '../controllers/vendor/vendorController.js';
import { authenticateAdmin, authenticateVendor } from '../middleware/user/authMiddleware.js';

const router = express.Router();
console.log('vendorRoutes.js router instance created at', new Date().toISOString());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads/vendor-images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
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

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

// Debug ping route
router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'pong' });
});

// Get current vendor details (protected, vendor only)
router.get('/me', authenticateVendor, getSelfVendor);

// Get all vendors (protected, admin only)
router.get('/', authenticateAdmin, getAllVendors);

// Get vendor by ID (protected, admin only)
router.get('/:id', authenticateAdmin, getVendorById);

// Create vendor route (protected, admin only)
router.post('/create', authenticateAdmin, upload.single('image'), createVendor);

// Update vendor route (protected, admin only)
router.put('/:id', authenticateAdmin, updateVendor);

// Delete vendor route (protected, admin only)
router.delete('/:id', authenticateAdmin, deleteVendor);

// Vendor login route (public)
router.post('/login', loginVendor);

// Vendor logout route
router.post('/logout', logoutVendor);

// Update current vendor profile (protected, vendor only)
// router.put('/me', authenticateVendor, upload.single('logo'), updateCurrentVendorProfile);

// Change vendor password (protected, vendor only)
router.post('/change-password', authenticateVendor, changeVendorPassword);

// Update current vendor status (protected, vendor only)
router.put('/me/status', authenticateVendor, updateCurrentVendorStatus);

export default router; 