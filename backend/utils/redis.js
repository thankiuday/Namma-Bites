import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL);

const connectRedis = async () => {
  try {
    await redis.ping();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Redis connection error:', error);
    process.exit(1);
  }
};

const storeRefreshToken = async (userId, token, expiryInSeconds) => {
  try {
    await redis.set(`refresh_token:${userId}`, token, 'EX', expiryInSeconds);
  } catch (error) {
    console.error('Error storing refresh token:', error);
    throw error;
  }
};

const getRefreshToken = async (userId) => {
  try {
    return await redis.get(`refresh_token:${userId}`);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    throw error;
  }
};

const deleteRefreshToken = async (userId) => {
  try {
    await redis.del(`refresh_token:${userId}`);
  } catch (error) {
    console.error('Error deleting refresh token:', error);
    throw error;
  }
};

export { redis, connectRedis, storeRefreshToken, getRefreshToken, deleteRefreshToken }; 