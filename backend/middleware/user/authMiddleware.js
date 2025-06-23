import jwt from 'jsonwebtoken';
import Admin from '../../models/Admin.js';
import Vendor from '../../models/Vendor.js';
import User from '../../models/User.js';

console.log('authenticateVendor middleware loaded');

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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
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
  console.log('Raw cookie header:', req.headers.cookie);
  console.log('Cookies received:', req.cookies);
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
    res.status(500).json({ success: false, message: 'Authentication failed', error: error.message });
  }
};

export const authenticateUser = async (req, res, next) => {
  console.log('authenticateUser called for', req.method, req.originalUrl);
  try {
    let token = req.cookies.accessToken;
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    if (!token) {
      console.log('No token found');
      return res.status(401).json({ success: false, message: 'No authentication token, access denied' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      console.log('Decoded JWT:', decoded);
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        console.log('User not found for id:', decoded.userId);
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      req.user = user;
      next();
    } catch (jwtError) {
      console.log('JWT verification error:', jwtError);
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  } catch (error) {
    console.log('Auth middleware error:', error);
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
}; 