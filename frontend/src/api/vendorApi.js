import api from './config';

// Wrapper around shared axios instance to ensure vendor endpoints
// always go through the interceptors (adds Authorization from vendorToken when present)
const vendorApi = {
  get: (url, config) => api.get(`/vendor${url}`, config),
  post: (url, data, config) => api.post(`/vendor${url}`, data, config),
  put: (url, data, config) => api.put(`/vendor${url}`, data, config),
  delete: (url, config) => api.delete(`/vendor${url}`, config),
};

export default vendorApi;

export const createSubscriptionPlan = (data) => vendorApi.post('/subscription-plans', data);
export const getSubscriptionPlans = () => vendorApi.get('/subscription-plans');
export const getSubscriptionPlanById = (id) => vendorApi.get(`/subscription-plans/${id}`);
export const updateSubscriptionPlan = (id, data) => vendorApi.put(`/subscription-plans/${id}`, data);
export const deleteSubscriptionPlan = (id) => vendorApi.delete(`/subscription-plans/${id}`);
export const getPendingUserSubscriptions = () => vendorApi.get('/user-subscriptions/pending');
export const approveUserSubscription = (subscriptionId, action) => vendorApi.post(`/user-subscriptions/${subscriptionId}/approve`, { action });
export const getApprovedUserSubscriptions = () => vendorApi.get('/user-subscriptions/approved');
export const acceptOrder = (orderId) => vendorApi.post(`/orders/${orderId}/accept`);
export const rejectOrder = (orderId) => vendorApi.post(`/orders/${orderId}/reject`);
export const markOrderReady = (orderId) => vendorApi.post(`/orders/${orderId}/ready`);
export const completeOrder = (orderId) => vendorApi.post(`/orders/${orderId}/complete`);