import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
// Import RedisStore only when needed (dynamic import below)
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { initEventBus, shutdownEventBus } from './utils/events.js';
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
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Structured request logging (disabled noisy logs in dev if desired)
app.use(pinoHttp({
  redact: ['req.headers.authorization', 'req.headers.cookie'],
  transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty', options: { translateTime: 'SYS:standard' } } : undefined
}));

// Serve uploads directory (must be before React catch-all)
const uploadsDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsDir));

// Helper to derive a stable client IP even behind multiple proxies
const getClientIp = (req) => {
  const xff = req.headers['x-forwarded-for'];
  if (xff) {
    const forwarded = Array.isArray(xff) ? xff[0] : xff.split(',')[0];
    if (forwarded) return forwarded.trim();
  }
  return req.ip;
};

// Apply rate limiting only when explicitly usable
const useRedisRateLimit = Boolean(process.env.REDIS_URL) && process.env.DISABLE_RATE_LIMIT !== '1';
if (useRedisRateLimit && process.env.NODE_ENV === 'production') {
  // Dynamically import RedisStore only when used; tolerate absence
  let RedisStoreMod;
  try {
    RedisStoreMod = await import('rate-limit-redis');
  } catch (e) {
    console.warn('rate-limit-redis module not found; skipping Redis-backed rate limiting.');
  }
  const RedisStore = RedisStoreMod?.RedisStore;
  if (RedisStore) {
    const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call?.(...args)
    }),
    message: 'Too many requests. Please try again later.',
    keyGenerator: (req) => getClientIp(req),
    });

    const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call?.(...args)
    }),
    message: 'Too many login attempts, please try again after 15 minutes',
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
      const ip = getClientIp(req);
      const email = (req.body && req.body.email) ? String(req.body.email).toLowerCase() : '';
      return email ? `${ip}:${email}` : ip;
    },
    });

    app.use('/api/admin/login', loginLimiter);
    app.use('/api/', generalLimiter);
  }
}

// Add a route to reset rate limits (for development only, requires Redis)
if (process.env.NODE_ENV === 'development' && process.env.REDIS_URL) {
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
  next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/namma_bites')
  .then(() => {console.log(" Connected to MongoDB ")})
  .catch(err => console.error('MongoDB connection error:', err));

// Redis connection is handled by import

// Create vendorPicture directory if it doesn't exist
const vendorPictureDir = path.join(__dirname, '../frontend/vendorPicture');
if (!fs.existsSync(vendorPictureDir)) {
    fs.mkdirSync(vendorPictureDir, { recursive: true });
}

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendor', vendorRoutes);
// Basic health endpoints
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/ready', async (req, res) => {
  try {
    // naive readiness: ensure Redis and Mongo are alive enough
    await redisClient.ping?.();
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'ready' });
  } catch (e) {
    res.status(503).json({ status: 'not-ready' });
  }
});
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Server test route works' });
});

// Global catch-all for debugging
app.use((req, res, next) => {
  next();
});

// Serve vendor pictures (static assets checked into repo)
app.use('/vendorPicture', express.static(path.join(__dirname, '../frontend/vendorPicture')));

// Frontend static serving (only if a build exists)
const clientDistPath = path.resolve(__dirname, '../frontend/dist');
const clientIndexHtmlPath = path.join(clientDistPath, 'index.html');

if (fs.existsSync(clientIndexHtmlPath)) {
  // Serve built frontend
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(clientIndexHtmlPath);
  });
} else {
  // No frontend build present (e.g., deploying API-only on Render)
  console.warn('Frontend build not found at:', clientIndexHtmlPath, '\nSkipping static frontend serving.');
  // Provide a simple root response for health checks
  app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'namma-bites-backend', frontend: 'not-served' });
  });
}

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
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET must be set in production');
  process.exit(1);
}

const server = app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try { await initEventBus(); } catch (e) { console.error('Event bus init failed', e); }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  try { await shutdownEventBus(); } catch (_) {}
  server.close(() => process.exit(0));
});