import axios from 'axios';
const userApi = axios.create({ baseURL: import.meta.env.VITE_API_URL + '/users', withCredentials: true });
// Remove token logic; cookies will be sent automatically
export default userApi;

// Subscription plan functions for users
export const getAllSubscriptionPlans = () => userApi.get('/subscription-plans');
export const getSubscriptionPlansByVendor = (vendorId) => userApi.get(`/subscription-plans/vendor/${vendorId}`);
export const getSubscriptionPlanById = (id) => userApi.get(`/subscription-plans/${id}`); 