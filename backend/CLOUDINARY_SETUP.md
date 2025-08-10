# Cloudinary Integration Setup

This project now uses Cloudinary for structured image uploads and management.

## Environment Variables Required

Add these to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## How to Get Cloudinary Credentials

1. **Sign up for a free Cloudinary account**: https://cloudinary.com/users/register/free
2. **Go to your Dashboard**: https://cloudinary.com/console
3. **Copy the credentials**:
   - **Cloud Name**: Found in your dashboard URL and account details
   - **API Key**: Available in the "Account Details" section
   - **API Secret**: Click the "API Secret" eye icon to reveal it

## Folder Structure on Cloudinary

The system automatically organizes uploads into structured folders:

```
namma-bites/
├── vendors/
│   ├── images/          # Vendor profile pictures
│   └── scanners/        # QR scanner images
├── menu-items/          # Food item images
└── payment-proofs/      # Payment proof uploads
```

## Image Transformations

All images are automatically optimized with:
- **Quality**: Auto-optimized for web
- **Format**: Auto-converted to best format (WebP when supported)
- **Size Limits**: 
  - Vendor images: 800x600px max
  - Menu items: 600x450px max  
  - Payment proofs: 1000x1000px max
  - Scanner images: 400x400px max

## File Size Limits

- **Vendor images**: 5MB maximum
- **Menu item images**: 10MB maximum
- **Payment proofs**: 10MB maximum
- **Scanner images**: 3MB maximum

## Supported Formats

- JPG/JPEG
- PNG
- GIF
- WebP

## Migration from Local Storage

The old local upload system has been completely replaced. All new uploads will go directly to Cloudinary with:

1. **Automatic optimization**
2. **CDN delivery**
3. **Structured organization**
4. **Secure URLs**
5. **Automatic cleanup of old images when updated**

## Features

- ✅ **Structured uploads**: Images organized by type and user
- ✅ **Automatic optimization**: Quality and format optimization
- ✅ **CDN delivery**: Fast global image delivery
- ✅ **Old image cleanup**: Automatically deletes old images when updating
- ✅ **Secure URLs**: All images served over HTTPS
- ✅ **Error handling**: Graceful fallbacks for upload failures

## Testing

To test the integration:

1. Set up your `.env` with Cloudinary credentials
2. Restart your server
3. Try uploading:
   - Vendor profile image
   - Menu item image
   - Payment proof
   - Scanner QR image

All uploads should now appear in your Cloudinary Media Library with proper folder organization.
