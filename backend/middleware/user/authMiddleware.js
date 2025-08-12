import jwt from 'jsonwebtoken';
import Admin from '../../models/Admin.js';
import Vendor from '../../models/Vendor.js';
import User from '../../models/User.js';

export const authenticateAdmin = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied'
      });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found'
        });
      }

      // Check if admin is approved (except super-admin)
      if (admin.role !== 'super-admin' && !admin.isApproved) {
        return res.status(401).json({
          success: false,
          message: 'Your account is pending approval from the Super Admin.'
        });
      }

      req.admin = admin;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Check if admin is super admin (use after authenticateAdmin)
export const requireSuperAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.admin.role !== 'super-admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admin privileges required.'
    });
  }

  next();
};

export const authenticateVendor = async (req, res, next) => {
  try {
    let token;
    // Try to get token from Authorization header
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.vendorToken) {
      token = req.cookies.vendorToken;
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied'
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const vendorId = decoded.vendorId || decoded.id;
    if (!vendorId) {
      return res.status(401).json({ success: false, message: 'Token is missing vendor identifier' });
    }
    const vendor = await Vendor.findById(vendorId).select('-password');
    if (!vendor) {
      return res.status(401).json({ success: false, message: 'Vendor not found' });
    }
    req.vendor = vendor;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

export const authenticateUser = async (req, res, next) => {
  try {
    let token = req.cookies.accessToken;
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token, access denied' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  } catch (error) {
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
}; 