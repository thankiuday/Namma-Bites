import axios from 'axios';

const vendorApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/vendor',
  withCredentials: true, // Use cookies for authentication
});

export default vendorApi;

export const createSubscriptionPlan = (data) => vendorApi.post('/subscription-plans', data);
export const getSubscriptionPlans = () => vendorApi.get('/subscription-plans');
export const getSubscriptionPlanById = (id) => vendorApi.get(`/subscription-plans/${id}`);
export const updateSubscriptionPlan = (id, data) => vendorApi.put(`/subscription-plans/${id}`, data);
export const deleteSubscriptionPlan = (id) => vendorApi.delete(`/subscription-plans/${id}`); 