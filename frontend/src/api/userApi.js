import axios from 'axios';
const userApi = axios.create({ baseURL: import.meta.env.VITE_API_URL + '/users', withCredentials: true });
// Remove token logic; cookies will be sent automatically
export default userApi; 