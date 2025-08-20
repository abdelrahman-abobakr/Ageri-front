import apiClient from './api';
import axios from 'axios';

const profileService = {
  // بروفايل المستخدم الحالي - تصحيح المسارات حسب urls.py
  getMyProfile: async () => {
    const response = await apiClient.get('/api/auth/profiles/me/');
    return response.data;
  },

  updateMyProfile: async (data) => {

    // ✅ Do NOT manually set Content-Type for FormData - let Axios handle it automatically
    const config = {};
    const response = await apiClient.patch('api/auth/profiles/me/', data, config);
    return response.data;
  },

  // إنشاء بروفايل جديد للمستخدم الحالي
  createMyProfile: async (data) => {

    // ✅ Do NOT manually set Content-Type for FormData - let Axios handle it automatically
    const config = {};
    const response = await apiClient.put('api/auth/profiles/me/', data, config);
    return response.data;
  },

  // بروفايل مستخدم آخر (للعرض العام أو الإدارة)
  getProfileById: async (id) => {
    const response = await apiClient.get(`auth/profiles/${id}/`);
    return response.data;
  },

  // بروفايل عام للمستخدمين
  getPublicProfile: async (id) => {
    const response = await apiClient.get(`auth/profiles/public/${id}/`);
    return response.data;
  },

  updateProfileById: async (id, data) => {

    // ✅ Do NOT manually set Content-Type for FormData - let Axios handle it automatically
    const config = {};

    const response = await apiClient.patch(`auth/profiles/${id}/`, data, config);
    return response.data;
  },

  // قائمة الباحثين العامة
  getResearchersList: async (params = {}) => {
    const response = await apiClient.get('auth/researchers/', { params });
    return response.data;
  },

  // إحصائيات البروفايلات (للأدمن فقط)
  getProfileStats: async () => {
    const response = await apiClient.get('auth/stats/');
    return response.data;
  },

  // رفع السيرة الذاتية منفصل
  uploadCV: async (file) => {
    // Validate file
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file object');
    }

    const formData = new FormData();
    formData.append('cv_file', file);

    try {
      // ✅ Use axios directly instead of apiClient
      const token = localStorage.getItem('access_token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await axios.patch(
        `${baseURL}/auth/profiles/me/`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            // ✅ DO NOT set Content-Type - let axios handle it
          },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {
            
      if (error.response?.data?.cv_file) {
        const errorMsg = Array.isArray(error.response.data.cv_file) 
          ? error.response.data.cv_file[0] 
          : error.response.data.cv_file;
      }
      
      throw error;
    }
  },

  // رفع الصورة الشخصية منفصل
  uploadProfilePicture: async (file) => {
    
    // Validate file
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file object');
    }

    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      // ✅ Use axios directly instead of apiClient
      const token = localStorage.getItem('access_token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await axios.patch(
        `${baseURL}/auth/profiles/me/`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            // ✅ DO NOT set Content-Type - let axios handle it
          },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {

      
      if (error.response?.data?.profile_picture) {
        const errorMsg = Array.isArray(error.response.data.profile_picture) 
          ? error.response.data.profile_picture[0] 
          : error.response.data.profile_picture;
      }
      
      throw error;
    }
  },

  // حذف السيرة الذاتية
  deleteCV: async () => {
    const response = await apiClient.patch('auth/profiles/me/', { cv_file: null });
    return response.data;
  }
};

export default profileService;
