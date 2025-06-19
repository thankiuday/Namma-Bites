import axios from 'axios';
const vendorApi = axios.create({ baseURL: import.meta.env.VITE_API_URL + '/vendors' });
vendorApi.interceptors.request.use(config => {
  const token = localStorage.getItem('vendorToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default vendorApi; 