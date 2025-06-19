import Vendor from '../models/Vendor.js';
import jwt from 'jsonwebtoken';

// Create a new vendor
export const createVendor = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    if (!req.file) {
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
      image: req.file.path, // Store the file path
      createdBy: req.admin._id
    };

    console.log('Creating vendor with data:', vendorData);

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
    console.error('Error creating vendor:', error);
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
    console.log('Getting all vendors...');
    console.log('Admin from request:', req.admin);
    
    const vendors = await Vendor.find()
      .select('-password') // Exclude password from response
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    console.log('Found vendors:', vendors);

    res.status(200).json({
      success: true,
      data: vendors
    });
  } catch (error) {
    console.error('Error in getAllVendors:', error);
    console.error('Error stack:', error.stack);
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
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const isMatch = await vendor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    // Generate JWT
    const token = jwt.sign(
      { id: vendor._id, email: vendor.email, role: 'vendor' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    const vendorObj = vendor.toObject();
    delete vendorObj.password;
    res.cookie('vendorToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(200).json({
      success: true,
      message: 'Login successful',
      vendor: vendorObj
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update current vendor profile
export const updateCurrentVendorProfile = async (req, res) => {
  try {
    const vendor = req.vendor;
    if (!vendor) {
      return res.status(401).json({ success: false, message: 'Vendor not authenticated' });
    }
    if (req.body.name) vendor.name = req.body.name;
    if (req.file) vendor.logo = `/uploads/vendor-images/${req.file.filename}`;
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
    const vendor = req.vendor;
    const { oldPassword, newPassword } = req.body;
    if (!vendor) {
      return res.status(401).json({ success: false, message: 'Vendor not authenticated' });
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
  console.log('Cookies received:', req.cookies);
  try {
    if (!req.vendor) {
      return res.status(401).json({ success: false, message: 'Vendor not authenticated' });
    }
    const vendor = req.vendor.toObject();
    delete vendor.password;
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching vendor details', error: error.message });
  }
}; 