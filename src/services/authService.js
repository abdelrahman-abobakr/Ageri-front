import apiClient from './api';

export const authService = {
  // User authentication
  login: async (credentials) => {
    const response = await apiClient.post('auth/login/', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('auth/register/', userData);
    return response.data;
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiClient.post('auth/logout/', { refresh_token: refreshToken });
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

  // User profile management - تصحيح المسار
  getCurrentUser: async () => {
    const response = await apiClient.get('auth/users/me/');
    return response.data;
  },

  updateProfile: async (data) => {
    console.log('📤 AuthService: Updating user profile with data:', data);
    const response = await apiClient.put('auth/users/me/', data);
    console.log('📥 AuthService: User profile update response:', response.data);
    return response.data;
  },

  // Update user fields (phone, institution, department)
  updateUserFields: async (data) => {
    console.log('📤 AuthService: Updating user fields with data:', data);
    const response = await apiClient.patch('auth/users/me/', data);
    console.log('📥 AuthService: User fields update response:', response.data);
    return response.data;
  },

  // Token management
  refreshToken: async (refresh) => {
    const response = await apiClient.post('auth/token/refresh/', { refresh });
    return response.data;
  },

  // Password management
  changePassword: async (passwordData) => {
    const response = await apiClient.post('auth/change-password/', passwordData);
    return response.data;
  },

  requestPasswordReset: async (email) => {
    const response = await apiClient.post('auth/password-reset/', { email });
    return response.data;
  },

  confirmPasswordReset: async (resetData) => {
    const response = await apiClient.post('auth/password-reset-confirm/', resetData);
    return response.data;
  },

  // Admin functions
  approveUser: async (userId) => {
    const response = await apiClient.post(`auth/users/${userId}/approve/`);
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await apiClient.get('auth/users/', { params });
    return response.data;
  },

  getPendingUsers: async () => {
    const response = await apiClient.get('auth/users/pending/');
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await apiClient.get(`auth/users/${userId}/`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`auth/users/${userId}/`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(`auth/users/${userId}/`);
    return response.data;
  },

  // Profile picture management - Using correct UserProfile endpoint
  uploadProfilePicture: async (file) => {
    console.log('Uploading profile picture to UserProfile model...');

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPG, JPEG, and PNG files are allowed.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    const formData = new FormData();
    formData.append('profile_picture', file);

    // ✅ Do NOT manually set Content-Type for FormData - let Axios handle it automatically
    // ✅ Use POST to match the pattern used by updateMyProfile method
    const response = await apiClient.post('auth/profiles/me/', formData);

    console.log('✅ Profile picture upload successful:', response.data);
    return response.data;
  },

  // Remove profile picture
  removeProfilePicture: async () => {
    // ✅ Use POST to match the pattern used by other profile methods
    const response = await apiClient.post('auth/profiles/me/', { profile_picture: null });
    return response.data;
  },

  // Legacy avatar upload method (keeping for backward compatibility)
  uploadAvatar: async (file) => {
    // Redirect to new profile picture method
    return await authService.uploadProfilePicture(file);
  },

  removeAvatar: async () => {
    const response = await apiClient.delete('auth/users/me/avatar/');
    return response.data;
  },
};