import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register the first admin (super-admin)
// @route   POST /api/admin/register/first
// @access  Public
export const registerFirstAdmin = async (req, res) => {
  try {
    // Check if any admin exists
    const adminExists = await Admin.findOne();
    if (adminExists) {
      return res.status(403).json({
        success: false,
        message: 'First admin already exists. Please use the regular registration route.'
      });
    }

    const { name, email, password } = req.body;

    // Create first admin as super-admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: 'super-admin' // Set role as super-admin for first registration
    });

    if (admin) {
      res.status(201).json({
        success: true,
        message: 'Super admin registered successfully',
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering super admin',
      error: error.message
    });
  }
};

// @desc    Register a new admin
// @route   POST /api/admin/register
// @access  Private (Only super-admin can register new admins)
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password
    });

    if (admin) {
      res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering admin',
      error: error.message
    });
  }
};

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin profile',
      error: error.message
    });
  }
}; 