import axios from 'axios';

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/admin',
  withCredentials: true, // Use cookies for authentication
});

export default adminApi; 