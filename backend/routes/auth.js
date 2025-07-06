import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { storeRefreshToken, deleteRefreshToken } from '../utils/redis.js';

const router = express.Router();

// Validation middleware
const validateSignup = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('name').notEmpty().withMessage('Name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('mobileNumber').matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit mobile number'),
  body('role').isIn(['student', 'faculty', 'guest']).withMessage('Invalid role')
];

// Signup route
router.post('/signup', validateSignup, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, name, password, mobileNumber, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      name,
      password,
      mobileNumber,
      role
    });

    await user.save();

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Store refresh token in Redis
    await storeRefreshToken(user._id.toString(), refreshToken, 7 * 24 * 60 * 60); // 7 days

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: false, // Temporarily set to false for debugging
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: false, // Allow JavaScript access for token refresh
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      accessToken,
      refreshToken,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, rememberMe } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: rememberMe ? '30d' : '7d' }
    );

    // Store refresh token in Redis
    await storeRefreshToken(
      user._id.toString(), 
      refreshToken, 
      rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60
    );

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: false, // Temporarily set to false for debugging
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: false, // Allow JavaScript access for token refresh
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000 // 7 or 30 days
    });

    res.json({
      accessToken,
      refreshToken,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Refresh token route
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Store new refresh token in Redis
    await storeRefreshToken(user._id.toString(), newRefreshToken, 7 * 24 * 60 * 60);

    // Set new tokens as cookies
    res.cookie('accessToken', newAccessToken, {
      httpOnly: false, // Temporarily set to false for debugging
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
    });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: false, // Allow JavaScript access for token refresh
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
    });

    res.json({ 
      accessToken: newAccessToken,
      refreshToken: newRefreshToken 
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout route
router.post('/logout', auth, async (req, res) => {
  try {
    await deleteRefreshToken(req.user._id.toString());
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user.getPublicProfile());
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile route
router.put('/update-profile', auth, [
  body('username').optional().trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('name').optional().notEmpty().withMessage('Name is required'),
  body('mobileNumber').optional().matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit mobile number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, name, mobileNumber } = req.body;
    const user = req.user;

    // Check if username or email is already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already taken' });
      }
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (name) user.name = name;
    if (mobileNumber) user.mobileNumber = mobileNumber;

    await user.save();

    res.json(user.getPublicProfile());
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password route
router.put('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 