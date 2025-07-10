import apiClient from './api';
import { API_ENDPOINTS } from '../constants';

export const adminService = {
  // System Information
  getSystemInfo: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.SYSTEM_INFO);
    return response.data;
  },

  // Clear Cache
  clearCache: async () => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.CLEAR_CACHE);
    return response.data;
  },

  // Health Check
  healthCheck: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.HEALTH_CHECK);
    return response.data;
  },
};
