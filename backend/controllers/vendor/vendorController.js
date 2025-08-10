import Vendor from '../../models/Vendor.js';
import MenuItem from '../../models/MenuItem.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import SubscriptionPlan from '../../models/SubscriptionPlan.js';
import UserSubscription from '../../models/UserSubscription.js';
import { 
  uploadVendorImageToCloudinary, 
  uploadVendorScannerToCloudinary, 
  uploadMenuItemToCloudinary,
  deleteImage,
  extractPublicId 
} from '../../config/cloudinary.js';

// Create a new vendor
export const createVendor = async (req, res) => {
  try {
    if (!req.files?.image?.[0]) {
      return res.status(400).json({
        success: false,
        message: 'Vendor image is required'
      });
    }

    // Validate password
    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 6 characters long'
      });
    }

    // Check if vendor with email already exists
    const existingVendor = await Vendor.findOne({ email: req.body.email });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'A vendor with this email already exists'
      });
    }

    // Upload vendor image to Cloudinary
    let imageUploadResult;
    try {
      imageUploadResult = await uploadVendorImageToCloudinary(
        req.files.image[0].buffer,
        req.body.name || 'vendor'
      );
    } catch (uploadError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to upload vendor image: ' + uploadError.message
      });
    }

    let scannerUrl = null;
    if (req.files?.scanner?.[0]) {
      try {
        // Upload scanner image to Cloudinary
        const scannerUploadResult = await uploadVendorScannerToCloudinary(
          req.files.scanner[0].buffer,
          req.body.name || 'vendor'
        );
        scannerUrl = scannerUploadResult.secure_url;
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: 'Failed to upload scanner image: ' + uploadError.message
        });
      }
    }

    const vendorData = {
      ...req.body,
      image: imageUploadResult.secure_url,
      scanner: scannerUrl,
      createdBy: req.admin._id
    };

    const vendor = new Vendor(vendorData);
    await vendor.save();

    // Remove password from response
    const vendorResponse = vendor.toObject();
    delete vendorResponse.password;

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: vendorResponse
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating vendor',
      error: error.errors ? Object.values(error.errors).map(err => err.message) : undefined
    });
  }
};

// Get all vendors
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .select('-password') // Exclude password from response
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: vendors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors',
      error: error.message
    });
  }
};

// Get vendor by ID
export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .select('-password') // Exclude password from response
      .populate('createdBy', 'name email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor',
      error: error.message
    });
  }
};

// Update vendor
export const updateVendor = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // If password is being updated, it will be hashed by the pre-save middleware
    if (updateData.password) {
      if (updateData.password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }
    }

    // Handle uploaded image and scanner files
    if (req.files?.image?.[0]) {
      updateData.image = `/uploads/vendor-images/${req.files.image[0].filename}`;
    }
    if (req.files?.scanner?.[0]) {
      updateData.scanner = `/uploads/vendor-scanner/${req.files.scanner[0].filename}`;
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { ...updateData, updatedBy: req.admin._id },
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password from response

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      data: vendor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating vendor',
      error: error.message
    });
  }
};

// Delete vendor
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting vendor',
      error: error.message
    });
  }
};

// Vendor login
export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide both email and password' 
      });
    }

    // Check if email is valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // Find vendor by email
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password. Please check your credentials and try again.' 
      });
    }

    // Check if vendor is approved
    if (!vendor.isApproved) {
      return res.status(401).json({ 
        success: false, 
        message: 'Your account is pending approval. Please contact the administrator.' 
      });
    }

    // Verify password
    const isMatch = await vendor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password. Please check your credentials and try again.' 
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { vendorId: vendor._id, email: vendor.email, role: 'vendor' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    const vendorObj = vendor.toObject();
    delete vendorObj.password;
    
    res.cookie('vendorToken', token, {
      httpOnly: true,
      secure: false, // for localhost development
      sameSite: 'Lax', // use Lax for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      vendor: vendorObj
    });
  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.' 
    });
  }
};

// Vendor logout
export const logoutVendor = (req, res) => {
  res.cookie('vendorToken', '', {
    httpOnly: true,
    secure: false, // for localhost development
    sameSite: 'Lax', // use Lax for localhost
    expires: new Date(0)
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// Update current vendor profile
export const updateCurrentVendorProfile = async (req, res) => {
  try {
    const vendor = req.vendor;
    if (!vendor) {
      return res.status(401).json({ success: false, message: 'Vendor not authenticated' });
    }
    
    // Update basic fields
    if (req.body.name) vendor.name = req.body.name;
    if (req.body.phone) vendor.phone = req.body.phone;
    if (req.body.address) vendor.address = req.body.address;
    if (req.body.cuisine) vendor.cuisine = req.body.cuisine;
    
    // Handle image upload
    if (req.file) {
      // Delete old image if it exists
      if (vendor.image) {
        const oldImagePublicId = extractPublicId(vendor.image);
        if (oldImagePublicId) {
          try {
            await deleteImage(oldImagePublicId);
          } catch (err) {
            console.log('Error deleting old vendor image:', err);
          }
        }
      }
      
      // Upload new image to Cloudinary
      const imageUploadResult = await uploadVendorImageToCloudinary(
        req.file.buffer,
        vendor._id
      );
      vendor.image = imageUploadResult.secure_url;
    }
    
    // Handle scanner upload (if provided)
    if (req.files && req.files.scanner && req.files.scanner[0]) {
      // Delete old scanner image if it exists
      if (vendor.scanner) {
        const oldScannerPublicId = extractPublicId(vendor.scanner);
        if (oldScannerPublicId) {
          try {
            await deleteImage(oldScannerPublicId);
          } catch (err) {
            console.log('Error deleting old scanner image:', err);
          }
        }
      }
      
      // Upload new scanner image to Cloudinary
      const scannerUploadResult = await uploadVendorScannerToCloudinary(
        req.files.scanner[0].buffer,
        vendor._id
      );
      vendor.scanner = scannerUploadResult.secure_url;
    }
    
    await vendor.save();
    const vendorObj = vendor.toObject();
    delete vendorObj.password;
    res.status(200).json({ success: true, message: 'Profile updated', data: vendorObj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
};

// Change vendor password
export const changeVendorPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // Check if vendor is authenticated
    if (!req.vendor || !req.vendor._id) {
      return res.status(401).json({ success: false, message: 'Vendor not authenticated' });
    }

    // Fetch the full vendor document to access the password hash
    const vendor = await Vendor.findById(req.vendor._id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Old and new password are required' });
    }
    const isMatch = await vendor.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Old password is incorrect' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    vendor.password = newPassword;
    await vendor.save();
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error changing password', error: error.message });
  }
};

// Get current vendor details (for vendor dashboard)
export const getSelfVendor = async (req, res) => {
  try {
    if (!req.vendor) {
      return res.status(401).json({ success: false, message: 'Vendor not authenticated' });
    }
    // Populate the 'createdBy' field and select only the 'name'
    const vendor = await Vendor.findById(req.vendor._id)
      .populate('createdBy', 'name')
      .select('-password');
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.status(200).json({ success: true, vendor: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching vendor details', error: error.message });
  }
};

// Update current vendor status
export const updateCurrentVendorStatus = async (req, res) => {
  try {
    const vendor = req.vendor;
    if (!vendor) {
      return res.status(401).json({ success: false, message: 'Vendor not authenticated' });
    }
    if (!req.body.status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    vendor.status = req.body.status;
    await vendor.save();
    const vendorObj = vendor.toObject();
    delete vendorObj.password;
    res.status(200).json({ success: true, message: 'Status updated', data: vendorObj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating status', error: error.message });
  }
};

// Add a new menu item
export const addMenuItem = async (req, res) => {
  try {
    console.log('=== ADD MENU ITEM REQUEST ===');
    console.log('Request body:', req.body);
    console.log('File info:', req.file ? { 
      originalname: req.file.originalname, 
      mimetype: req.file.mimetype, 
      size: req.file.size 
    } : 'No file');
    console.log('Vendor:', req.vendor ? { id: req.vendor._id, email: req.vendor.email } : 'No vendor');

    const { name, price, category, isAvailable, description, ingredients, allergens, preparationTime, calories, rating } = req.body;
    const vendor = req.vendor;

    // Validate vendor
    if (!vendor) {
      console.log('ERROR: No vendor found in request');
      return res.status(401).json({ success: false, message: 'Vendor not authenticated' });
    }

    // Validate file
    if (!req.file) {
      console.log('ERROR: No file uploaded');
      return res.status(400).json({ success: false, message: 'Item image is required' });
    }

    // Validate required fields
    if (!name || !price) {
      console.log('ERROR: Missing required fields');
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }

    console.log('Starting image upload to Cloudinary...');
    
    // Start image upload and database preparation in parallel
    const imageUploadPromise = uploadMenuItemToCloudinary(
      req.file.buffer,
      vendor._id,
      name
    );

    // Prepare menu item data while image uploads
    const menuItemData = {
      name,
      price: parseFloat(price),
      category: category || 'veg',
      isAvailable: isAvailable === 'true' || isAvailable === true,
      vendor: vendor._id,
      vendorEmail: vendor.email,
      description: description || '',
      ingredients: ingredients ? (Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim())) : [],
      allergens: allergens ? (Array.isArray(allergens) ? allergens : allergens.split(',').map(a => a.trim())) : [],
      preparationTime: preparationTime || '',
      calories: calories || '',
      rating: rating ? parseFloat(rating) : 0
    };

    console.log('Menu item data prepared:', menuItemData);

    // Wait for image upload to complete
    console.log('Waiting for image upload...');
    const imageUploadResult = await imageUploadPromise;
    console.log('Image upload completed:', imageUploadResult.secure_url);
    
    menuItemData.image = imageUploadResult.secure_url;

    // Create and save menu item
    console.log('Creating menu item...');
    const newItem = new MenuItem(menuItemData);
    await newItem.save();
    console.log('Menu item saved successfully:', newItem._id);

    // Return minimal response for faster response time
    res.status(201).json({ 
      success: true, 
      message: 'Menu item added successfully', 
      item: {
        _id: newItem._id,
        name: newItem.name,
        price: newItem.price,
        category: newItem.category,
        image: newItem.image,
        isAvailable: newItem.isAvailable
      }
    });
  } catch (error) {
    console.error('=== MENU ITEM CREATION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all menu items for the authenticated vendor
export const getMenuItemsByVendor = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const menuItems = await MenuItem.find({ vendor: vendorId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: menuItems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching menu items' });
  }
};

// Update a menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, isAvailable, description, ingredients, allergens, preparationTime, calories, rating } = req.body;
    const vendor = req.vendor;

    let item = await MenuItem.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    if (item.vendor.toString() !== vendor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this item' });
    }

    item.name = name || item.name;
    item.price = price || item.price;
    item.category = category || item.category;
    if (isAvailable !== undefined) {
      item.isAvailable = isAvailable;
    }
    if (description !== undefined) item.description = description;
    if (ingredients !== undefined) item.ingredients = Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim());
    if (allergens !== undefined) item.allergens = Array.isArray(allergens) ? allergens : allergens.split(',').map(a => a.trim());
    if (preparationTime !== undefined) item.preparationTime = preparationTime;
    if (calories !== undefined) item.calories = calories;
    if (rating !== undefined) item.rating = rating;

    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (item.image) {
        const oldImagePublicId = extractPublicId(item.image);
        if (oldImagePublicId) {
          try {
            await deleteImage(oldImagePublicId);
          } catch (err) {
            console.log('Error deleting old menu item image:', err);
          }
        }
      }
      
      // Upload new image to Cloudinary
      const imageUploadResult = await uploadMenuItemToCloudinary(
        req.file.buffer,
        vendor._id,
        item.name
      );
      item.image = imageUploadResult.secure_url;
    }

    await item.save();

    res.status(200).json({ success: true, message: 'Menu item updated successfully', item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete a menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.vendor._id;

    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    if (menuItem.vendor.toString() !== vendorId.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this item.' });
    }
    
    // Delete the image file
    if (menuItem.image) {
      const imagePath = path.join(path.resolve(), 'uploads/items-images', path.basename(menuItem.image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await menuItem.deleteOne(); // Use deleteOne on the document

    res.status(200).json({ success: true, message: 'Menu item deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting menu item.' });
  }
};

// Get all vendors for public display
export const getPublicVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ isApproved: true }) // Only show approved vendors
      .select('name image cuisine address') // Select only public-facing fields
      .sort({ name: 1 }); // Sort alphabetically by name

    res.status(200).json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors',
      error: error.message,
    });
  }
};

// Get all menu items (public)
export const getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({})
      .sort({ createdAt: -1 })
      .populate('vendor', 'name image'); // Populate vendor name and image
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching menu items', error: error.message });
  }
};

// Get all veg menu items (public)
export const getAllVegMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ category: 'veg' })
      .sort({ createdAt: -1 })
      .populate('vendor', 'name image');
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching veg menu items', error: error.message });
  }
};

// Get all non-veg menu items (public)
export const getAllNonVegMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ category: 'non-veg' })
      .sort({ createdAt: -1 })
      .populate('vendor', 'name image');
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching non-veg menu items', error: error.message });
  }
};

// Approve a vendor (admin only)
export const approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vendor approved successfully',
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving vendor',
      error: error.message,
    });
  }
};

// Get menu item by ID (public)
export const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('vendor', 'name email');
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.status(200).json({ success: true, data: menuItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching menu item', error: error.message });
  }
};

// Add a rating to a menu item
export const rateMenuItem = async (req, res) => {
  try {
    const { value } = req.body;
    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ success: false, message: 'Invalid rating value' });
    }
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    // Check if user already rated
    const existing = item.ratings.find(r => r.user.toString() === req.user._id.toString());
    if (existing) {
      // Update rating
      item.ratingsSum = item.ratingsSum - existing.value + Number(value);
      existing.value = Number(value);
    } else {
      // Add new rating
      item.ratings.push({ user: req.user._id, value: Number(value) });
      item.ratingsSum += Number(value);
      item.ratingsCount += 1;
    }
    item.rating = item.ratingsSum / (item.ratingsCount || 1);
    await item.save();
    res.json({ success: true, average: item.rating });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rating menu item', error: error.message });
  }
};

// Create a new subscription plan
export const createSubscriptionPlan = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.body.vendor;
    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'Vendor is required' });
    }
    const { duration, price, weekMeals, planType, mealTimings } = req.body;
    if (![7, 15, 30].includes(Number(duration))) {
      return res.status(400).json({ success: false, message: 'Invalid duration' });
    }
    if (!price || price <= 0) {
      return res.status(400).json({ success: false, message: 'Price is required and must be positive' });
    }
    if (!planType || !['veg', 'non-veg'].includes(planType)) {
      return res.status(400).json({ success: false, message: 'planType must be "veg" or "non-veg"' });
    }
    // Validate weekMeals structure
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    for (const day of days) {
      const meals = weekMeals?.[day];
      if (!meals || !meals.breakfast || !meals.lunch || !meals.dinner || !meals.snacks) {
        return res.status(400).json({ success: false, message: `All meals required for ${day}` });
      }
    }
    const plan = new SubscriptionPlan({
      vendor: vendorId,
      duration,
      price,
      weekMeals,
      planType,
      mealTimings
    });
    await plan.save();
    res.status(201).json({ success: true, message: 'Subscription plan created', data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all subscription plans for the current vendor
export const getMySubscriptionPlans = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const plans = await SubscriptionPlan.find({ vendor: vendorId }).populate({
      path: 'weekMeals.Monday.breakfast weekMeals.Monday.lunch weekMeals.Monday.dinner weekMeals.Monday.snacks weekMeals.Tuesday.breakfast weekMeals.Tuesday.lunch weekMeals.Tuesday.dinner weekMeals.Tuesday.snacks weekMeals.Wednesday.breakfast weekMeals.Wednesday.lunch weekMeals.Wednesday.dinner weekMeals.Wednesday.snacks weekMeals.Thursday.breakfast weekMeals.Thursday.lunch weekMeals.Thursday.dinner weekMeals.Thursday.snacks weekMeals.Friday.breakfast weekMeals.Friday.lunch weekMeals.Friday.dinner weekMeals.Friday.snacks weekMeals.Saturday.breakfast weekMeals.Saturday.lunch weekMeals.Saturday.dinner weekMeals.Saturday.snacks weekMeals.Sunday.breakfast weekMeals.Sunday.lunch weekMeals.Sunday.dinner weekMeals.Sunday.snacks',
      model: 'MenuItem'
    });
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single subscription plan by ID (vendor only)
export const getMySubscriptionPlanById = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const plan = await SubscriptionPlan.findOne({ _id: req.params.id, vendor: vendorId }).populate({
      path: 'weekMeals.Monday.breakfast weekMeals.Monday.lunch weekMeals.Monday.dinner weekMeals.Monday.snacks weekMeals.Tuesday.breakfast weekMeals.Tuesday.lunch weekMeals.Tuesday.dinner weekMeals.Tuesday.snacks weekMeals.Wednesday.breakfast weekMeals.Wednesday.lunch weekMeals.Wednesday.dinner weekMeals.Wednesday.snacks weekMeals.Thursday.breakfast weekMeals.Thursday.lunch weekMeals.Thursday.dinner weekMeals.Thursday.snacks weekMeals.Friday.breakfast weekMeals.Friday.lunch weekMeals.Friday.dinner weekMeals.Friday.snacks weekMeals.Saturday.breakfast weekMeals.Saturday.lunch weekMeals.Saturday.dinner weekMeals.Saturday.snacks weekMeals.Sunday.breakfast weekMeals.Sunday.lunch weekMeals.Sunday.dinner weekMeals.Sunday.snacks',
      model: 'MenuItem'
    });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a subscription plan (vendor only)
export const updateMySubscriptionPlan = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { duration, price, weekMeals, planType, mealTimings } = req.body;
    const plan = await SubscriptionPlan.findOne({ _id: req.params.id, vendor: vendorId });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    if (duration) plan.duration = duration;
    if (price) plan.price = price;
    if (weekMeals) plan.weekMeals = weekMeals;
    if (planType && ['veg', 'non-veg'].includes(planType)) plan.planType = planType;
    if (mealTimings) plan.mealTimings = { ...plan.mealTimings, ...mealTimings };
    await plan.save();
    res.json({ success: true, message: 'Plan updated', data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 

// Delete a subscription plan (vendor only)
export const deleteMySubscriptionPlan = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const planId = req.params.id;
    const plan = await SubscriptionPlan.findOne({ _id: planId, vendor: vendorId });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    // Prevent deletion if any ACTIVE user subscriptions reference this plan
    // Only check for approved and pending subscriptions, not cancelled, rejected, or expired ones
    const activeSubscriptionCount = await UserSubscription.countDocuments({ 
      subscriptionPlan: planId,
      paymentStatus: { $in: ['approved', 'pending'] }
    });
    
    if (activeSubscriptionCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete: ${activeSubscriptionCount} active subscription(s) still reference this plan` 
      });
    }

    await plan.deleteOne();
    return res.json({ success: true, message: 'Subscription plan deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all pending user subscriptions for this vendor
export const getPendingUserSubscriptions = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const pendingSubs = await UserSubscription.find({ vendor: vendorId, paymentStatus: 'pending' })
      .populate('user', 'name email')
      .populate('subscriptionPlan', 'duration price planType');
    res.json({ success: true, data: pendingSubs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve or reject a user subscription payment
export const approveUserSubscription = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { subscriptionId } = req.params;
    const { action } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    const sub = await UserSubscription.findOne({ _id: subscriptionId, vendor: vendorId });
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    sub.paymentStatus = action;
    // Set validated to true if approved, false if rejected
    if (action === 'approved') {
      sub.validated = true;
    } else if (action === 'rejected') {
      sub.validated = false;
    }
    await sub.save();
    res.json({ success: true, data: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 

// Get all approved user subscriptions for this vendor
export const getApprovedUserSubscriptions = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    let approvedSubs = await UserSubscription.find({ vendor: vendorId, paymentStatus: 'approved' })
      .populate('user', 'name email')
      .populate('subscriptionPlan', 'duration price planType');
    
    // Auto-expire subscriptions that have passed their end date
    const today = new Date();
    today.setHours(0,0,0,0);
    for (let sub of approvedSubs) {
      const endDate = new Date(sub.startDate);
      endDate.setDate(endDate.getDate() + sub.duration);
      endDate.setHours(0,0,0,0);
      if (endDate < today) {
        sub.paymentStatus = 'expired';
        await sub.save();
      }
    }
    
    // Re-fetch to get updated statuses (only approved ones now)
    approvedSubs = await UserSubscription.find({ vendor: vendorId, paymentStatus: 'approved' })
      .populate('user', 'name email')
      .populate('subscriptionPlan', 'duration price planType');
    
    res.json({ success: true, data: approvedSubs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 

// Get all rejected user subscriptions for this vendor
export const getRejectedUserSubscriptions = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const rejectedSubs = await UserSubscription.find({ vendor: vendorId, paymentStatus: 'rejected' })
      .populate('user', 'name email')
      .populate('subscriptionPlan', 'duration price planType');
    res.json({ success: true, data: rejectedSubs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 

// Scan and validate a QR code for a user subscription
export const scanSubscriptionQr = async (req, res) => {
  try {
    const { qrData } = req.body;
    if (!qrData) {
      return res.status(400).json({ success: false, message: 'QR data is required' });
    }

    // Decode JWT token
    let decoded;
    try {
      decoded = jwt.verify(qrData, process.env.JWT_SECRET || 'your_jwt_secret');
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired QR code' });
    }

    const { subscriptionId } = decoded;
    if (!subscriptionId) {
      return res.status(400).json({ success: false, message: 'Invalid QR code format' });
    }

    // Populate subscription with plan, vendor, and all meals
    const subscription = await UserSubscription.findById(subscriptionId)
      .populate('user', 'name email')
      .populate({
        path: 'subscriptionPlan',
        populate: [
          { path: 'weekMeals.Monday.breakfast', model: 'MenuItem' },
          { path: 'weekMeals.Monday.lunch', model: 'MenuItem' },
          { path: 'weekMeals.Monday.dinner', model: 'MenuItem' },
          { path: 'weekMeals.Monday.snacks', model: 'MenuItem' },
          { path: 'weekMeals.Tuesday.breakfast', model: 'MenuItem' },
          { path: 'weekMeals.Tuesday.lunch', model: 'MenuItem' },
          { path: 'weekMeals.Tuesday.dinner', model: 'MenuItem' },
          { path: 'weekMeals.Tuesday.snacks', model: 'MenuItem' },
          { path: 'weekMeals.Wednesday.breakfast', model: 'MenuItem' },
          { path: 'weekMeals.Wednesday.lunch', model: 'MenuItem' },
          { path: 'weekMeals.Wednesday.dinner', model: 'MenuItem' },
          { path: 'weekMeals.Wednesday.snacks', model: 'MenuItem' },
          { path: 'weekMeals.Thursday.breakfast', model: 'MenuItem' },
          { path: 'weekMeals.Thursday.lunch', model: 'MenuItem' },
          { path: 'weekMeals.Thursday.dinner', model: 'MenuItem' },
          { path: 'weekMeals.Thursday.snacks', model: 'MenuItem' },
          { path: 'weekMeals.Friday.breakfast', model: 'MenuItem' },
          { path: 'weekMeals.Friday.lunch', model: 'MenuItem' },
          { path: 'weekMeals.Friday.dinner', model: 'MenuItem' },
          { path: 'weekMeals.Friday.snacks', model: 'MenuItem' },
          { path: 'weekMeals.Saturday.breakfast', model: 'MenuItem' },
          { path: 'weekMeals.Saturday.lunch', model: 'MenuItem' },
          { path: 'weekMeals.Saturday.dinner', model: 'MenuItem' },
          { path: 'weekMeals.Saturday.snacks', model: 'MenuItem' },
          { path: 'weekMeals.Sunday.breakfast', model: 'MenuItem' },
          { path: 'weekMeals.Sunday.lunch', model: 'MenuItem' },
          { path: 'weekMeals.Sunday.dinner', model: 'MenuItem' },
          { path: 'weekMeals.Sunday.snacks', model: 'MenuItem' },
        ]
      })
      .populate('vendor', 'name email')
      .lean();

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // Validate vendor ownership
    if (subscription.vendor._id.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to scan this subscription' });
    }

    // Date validity
    const startDate = new Date(subscription.startDate);
    const duration = Number(subscription.duration);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration - 1);
    endDate.setHours(23, 59, 59, 999);
    const now = new Date();
    if (now < startDate || now > endDate) {
      return res.status(403).json({ success: false, message: 'Subscription not active for today' });
    }

    // Determine current meal slot by vendor-configured timings
    const plan = subscription.subscriptionPlan;
    const timings = plan?.mealTimings || {
      breakfast: '8:00–10:00 AM',
      lunch: '11:00 AM–3:00 PM',
      snacks: '4:00–6:00 PM',
      dinner: '7:00–10:00 PM'
    };

    const parseRange = (rangeStr) => {
      if (!rangeStr || typeof rangeStr !== 'string') return null;
      // Normalize separators: en dash, hyphen, or 'to'
      let normalized = rangeStr
        .replace(/\s*to\s*/gi, '–')
        .replace(/\s*-\s*/g, '–')
        .replace(/\s*–\s*/g, '–')
        .trim();
      const parts = normalized.split('–').map(s => s.trim());
      if (parts.length !== 2) return null;
      let [startStr, endStr] = parts;

      const timeRegex = /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i;
      const parse12 = (s) => {
        const m = s.match(timeRegex);
        if (!m) return null;
        return { h: parseInt(m[1], 10), min: parseInt(m[2] || '0', 10), ampm: (m[3] || '').toUpperCase() };
      };

      let s = parse12(startStr);
      let e = parse12(endStr);
      if (!s || !e) return null;
      // If only one has AM/PM, inherit to the other
      if (!s.ampm && e.ampm) s.ampm = e.ampm;
      if (!e.ampm && s.ampm) e.ampm = s.ampm;
      // If both missing AM/PM, make a best-effort guess
      if (!s.ampm && !e.ampm) {
        s.ampm = s.h >= 12 ? 'PM' : 'AM';
        e.ampm = e.h >= 12 ? 'PM' : 'AM';
      }

      const to24 = (h, min, ampm) => {
        let hour = h;
        if (ampm === 'PM' && hour !== 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        return { h: hour, min };
      };

      const s24 = to24(s.h, s.min, s.ampm);
      const e24 = to24(e.h, e.min, e.ampm);
      return { s: s24, e: e24 };
    };

    const within = (range) => {
      if (!range) return false;
      const nowH = now.getHours();
      const nowM = now.getMinutes();
      const startMinutes = range.s.h * 60 + range.s.min;
      const endMinutes = range.e.h * 60 + range.e.min;
      const nowMinutes = nowH * 60 + nowM;
      return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
    };

    const slots = [
      { key: 'breakfast', range: parseRange(timings.breakfast) },
      { key: 'lunch', range: parseRange(timings.lunch) },
      { key: 'snacks', range: parseRange(timings.snacks) },
      { key: 'dinner', range: parseRange(timings.dinner) },
    ];

    const currentSlot = slots.find(s => within(s.range))?.key;
    if (!currentSlot) {
      return res.status(403).json({ success: false, message: 'Scan not allowed outside meal timings' });
    }

    // Optional: ensure there is a planned meal today for this slot
    const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const todayName = weekdays[now.getDay()];
    if (!plan?.weekMeals?.[todayName]?.[currentSlot]) {
      return res.status(403).json({ success: false, message: `No ${currentSlot} planned for today` });
    }

    // Build subscription payload expected by frontend
    const todaysMeals = plan?.weekMeals?.[todayName] || null;
    const currentMeal = todaysMeals ? todaysMeals[currentSlot] || null : null;
    const subscriptionPayload = {
      user: subscription.user || null,
      plan: plan ? { planType: plan.planType, duration: plan.duration, price: plan.price } : null,
      startDate: subscription.startDate,
      duration: subscription.duration,
      paymentStatus: subscription.paymentStatus,
      paymentProof: subscription.paymentProof,
      validated: subscription.validated,
      todaysMeals,
      currentMeal,
      currentSlot,
    };

    // All good
    return res.json({ success: true, message: `Scan allowed for ${currentSlot}`, data: { currentSlot }, subscription: subscriptionPayload });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}; 

// Get all pre-bookings for a vendor for a given date and meal type
export const getMealPrebookings = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { date, mealType } = req.query;
    if (!date || !mealType) {
      return res.status(400).json({ success: false, message: 'Date and mealType are required' });
    }

    // Compute weekday name from date (Monday, Tuesday, ...)
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date' });
    }
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = weekdays[d.getUTCDay()];

    // Find all approved subscriptions for this vendor that have a booking on this date/meal
    const subs = await UserSubscription.find({
      vendor: vendorId,
      paymentStatus: 'approved',
      prebookings: { $elemMatch: { date, mealType, status: 'booked' } }
    })
      .populate('user', 'name email')
      .populate('subscriptionPlan');

    // For each subscription, find the menu item assigned in the plan for the given day/meal
    const results = [];
    for (const sub of subs) {
      let menuItemInfo = null;
      const plan = sub.subscriptionPlan;
      const planMeals = plan?.weekMeals?.[dayName];
      const menuItemId = planMeals?.[mealType];
      if (menuItemId) {
        try {
          const itemDoc = await MenuItem.findById(menuItemId).select('name image');
          if (itemDoc) {
            menuItemInfo = { _id: itemDoc._id, name: itemDoc.name, image: itemDoc.image };
          }
        } catch (_) {}
      }
      results.push({
        user: sub.user,
        subscriptionId: sub._id,
        menuItem: menuItemInfo
      });
    }

    res.set('Cache-Control', 'no-store');
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 