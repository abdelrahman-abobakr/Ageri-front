import apiClient, { publicApiClient } from './api';
import { API_ENDPOINTS } from '../constants';

export const organizationService = {
  // Departments
  getDepartments: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZATION.DEPARTMENTS, { params });
    return response.data;
  },

  createDepartment: async (departmentData) => {
    const response = await apiClient.post(API_ENDPOINTS.ORGANIZATION.DEPARTMENTS, departmentData);
    return response.data;
  },

  getDepartmentById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZATION.DEPARTMENT_DETAIL(id));
    return response.data;
  },

  updateDepartment: async (id, departmentData) => {
    const response = await apiClient.put(API_ENDPOINTS.ORGANIZATION.DEPARTMENT_DETAIL(id), departmentData);
    return response.data;
  },

  partialUpdateDepartment: async (id, departmentData) => {
    const response = await apiClient.patch(API_ENDPOINTS.ORGANIZATION.DEPARTMENT_DETAIL(id), departmentData);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.ORGANIZATION.DEPARTMENT_DETAIL(id));
    return response.data;
  },

  // Laboratories
  getLabs: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZATION.LABS, { params });
    return response.data;
  },

  createLab: async (labData) => {
    const response = await apiClient.post(API_ENDPOINTS.ORGANIZATION.LABS, labData);
    return response.data;
  },

  getLabById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZATION.LAB_DETAIL(id));
    return response.data;
  },

  updateLab: async (id, labData) => {
    const response = await apiClient.put(API_ENDPOINTS.ORGANIZATION.LAB_DETAIL(id), labData);
    return response.data;
  },

  partialUpdateLab: async (id, labData) => {
    const response = await apiClient.patch(API_ENDPOINTS.ORGANIZATION.LAB_DETAIL(id), labData);
    return response.data;
  },

  deleteLab: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.ORGANIZATION.LAB_DETAIL(id));
    return response.data;
  },

  // Lab Assignments Management
  createAssignment: async (assignmentData) => {
    const response = await apiClient.post(API_ENDPOINTS.ORGANIZATION.ASSIGNMENTS, assignmentData);
    return response.data;
  },

  getAssignments: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZATION.ASSIGNMENTS, { params });
    return response.data;
  },

  getMyAssignments: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZATION.MY_ASSIGNMENTS);
    return response.data;
  },

  deleteAssignment: async (assignmentId) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.ORGANIZATION.ASSIGNMENTS}${assignmentId}/`);
    return response.data;
  },

  getLabResearchers: async (labId) => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZATION.LAB_RESEARCHERS(labId));
    return response.data;
  },

  // Staff Management
  getStaff: async (params = {}) => {
    const response = await apiClient.get('/organization/staff/', { params });
    return response.data;
  },

  createStaff: async (staffData) => {
    const response = await apiClient.post('/organization/staff/', staffData);
    return response.data;
  },

  updateStaff: async (id, staffData) => {
    const response = await apiClient.put(`/organization/staff/${id}/`, staffData);
    return response.data;
  },

  deleteStaff: async (id) => {
    const response = await apiClient.delete(`/organization/staff/${id}/`);
    return response.data;
  },

  // Organization Settings (Public - for homepage)
  getPublicSettings: async () => {
    try {
      // Try public API first
      const response = await publicApiClient.get(API_ENDPOINTS.ORGANIZATION.SETTINGS);
      return response.data;
    } catch (error) {
      // If public access fails, try with auth (for logged-in users)
      if (error.response?.status === 401) {
        try {
          const response = await apiClient.get(API_ENDPOINTS.ORGANIZATION.SETTINGS);
          return response.data;
        } catch (authError) {
          console.error('Failed to fetch organization settings with auth:', authError);
        }
      }

      console.error('Failed to fetch organization settings:', error);
      // Return default settings structure if API fails
      return {
        name: "منظمة البحث العلمي الزراعي",
        vision: "أن نكون المنظمة الرائدة في البحث العلمي الزراعي والابتكار التكنولوجي في المنطقة",
        vision_image: null,
        mission: "نسعى لتطوير الحلول المبتكرة في مجال الزراعة والبحث العلمي لخدمة المجتمع والبيئة",
        mission_image: null,
        about: "منظمة رائدة في مجال البحث العلمي الزراعي، نعمل على تطوير التقنيات الحديثة والحلول المستدامة لتحسين الإنتاج الزراعي وحماية البيئة.",
        email: "info@agri-research.org",
        phone: "+966 11 123 4567",
        address: "الرياض، المملكة العربية السعودية",
        website: "https://agri-research.org",
        facebook: "https://facebook.com/agri-research",
        twitter: "https://twitter.com/agri_research",
        linkedin: "https://linkedin.com/company/agri-research",
        instagram: "https://instagram.com/agri_research",
        logo: null,
        banner: null,
        enable_registration: true
      };
    }
  },

  // Organization Settings (Admin - requires authentication)
  getSettings: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORGANIZATION.SETTINGS);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch organization settings:', error);
      // Return default settings structure if API fails
      return {
        name: "Scientific Research Organization",
        vision: "",
        vision_image: null,
        mission: "",
        mission_image: null,
        about: "",
        email: "",
        phone: "",
        address: "",
        website: "",
        facebook: "",
        twitter: "",
        linkedin: "",
        instagram: "",
        logo: null,
        banner: null,
        enable_registration: true
      };
    }
  },

  updateSettings: async (settingsData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ORGANIZATION.SETTINGS, settingsData);
      return response.data;
    } catch (error) {
      console.error('Failed to update organization settings:', error);
      throw error;
    }
  },

  partialUpdateSettings: async (settingsData) => {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.ORGANIZATION.SETTINGS, settingsData);
      return response.data;
    } catch (error) {
      console.error('Failed to partially update organization settings:', error);
      throw error;
    }
  },
};
