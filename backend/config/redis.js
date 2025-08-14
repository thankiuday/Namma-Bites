import Redis from 'ioredis';

const createStub = () => ({
  publish: async () => {},
  duplicate: () => ({ psubscribe: async () => {}, on: () => {}, quit: async () => {} }),
  ping: async () => {}
});

let client;
if (!process.env.REDIS_URL) {
  console.warn('REDIS_URL not set; using in-memory SSE broadcast (no Redis).');
  client = createStub();
} else {
  try {
    client = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
      retryStrategy: (times) => Math.min(times * 200, 2000),
    });
    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    client.on('connect', () => {
      console.log('Successfully connected to Redis');
    });
    client.connect?.().catch(() => {
      console.warn('Redis connect failed; will retry in background.');
    });
  } catch (e) {
    console.warn('Redis initialization failed; using stub client.');
    client = createStub();
  }
}

export default client;