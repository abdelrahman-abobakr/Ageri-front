import apiClient from './api';
import { API_ENDPOINTS } from '../constants';

export const analyticsService = {
  // Dashboard Analytics
  getDashboardStats: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.DASHBOARD, { params });
    return response.data;
  },

  // Publication Analytics
  getPublicationAnalytics: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.PUBLICATIONS, { params });
    return response.data;
  },

  // User Analytics
  getUserAnalytics: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.USERS, { params });
    return response.data;
  },

  // Service Analytics
  getServiceAnalytics: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.SERVICES, { params });
    return response.data;
  },
};
