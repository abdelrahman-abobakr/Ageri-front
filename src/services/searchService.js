import apiClient from './api';
import { API_ENDPOINTS } from '../constants';

export const searchService = {
  // Global Search
  globalSearch: async (query, params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.SEARCH.GLOBAL, {
      params: { search: query, ...params }
    });
    return response.data;
  },

  // Search Publications
  searchPublications: async (query, params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.SEARCH.PUBLICATIONS, {
      params: { search: query, ...params }
    });
    return response.data;
  },

  // Search Users
  searchUsers: async (query, params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.SEARCH.USERS, {
      params: { search: query, ...params }
    });
    return response.data;
  },
};
