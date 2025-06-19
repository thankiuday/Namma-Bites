import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/auth.js';
import vendorRoutes from './routes/vendorRoutes.js';
import { fileURLToPath } from 'url';
import fs from 'fs';
dotenv.config();

import redisClient from './config/redis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

console.log('Server starting...');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  secure: false // for localhost development
}));
app.use(express.json());
app.use(cookieParser());

// Rate limiting with Redis
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (command, ...args) => redisClient.send_command(command, ...args),
  }),
  message: 'Too many requests from this IP, please try again after 15 minutes',
  skip: (req) => {
    // Skip rate limiting for development environment
    return process.env.NODE_ENV === 'development';
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (command, ...args) => redisClient.send_command(command, ...args),
  }),
  message: 'Too many login attempts, please try again after 15 minutes',
  skip: (req) => {
    // Skip rate limiting for development environment
    return process.env.NODE_ENV === 'development';
  }
});

// Apply rate limiters only in production
if (process.env.NODE_ENV === 'production') {
  app.use('/api/admin/login', loginLimiter);
  app.use('/api/', generalLimiter);
}

// Add a route to reset rate limits (for development only)
if (process.env.NODE_ENV === 'development') {
  app.post('/api/reset-rate-limit', async (req, res) => {
    try {
      const keys = await redisClient.keys('rl:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      res.json({ message: 'Rate limits reset successfully' });
    } catch (error) {
      console.error('Error resetting rate limits:', error);
      res.status(500).json({ message: 'Failed to reset rate limits' });
    }
  });
}

// Logging middleware
app.use((req, res, next) => {
  console.log('Request:', req.method, req.path);
  next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/namma_bites')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Redis connection is handled by import

// Create vendorPicture directory if it doesn't exist
const vendorPictureDir = path.join(__dirname, '../frontend/vendorPicture');
if (!fs.existsSync(vendorPictureDir)) {
    fs.mkdirSync(vendorPictureDir, { recursive: true });
}

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  console.log('Catch-all route hit:', req.path);
  res.sendFile(path.join(path.resolve(), '../frontend/dist', 'index.html'));
});


// Serve vendor pictures
app.use('/vendorPicture', express.static(path.join(__dirname, '../frontend/vendorPicture')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendors', vendorRoutes);

// Serve static files from the React frontend app
app.use(express.static(path.join(path.resolve(), '../frontend/dist')));


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
console.log('JWT_SECRET:', process.env.JWT_SECRET);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 