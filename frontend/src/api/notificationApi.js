import apiClient from './apiClient.js';

const notificationApi = {
  // Get user notifications
  getUserNotifications: (page = 1) => 
    apiClient.get(`/notifications/user?page=${page}`),

  // Get a single notification by ID
  getNotificationById: (notificationId) => 
    apiClient.get(`/notifications/${notificationId}`),

  // Mark all notifications as read
  markAllAsRead: () => 
    apiClient.post('/notifications/mark-all-read'),

  // Mark a single notification as read
  markAsRead: (notificationId) => 
    apiClient.post(`/notifications/${notificationId}/mark-read`),

  // Get unread count
  getUnreadCount: () => 
    apiClient.get('/notifications/unread-count'),

  // Vendor: Create notification
  createNotification: (data) => 
    apiClient.post('/notifications/vendor', data),

  // Vendor: Get vendor notifications
  getVendorNotifications: () => 
    apiClient.get('/notifications/vendor'),

  // Vendor: Update notification
  updateNotification: (notificationId, data) => 
    apiClient.patch(`/notifications/vendor/${notificationId}`, data),

  // Admin: Create notification
  createAdminNotification: (data) => 
    apiClient.post('/notifications/admin', data),

  // Admin: Update notification
  updateAdminNotification: (notificationId, data) => 
    apiClient.patch(`/notifications/admin/${notificationId}`, data),
};

export default notificationApi;
