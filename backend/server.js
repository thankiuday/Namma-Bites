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

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rate limiting with Redis
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (command, ...args) => redisClient.send_command(command, ...args),
  }),
});
app.use('/api/', limiter);

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
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

// Serve vendor pictures
app.use('/vendorPicture', express.static(path.join(__dirname, '../frontend/vendorPicture')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendors', vendorRoutes);

// Serve static files from the React frontend app
app.use(express.static(path.join(path.resolve(), '../frontend/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(path.resolve(), '../frontend/dist', 'index.html'));
});

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 