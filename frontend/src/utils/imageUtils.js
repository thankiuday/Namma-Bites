// Utility functions for handling image URLs consistently

/**
 * Gets the full image URL, handling both local and Cloudinary URLs
 * @param {string} imagePath - The image path/URL from the backend
 * @param {string} fallbackImage - Optional fallback image path
 * @returns {string} - Full image URL
 */
export const getImageUrl = (imagePath, fallbackImage = '/logo.png') => {
  // Return fallback if no image path provided
  if (!imagePath) {
    return fallbackImage;
  }

  // If it's already a full URL (Cloudinary or other CDN), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a local path (starts with /uploads), construct the full URL using SERVER origin (without /api)
  if (imagePath.startsWith('/uploads/')) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const serverBase = apiBase.replace(/\/?api\/?$/, '');
    return `${serverBase}${imagePath}`;
  }

  // If it's a relative path, treat it as local
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // Default case - return the fallback
  return fallbackImage;
};

/**
 * Gets a vendor image URL with proper fallback
 * @param {string} imagePath - The vendor image path
 * @returns {string} - Full image URL
 */
export const getVendorImageUrl = (imagePath) => {
  return getImageUrl(imagePath, '/logo.png');
};

/**
 * Gets a menu item image URL with proper fallback
 * @param {string} imagePath - The menu item image path
 * @returns {string} - Full image URL
 */
export const getMenuItemImageUrl = (imagePath) => {
  return getImageUrl(imagePath, '/logo.png');
};

/**
 * Gets a payment proof image URL
 * @param {string} imagePath - The payment proof image path
 * @returns {string} - Full image URL
 */
export const getPaymentProofImageUrl = (imagePath) => {
  return getImageUrl(imagePath);
};

/**
 * Optimizes Cloudinary URLs with transformations
 * @param {string} imageUrl - The original image URL
 * @param {object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export const optimizeCloudinaryImage = (imageUrl, options = {}) => {
  // Only apply transformations to Cloudinary URLs
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit'
  } = options;

  try {
    // Parse the Cloudinary URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    
    // Find the upload part and insert transformations
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex !== -1) {
      const transformations = [];
      
      if (width || height) {
        const sizeTransform = [];
        if (width) sizeTransform.push(`w_${width}`);
        if (height) sizeTransform.push(`h_${height}`);
        if (crop) sizeTransform.push(`c_${crop}`);
        transformations.push(sizeTransform.join(','));
      }
      
      if (quality) transformations.push(`q_${quality}`);
      if (format) transformations.push(`f_${format}`);
      
      if (transformations.length > 0) {
        pathParts.splice(uploadIndex + 1, 0, transformations.join(','));
        url.pathname = pathParts.join('/');
      }
    }
    
    return url.toString();
  } catch (error) {
    console.warn('Error optimizing Cloudinary URL:', error);
    return imageUrl;
  }
};

/**
 * Creates a responsive image set for different screen sizes
 * @param {string} imageUrl - The original image URL
 * @returns {object} - Object with different sized URLs
 */
export const createResponsiveImageSet = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return {
      thumbnail: imageUrl,
      small: imageUrl,
      medium: imageUrl,
      large: imageUrl,
      original: imageUrl
    };
  }

  return {
    thumbnail: optimizeCloudinaryImage(imageUrl, { width: 150, height: 150, crop: 'fill' }),
    small: optimizeCloudinaryImage(imageUrl, { width: 300, height: 225 }),
    medium: optimizeCloudinaryImage(imageUrl, { width: 600, height: 450 }),
    large: optimizeCloudinaryImage(imageUrl, { width: 1200, height: 900 }),
    original: imageUrl
  };
};

export default {
  getImageUrl,
  getVendorImageUrl,
  getMenuItemImageUrl,
  getPaymentProofImageUrl,
  optimizeCloudinaryImage,
  createResponsiveImageSet
};
