import Admin from '../../models/Admin.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Admin Login
export const login = async (req, res) => {
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

    // Check if admin is approved (except super-admin)
    if (admin.role !== 'super-admin' && !admin.isApproved) {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending approval from the Super Admin. Please wait for approval.'
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set token as HTTP-only cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Admin Registration
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Check if this is the first admin registration
    const isFirstAdmin = await Admin.countDocuments() === 0;

    // Create new admin (password will be hashed by the model's pre-save middleware)
    const admin = new Admin({
      name,
      email,
      password, // Don't hash here - let the model handle it
      role: isFirstAdmin ? 'super-admin' : 'admin',
      isApproved: isFirstAdmin, // First admin (super-admin) is auto-approved
      approvedAt: isFirstAdmin ? new Date() : null
    });

    await admin.save();

    // Generate token
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      message: isFirstAdmin 
        ? 'Super Admin registered successfully' 
        : 'Admin registration submitted for approval. Please wait for Super Admin approval.',
      token: isFirstAdmin ? token : null, // Only provide token for approved admins
      admin: isFirstAdmin ? {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isApproved: admin.isApproved
      } : null
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message
    });
  }
};

// Get all pending admin approvals (Super Admin only)
export const getPendingAdmins = async (req, res) => {
  try {
    const pendingAdmins = await Admin.find({ 
      isApproved: false,
      role: 'admin' 
    }).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: pendingAdmins
    });
  } catch (error) {
    console.error('Get pending admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending admins',
      error: error.message
    });
  }
};

// Approve or reject admin (Super Admin only)
export const approveAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "reject".'
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (action === 'approve') {
      admin.isApproved = true;
      admin.approvedBy = req.admin.id;
      admin.approvedAt = new Date();
      await admin.save();

      res.status(200).json({
        success: true,
        message: 'Admin approved successfully',
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isApproved: admin.isApproved,
          approvedAt: admin.approvedAt
        }
      });
    } else {
      // Reject: Delete the admin record
      await Admin.findByIdAndDelete(adminId);
      
      res.status(200).json({
        success: true,
        message: 'Admin registration rejected and removed'
      });
    }
  } catch (error) {
    console.error('Approve admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing admin approval',
      error: error.message
    });
  }
};

// Get all admins (Super Admin only)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .select('-password')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admins',
      error: error.message
    });
  }
};

// Delete admin (Super Admin only)
export const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const currentAdmin = req.admin;

    // Find the admin to delete
    const adminToDelete = await Admin.findById(adminId);
    if (!adminToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent super admin from deleting themselves
    if (adminToDelete._id.toString() === currentAdmin._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Prevent deletion of other super admins (optional security measure)
    if (adminToDelete.role === 'super-admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete another Super Admin account'
      });
    }

    // Delete the admin
    await Admin.findByIdAndDelete(adminId);

    res.status(200).json({
      success: true,
      message: `Admin ${adminToDelete.name} has been deleted successfully`
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting admin',
      error: error.message
    });
  }
}; 