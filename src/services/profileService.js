import apiClient from './api';

const profileService = {
  // بروفايل المستخدم الحالي
  getMyProfile: async () => {
    const response = await apiClient.get('accounts/profiles/me/');
    return response.data;
  },
  updateMyProfile: async (data) => {
    const response = await apiClient.patch('accounts/profiles/me/', data);
    return response.data;
  },
  // بروفايل مستخدم آخر (للعرض العام أو الإدارة)
  getProfileById: async (id) => {
    const response = await apiClient.get(`accounts/profiles/${id}/`);
    return response.data;
  },
  updateProfileById: async (id, data) => {
    const response = await apiClient.patch(`accounts/profiles/${id}/`, data);
    return response.data;
  },
};

export default profileService;
