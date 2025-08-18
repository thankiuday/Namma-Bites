import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Add request interceptor to check token before making requests
apiClient.interceptors.request.use(
  async (config) => {
    // Skip token check for auth endpoints
    if (config.url?.includes('/auth/')) {
      return config;
    }

    // Check if we have a user and if token might be expired
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      // If we have a user, the token should be valid (handled by refresh mechanism)
      return config;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors and refresh tokens
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
            { refreshToken },
            { withCredentials: true }
          );

          if (response.data.accessToken) {
            // Token refreshed successfully, retry the original request
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear invalid tokens
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('user');
        
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient; 