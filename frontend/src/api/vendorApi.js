import axios from 'axios';

const vendorApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/vendors',
  withCredentials: true, // Use cookies for authentication
});

export default vendorApi; 