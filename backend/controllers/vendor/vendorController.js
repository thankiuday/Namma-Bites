import Vendor from '../../models/Vendor.js';
import MenuItem from '../../models/MenuItem.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import SubscriptionPlan from '../../models/SubscriptionPlan.js';
import UserSubscription from '../../models/UserSubscription.js';

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

    const vendorData = {
      ...req.body,
      image: `/uploads/vendor-images/${req.files?.image?.[0]?.filename}`,
      scanner: req.files?.scanner?.[0] ? `/uploads/vendor-scanner/${req.files.scanner[0].filename}` : undefined,
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
      vendor.image = `/uploads/vendor-images/${req.file.filename}`;
    }
    
    // Handle scanner upload (if provided)
    if (req.files && req.files.scanner && req.files.scanner[0]) {
      vendor.scanner = `/uploads/vendor-scanner/${req.files.scanner[0].filename}`;
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
    const { name, price, category, isAvailable, description, ingredients, allergens, preparationTime, calories, rating } = req.body;
    const vendor = req.vendor;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Item image is required' });
    }

    const newItem = new MenuItem({
      name,
      price,
      category,
      isAvailable,
      image: `/uploads/items-images/${req.file.filename}`,
      vendor: vendor._id,
      vendorEmail: vendor.email,
      description: description || '',
      ingredients: ingredients ? (Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim())) : [],
      allergens: allergens ? (Array.isArray(allergens) ? allergens : allergens.split(',').map(a => a.trim())) : [],
      preparationTime: preparationTime || '',
      calories: calories || '',
      rating: rating || 0
    });

    await newItem.save();
    res.status(201).json({ success: true, message: 'Menu item added successfully', item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
      // Delete old image if it exists
      if (item.image) {
        const oldImageName = path.basename(item.image);
        const oldImagePath = path.resolve('uploads', 'items-images', oldImageName);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      item.image = `/uploads/items-images/${req.file.filename}`;
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
    const { duration, price, weekMeals, planType } = req.body;
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
      planType
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
    const { duration, price, weekMeals, planType } = req.body;
    const plan = await SubscriptionPlan.findOne({ _id: req.params.id, vendor: vendorId });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    if (duration) plan.duration = duration;
    if (price) plan.price = price;
    if (weekMeals) plan.weekMeals = weekMeals;
    if (planType && ['veg', 'non-veg'].includes(planType)) plan.planType = planType;
    await plan.save();
    res.json({ success: true, message: 'Plan updated', data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    const approvedSubs = await UserSubscription.find({ vendor: vendorId, paymentStatus: 'approved' })
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

    // Single optimized query with all necessary data
    const subscription = await UserSubscription.findById(subscriptionId)
      .populate('user', 'name email')
      .populate('subscriptionPlan', 'duration price planType')
      .populate('vendor', 'name email')
      .lean(); // Use lean() for better performance since we don't need to modify the document

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // Validate vendor ownership
    if (subscription.vendor._id.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to scan this subscription' });
    }

    // Optimized date calculations
    const startDate = new Date(subscription.startDate);
    if (isNaN(startDate.getTime())) {
      return res.status(500).json({ success: false, message: 'Invalid start date in subscription' });
    }

    const duration = Number(subscription.duration);
    if (!Number.isInteger(duration) || duration <= 0) {
      return res.status(500).json({ success: false, message: 'Invalid duration in subscription' });
    }

    // Calculate end date efficiently
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration - 1); // Subtract 1 since start date is inclusive
    endDate.setHours(23, 59, 59, 999); // Set to end of day

    // Check if expired
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isExpired = endDate < today;

    // Only update database if status needs to change
    if (isExpired && subscription.paymentStatus !== 'expired') {
      await UserSubscription.findByIdAndUpdate(subscriptionId, { paymentStatus: 'expired' });
      subscription.paymentStatus = 'expired';
    }

    // Return optimized response
    res.json({
      success: true,
      subscription: {
        id: subscription._id,
        user: subscription.user,
        plan: subscription.subscriptionPlan,
        vendor: subscription.vendor,
        startDate: subscription.startDate,
        duration: subscription.duration,
        paymentStatus: subscription.paymentStatus,
        validated: subscription.validated,
        paymentProof: subscription.paymentProof,
        expired: isExpired,
        endDate: endDate.toISOString(),
      }
    });
  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error scanning QR code. Please try again.' 
    });
  }
}; 