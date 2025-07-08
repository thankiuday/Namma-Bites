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
export const getPendingUserSubscriptions = () => vendorApi.get('/user-subscriptions/pending');
export const approveUserSubscription = (subscriptionId, action) => vendorApi.post(`/user-subscriptions/${subscriptionId}/approve`, { action });
export const getApprovedUserSubscriptions = () => vendorApi.get('/user-subscriptions/approved'); 