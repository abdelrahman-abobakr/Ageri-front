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

  // Create Notification
  createNotification: async (notificationData) => {
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.LIST, notificationData);
    return response.data;
  },

  // Update Notification
  updateNotification: async (id, notificationData) => {
    const response = await apiClient.put(`/notifications/${id}/`, notificationData);
    return response.data;
  },

  // Delete Notification
  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}/`);
    return response.data;
  },

  // Send Notification
  sendNotification: async (id) => {
    const response = await apiClient.post(`/notifications/${id}/send/`);
    return response.data;
  },

  // Templates Management
  getTemplates: async (params = {}) => {
    const response = await apiClient.get('/notifications/templates/', { params });
    return response.data;
  },

  createTemplate: async (templateData) => {
    const response = await apiClient.post('/notifications/templates/', templateData);
    return response.data;
  },

  updateTemplate: async (id, templateData) => {
    const response = await apiClient.put(`/notifications/templates/${id}/`, templateData);
    return response.data;
  },

  deleteTemplate: async (id) => {
    const response = await apiClient.delete(`/notifications/templates/${id}/`);
    return response.data;
  },

  // Settings Management
  getSettings: async () => {
    const response = await apiClient.get('/notifications/settings/');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await apiClient.put('/notifications/settings/', settings);
    return response.data;
  },
};
