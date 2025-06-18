import axios from 'axios';

// Use environment variable for API URL or fallback to default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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
    // Check if this is an admin route
    const isAdminRoute = config.url.startsWith('/admin') || 
                        config.url.includes('/users') || 
                        config.url.includes('/vendors');
    const tokenKey = isAdminRoute ? 'adminToken' : 'accessToken';
    const token = localStorage.getItem(tokenKey);
    
    console.log(`Making ${isAdminRoute ? 'admin' : 'user'} request with token:`, token ? 'Token exists' : 'No token');
    
    if (token) {
      // Ensure token is properly formatted
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = formattedToken;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if this is an admin route
    const isAdminRoute = originalRequest.url.startsWith('/admin') || originalRequest.url.includes('/users');
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // For admin routes, redirect to admin login
      if (isAdminRoute) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
        return Promise.reject(error);
      }
      
      // For user routes, attempt token refresh
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('Attempting to refresh token...');
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        });

        if (response.data.success) {
          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          throw new Error(response.data.message || 'Failed to refresh token');
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    return Promise.reject(error.response?.data || error);
  }
);

// Admin API endpoints
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  register: (adminData) => api.post('/admin/register/first', adminData),
  getProfile: () => api.get('/admin/profile')
};

export default api; 