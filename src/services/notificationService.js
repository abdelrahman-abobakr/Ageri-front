import apiClient from './api';
import { API_ENDPOINTS } from '../constants';

export const notificationService = {
  // Get Notifications
  getNotifications: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST, { params });
    return response.data;
  },

  // Mark Notification as Read
  markAsRead: async (notificationId) => {
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
    return response.data;
  },

  // Mark All Notifications as Read
  markAllAsRead: async () => {
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    return response.data;
  },
};
