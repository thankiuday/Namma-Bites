import Redis from 'ioredis';

const redisClient = new Redis('rediss://default:AbvwAAIjcDEzNzRiMTg0ZjY3NTg0NDc2OWVmN2M2YzRiNGE0ODk3ZHAxMA@integral-pelican-48112.upstash.io:6379');

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Successfully connected to Redis');
});

export default redisClient; 