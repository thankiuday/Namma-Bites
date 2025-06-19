import axios from 'axios';
const userApi = axios.create({ baseURL: import.meta.env.VITE_API_URL + '/users' });
userApi.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default userApi; 