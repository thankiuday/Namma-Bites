import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify configuration is loaded
if (!cloudinary.config().cloud_name || !cloudinary.config().api_key || !cloudinary.config().api_secret) {
  console.error('⚠️ Cloudinary configuration incomplete. Please check your environment variables.');
}

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp|WEBP)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Create memory storage for temporary file handling
const memoryStorage = multer.memoryStorage();

// Create multer upload instances that store files in memory temporarily
export const uploadVendorImage = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

export const uploadVendorScanner = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024 // 3MB max file size
  }
});

export const uploadMenuItem = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

export const uploadPaymentProof = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// Cloudinary upload functions for different types
export const uploadToCloudinary = async (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'image',
      quality: 'auto',
      // Performance optimizations
      timeout: 60000, // 60 second timeout
      use_filename: false, // Don't preserve original filename for faster upload
      unique_filename: true, // Generate unique filename
      overwrite: false, // Don't overwrite existing files
      ...options
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(fileBuffer);
  });
};

// Specific upload functions for different image types
export const uploadVendorImageToCloudinary = async (fileBuffer, vendorId = null) => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const publicId = `vendor-${vendorId || 'temp'}-${timestamp}-${random}`;
  
  return uploadToCloudinary(fileBuffer, {
    folder: 'namma-bites/vendors/images',
    public_id: publicId,
    transformation: [
      { width: 800, height: 600, crop: 'limit', quality: 85 }
    ]
  });
};

export const uploadVendorScannerToCloudinary = async (fileBuffer, vendorId = null) => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const publicId = `scanner-${vendorId || 'temp'}-${timestamp}-${random}`;
  
  return uploadToCloudinary(fileBuffer, {
    folder: 'namma-bites/vendors/scanners',
    public_id: publicId,
    transformation: [
      { width: 400, height: 400, crop: 'limit', quality: 85 }
    ]
  });
};

export const uploadMenuItemToCloudinary = async (fileBuffer, vendorId = null, itemName = '') => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const safeName = itemName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 20); // Limit length
  const publicId = `menu-${vendorId || 'temp'}-${timestamp}-${random}`; // Shorter public ID
  
  return uploadToCloudinary(fileBuffer, {
    folder: 'namma-bites/menu-items',
    public_id: publicId,
    // Minimal transformation for faster upload
    transformation: [
      { width: 600, height: 450, crop: 'limit', quality: 85 }
    ],
    // Performance optimizations
    eager_async: true, // Generate transformations asynchronously
    timeout: 45000, // Reduced timeout
    chunk_size: 20000000 // 20MB chunks for faster streaming
  });
};

export const uploadPaymentProofToCloudinary = async (fileBuffer, userId = null, subscriptionId = null) => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const publicId = `payment-${userId || 'temp'}-${subscriptionId || 'temp'}-${timestamp}-${random}`;
  
  return uploadToCloudinary(fileBuffer, {
    folder: 'namma-bites/payment-proofs',
    public_id: publicId,
    transformation: [
      { width: 1000, height: 1000, crop: 'limit', quality: 85 }
    ]
  });
};

// Utility functions for Cloudinary operations
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

export const getImageUrl = (publicId, transformations = {}) => {
  if (!publicId) return null;
  
  return cloudinary.url(publicId, {
    ...transformations,
    secure: true
  });
};

// Helper function to extract public ID from Cloudinary URL
export const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl || typeof cloudinaryUrl !== 'string') return null;
  
  // Match Cloudinary URL pattern and extract public ID
  const match = cloudinaryUrl.match(/\/(?:v\d+\/)?(.+?)\.[^.]+$/);
  return match ? match[1] : null;
};

export default cloudinary;
