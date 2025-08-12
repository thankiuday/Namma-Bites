import api from './config';

// Use shared axios instance to inherit interceptors and consistent headers
const adminApi = {
  get: (url, config) => api.get(`/admin${url}`, config),
  post: (url, data, config) => api.post(`/admin${url}`, data, config),
  put: (url, data, config) => api.put(`/admin${url}`, data, config),
  delete: (url, config) => api.delete(`/admin${url}`, config),
};

export default adminApi;