import axios from 'axios';
const userApi = axios.create({ baseURL: import.meta.env.VITE_API_URL + '/users', withCredentials: true });
// Remove token logic; cookies will be sent automatically
export default userApi;

// Subscription plan functions for users
export const getAllSubscriptionPlans = () => userApi.get('/subscription-plans');
export const getSubscriptionPlansByVendor = (vendorId) => userApi.get(`/subscription-plans/vendor/${vendorId}`);
export const getSubscriptionPlanById = (id) => userApi.get(`/subscription-plans/${id}`);

// Cart API functions
export const getCart = () => userApi.get('/cart');
export const addOrUpdateCartItem = (itemId, quantity) => userApi.post('/cart', { itemId, quantity });
export const updateCartItemQuantity = (itemId, quantity) => userApi.put(`/cart/${itemId}`, { quantity });
export const removeCartItem = (itemId) => userApi.delete(`/cart/${itemId}`);
export const clearCart = () => userApi.delete('/cart');

export const createUserSubscription = (data) => userApi.post('/subscriptions', data);
export const getUserSubscriptions = () => userApi.get('/subscriptions');
export const deleteUserSubscription = (subscriptionId) => userApi.delete(`/subscriptions/${subscriptionId}`);
export const getUserSubscriptionQr = (subscriptionId) => userApi.get(`/subscriptions/${subscriptionId}/qr`);

export const uploadPaymentProof = (subscriptionId, file) => {
  const formData = new FormData();
  formData.append('paymentProof', file);
  return userApi.post(`/subscriptions/${subscriptionId}/payment-proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}; 