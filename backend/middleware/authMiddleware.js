import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Vendor from '../models/Vendor.js';

export const authenticateAdmin = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.adminToken) {
      token = req.cookies.adminToken;
      console.log("cookies",req.cookies)
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied'
      });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found'
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

export const authenticateVendor = async (req, res, next) => {
  console.log('Cookies received:', req.cookies);
  try {
    let token;
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
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const vendor = await Vendor.findById(decoded.id).select('-password');
      if (!vendor) {
        return res.status(401).json({
          success: false,
          message: 'Vendor not found'
        });
      }
      req.vendor = vendor;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Vendor auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
}; 