import apiClient from './api';
import axios from 'axios';

const profileService = {
  // بروفايل المستخدم الحالي - تصحيح المسارات حسب urls.py
  getMyProfile: async () => {
    console.log('📥 ProfileService: Getting current profile...');
    const response = await apiClient.get('auth/profiles/me/');
    console.log('📥 ProfileService: Current profile data:', response.data);
    return response.data;
  },

  updateMyProfile: async (data) => {
    console.log('📤 ProfileService: Updating profile with data:', data);
    console.log('📤 ProfileService: Data type:', typeof data);
    console.log('📤 ProfileService: Is FormData:', data instanceof FormData);

    // Log FormData contents if it's FormData
    if (data instanceof FormData) {
      console.log('📤 ProfileService: FormData contents:');
      for (let [key, value] of data.entries()) {
        console.log(`  ${key}:`, value);
      }
    } else {
      console.log('📤 ProfileService: JSON data contents:', JSON.stringify(data, null, 2));
    }

    // ✅ Do NOT manually set Content-Type for FormData - let Axios handle it automatically
    const config = {};
    if (data instanceof FormData) {
      // Axios will automatically set Content-Type: multipart/form-data with proper boundary
      console.log('📤 ProfileService: Using FormData - Axios will auto-set Content-Type with boundary');
    } else {
      console.log('📤 ProfileService: Using JSON data');
    }

    console.log('📤 ProfileService: Making PATCH request to auth/profiles/me/');
    const response = await apiClient.patch('auth/profiles/me/', data, config);
    console.log('📥 ProfileService: Response status:', response.status);
    console.log('📥 ProfileService: Response headers:', response.headers);
    console.log('📥 ProfileService: Received response data:', JSON.stringify(response.data, null, 2));
    return response.data;
  },

  // إنشاء بروفايل جديد للمستخدم الحالي
  createMyProfile: async (data) => {
    console.log('📤 ProfileService: Creating profile with data:', data);
    console.log('📤 ProfileService: Data type:', typeof data);
    console.log('📤 ProfileService: Is FormData:', data instanceof FormData);

    // Log FormData contents if it's FormData
    if (data instanceof FormData) {
      console.log('📤 ProfileService: FormData contents:');
      for (let [key, value] of data.entries()) {
        console.log(`  ${key}:`, value);
      }
    } else {
      console.log('📤 ProfileService: JSON data contents:', JSON.stringify(data, null, 2));
    }

    // ✅ Do NOT manually set Content-Type for FormData - let Axios handle it automatically
    const config = {};
    if (data instanceof FormData) {
      // Axios will automatically set Content-Type: multipart/form-data with proper boundary
      console.log('📤 ProfileService: Using FormData - Axios will auto-set Content-Type with boundary');
    } else {
      console.log('📤 ProfileService: Using JSON data');
    }

    console.log('📤 ProfileService: Making POST request to auth/profiles/me/');
    const response = await apiClient.post('auth/profiles/me/', data, config);
    console.log('📥 ProfileService: Response status:', response.status);
    console.log('📥 ProfileService: Received response data:', JSON.stringify(response.data, null, 2));
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
    console.log('📤 ProfileService: Updating profile by ID with data:', data);
    console.log('📤 ProfileService: Data type:', typeof data);
    console.log('📤 ProfileService: Is FormData:', data instanceof FormData);

    // ✅ Do NOT manually set Content-Type for FormData - let Axios handle it automatically
    const config = {};
    if (data instanceof FormData) {
      // Axios will automatically set Content-Type: multipart/form-data with proper boundary
      console.log('📤 ProfileService: Using FormData - Axios will auto-set Content-Type with boundary');
      for (let [key, value] of data.entries()) {
        console.log(`  ${key}:`, value);
      }
    } else {
      console.log('📤 ProfileService: Using JSON data');
    }

    const response = await apiClient.patch(`auth/profiles/${id}/`, data, config);
    console.log('📥 ProfileService: Response status:', response.status);
    console.log('📥 ProfileService: Received response data:', JSON.stringify(response.data, null, 2));
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
    console.log('📤 ProfileService: Uploading CV file:', file);
    
    // Validate file
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file object');
    }

    const formData = new FormData();
    formData.append('cv_file', file);

    // Log FormData contents
    console.log('📤 FormData created with entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

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

      console.log('✅ CV upload successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CV upload failed:', error);
      console.error('❌ Error response:', error.response?.data);
      
      if (error.response?.data?.cv_file) {
        const errorMsg = Array.isArray(error.response.data.cv_file) 
          ? error.response.data.cv_file[0] 
          : error.response.data.cv_file;
        console.error('❌ Backend error:', errorMsg);
      }
      
      throw error;
    }
  },

  // رفع الصورة الشخصية منفصل
  uploadProfilePicture: async (file) => {
    console.log('📤 ProfileService: Uploading profile picture:', file);
    
    // Validate file
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file object');
    }

    const formData = new FormData();
    formData.append('profile_picture', file);

    // Log FormData contents
    console.log('📤 FormData created with entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

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

      console.log('✅ Upload successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      console.error('❌ Error response:', error.response?.data);
      
      if (error.response?.data?.profile_picture) {
        const errorMsg = Array.isArray(error.response.data.profile_picture) 
          ? error.response.data.profile_picture[0] 
          : error.response.data.profile_picture;
        console.error('❌ Backend error:', errorMsg);
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
