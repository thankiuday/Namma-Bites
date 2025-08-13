import axios from 'axios';

// Use environment variable for API URL or fallback to default
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Global network activity tracker for UX overlays
let activeRequests = 0;
const subscribers = new Set();

const notifyNetworkSubscribers = () => {
  subscribers.forEach((fn) => {
    try { fn(activeRequests); } catch (_) {}
  });
};

export const networkActivity = {
  subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },
  getActiveCount() {
    return activeRequests;
  }
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Ensure multipart requests are not forced to JSON
    if (config.data instanceof FormData) {
      if (config.headers && config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    }
    // Track network activity for non-GET requests
    const method = (config.method || 'get').toLowerCase();
    if (method !== 'get') {
      activeRequests += 1;
      notifyNetworkSubscribers();
    }
    // Vendor self endpoints (always use vendor token)
    if (config.url === '/vendor/self' || config.url === '/vendor/me') {
      const vendorToken = localStorage.getItem('vendorToken');
      if (vendorToken) {
        config.headers.Authorization = vendorToken.startsWith('Bearer ')
          ? vendorToken
          : `Bearer ${vendorToken}`;
      }
      return config;
    }
    // Admin endpoints and admin-only user/vendor endpoints
    if (
      config.url.startsWith('/admin') ||
      config.url.startsWith('/users') ||
      (config.url.startsWith('/vendor') && config.url !== '/vendor/self' && config.url !== '/vendor/me')
    ) {
      // Do not set Authorization header for admin/user endpoints; rely on cookies
      return config;
    }
    // Vendor endpoints for vendor dashboard (if not admin)
    if (config.url.startsWith('/vendor')) {
      const vendorToken = localStorage.getItem('vendorToken');
      if (vendorToken) {
        config.headers.Authorization = vendorToken.startsWith('Bearer ')
          ? vendorToken
          : `Bearer ${vendorToken}`;
      }
      return config;
    }
    return config;
  },
  (error) => {
    // Decrement on request setup error
    try {
      const method = (error.config?.method || 'get').toLowerCase();
      if (method !== 'get') {
        activeRequests = Math.max(0, activeRequests - 1);
        notifyNetworkSubscribers();
      }
    } catch (_) {}
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Decrement on success for non-GET
    try {
      const method = (response.config?.method || 'get').toLowerCase();
      if (method !== 'get') {
        activeRequests = Math.max(0, activeRequests - 1);
        notifyNetworkSubscribers();
      }
    } catch (_) {}
    return response;
  },
  async (error) => {
    // Decrement on error for non-GET
    try {
      const method = (error.config?.method || 'get').toLowerCase();
      if (method !== 'get') {
        activeRequests = Math.max(0, activeRequests - 1);
        notifyNetworkSubscribers();
      }
    } catch (_) {}
    const originalRequest = error.config;
    const url = originalRequest.url;

    // Handle unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Get current path
      const currentPath = window.location.pathname;

    // Admin endpoints or currently on admin route
    if (url.startsWith('/admin') || currentPath.startsWith('/admin')) {
      // Clear any persisted admin token and let the route guard redirect
      localStorage.removeItem('adminToken');
      return Promise.reject(error);
    }

      // Vendor endpoints or currently on vendor route
      if (url.startsWith('/vendor') || currentPath.startsWith('/vendor')) {
        // Clear any persisted vendor token
        localStorage.removeItem('vendorToken');
        // Do NOT hard-redirect here to avoid post-login bounce due to early 401s
        // Let route guards/context handle redirects as needed
        return Promise.reject(error);
      }

      // User endpoints (default)
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 15;
      const message = `Too many requests. Please try again after ${retryAfter} minutes.`;
      return Promise.reject({ message });
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({ message: errorMessage });
  }
);

// Admin API endpoints
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  register: (adminData) => api.post('/admin/register/first', adminData),
  getProfile: () => api.get('/admin/profile'),
  resetRateLimit: () => {
    if (process.env.NODE_ENV === 'development') {
      return api.post('/reset-rate-limit');
    }
    return Promise.reject(new Error('Rate limit reset is only available in development mode'));
  }
};

export default api; 