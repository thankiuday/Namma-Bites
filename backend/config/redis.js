import Redis from 'ioredis';

// Use REDIS_URL from environment (Render/Upstash), fallback to localhost if needed
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redisClient = new Redis(redisUrl);

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Successfully connected to Redis');
});

export default redisClient; 