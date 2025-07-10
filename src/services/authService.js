import apiClient from './api';

export const authService = {
  // User authentication
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login/', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register/', userData);
    return response.data;
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiClient.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  // User profile management
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/users/me/');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/auth/users/me/', data);
    return response.data;
  },

  // Token management
  refreshToken: async (refresh) => {
    const response = await apiClient.post('/auth/token/refresh/', { refresh });
    return response.data;
  },

  // Password management
  changePassword: async (passwordData) => {
    const response = await apiClient.post('/auth/change-password/', passwordData);
    return response.data;
  },

  requestPasswordReset: async (email) => {
    const response = await apiClient.post('/auth/password-reset/', { email });
    return response.data;
  },

  confirmPasswordReset: async (resetData) => {
    const response = await apiClient.post('/auth/password-reset-confirm/', resetData);
    return response.data;
  },

  // Admin functions
  approveUser: async (userId) => {
    const response = await apiClient.post(`/auth/users/${userId}/approve/`);
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await apiClient.get('/auth/users/', { params });
    return response.data;
  },

  getPendingUsers: async () => {
    const response = await apiClient.get('/auth/users/?status=pending');
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await apiClient.get(`/auth/users/${userId}/`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/auth/users/${userId}/`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/auth/users/${userId}/`);
    return response.data;
  },

  // Avatar management
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post('/auth/users/me/avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  removeAvatar: async () => {
    const response = await apiClient.delete('/auth/users/me/avatar/');
    return response.data;
  },
};
