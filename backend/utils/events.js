import redisClient from '../config/redis.js';

// Maintain active SSE connections per audience
const vendorClients = new Map(); // vendorId -> Set(res)
const userClients = new Map(); // userId -> Set(res)

// Dedicated subscriber for Pub/Sub to support multi-instance
let subscriber;
let heartbeatInterval;

const writeSse = (res, dataObj) => {
  try {
    res.write(`data: ${JSON.stringify(dataObj)}\n\n`);
  } catch (_) {
    // ignore broken pipe
  }
};

const addClient = (map, id, res) => {
  if (!map.has(id)) map.set(id, new Set());
  map.get(id).add(res);
};

const removeClient = (map, id, res) => {
  const set = map.get(id);
  if (set) {
    set.delete(res);
    if (set.size === 0) map.delete(id);
  }
};

const broadcastToMap = (map, id, payload) => {
  const set = map.get(id);
  if (!set) return;
  for (const res of set) {
    writeSse(res, payload);
  }
};

export const initEventBus = async () => {
  if (subscriber) return; // already initialized
  subscriber = redisClient.duplicate();
  // ioredis auto-connects; pattern subscribe and route messages via pmessage
  await subscriber.psubscribe('vendor:*');
  await subscriber.psubscribe('user:*');
  subscriber.on('pmessage', (_pattern, channel, message) => {
    try {
      const payload = JSON.parse(message);
      if (channel.startsWith('vendor:')) {
        const vendorId = channel.split(':')[1];
        broadcastToMap(vendorClients, vendorId, payload);
      } else if (channel.startsWith('user:')) {
        const userId = channel.split(':')[1];
        broadcastToMap(userClients, userId, payload);
      }
    } catch (_) {}
  });

  // Heartbeat to keep proxies from closing idle connections
  heartbeatInterval = setInterval(() => {
    const ping = { type: 'ping', ts: Date.now() };
    for (const [, set] of vendorClients) {
      for (const res of set) writeSse(res, ping);
    }
    for (const [, set] of userClients) {
      for (const res of set) writeSse(res, ping);
    }
  }, 25000);
};

export const shutdownEventBus = async () => {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  try { await subscriber?.quit?.(); } catch (_) {}
};

export const publishToVendor = async (vendorId, payload) => {
  try {
    await redisClient.publish(`vendor:${vendorId}`, JSON.stringify(payload));
  } catch (_) {}
};

export const publishToUser = async (userId, payload) => {
  try {
    await redisClient.publish(`user:${userId}`, JSON.stringify(payload));
  } catch (_) {}
};

export const vendorSseHandler = async (req, res) => {
  // Vendor must be authenticated
  const vendorId = String(req.vendor._id);
  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  addClient(vendorClients, vendorId, res);
  // advise client reconnection delay
  try { res.write('retry: 10000\n'); } catch (_) {}
  writeSse(res, { type: 'connected', audience: 'vendor', vendorId });

  req.on('close', () => {
    removeClient(vendorClients, vendorId, res);
  });
};

export const userSseHandler = async (req, res) => {
  const userId = String(req.user._id);
  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  addClient(userClients, userId, res);
  try { res.write('retry: 10000\n'); } catch (_) {}
  writeSse(res, { type: 'connected', audience: 'user', userId });

  req.on('close', () => {
    removeClient(userClients, userId, res);
  });
};


