import apiClient from './api';
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

  // Lab Management
  assignResearcherToLab: async (labId, researcherData) => {
    const response = await apiClient.post(API_ENDPOINTS.ORGANIZATION.ASSIGN_RESEARCHER(labId), researcherData);
    return response.data;
  },

  removeResearcherFromLab: async (labId, researcherData) => {
    const response = await apiClient.post(API_ENDPOINTS.ORGANIZATION.REMOVE_RESEARCHER(labId), researcherData);
    return response.data;
  },

  getLabResearchers: async (labId) => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZATION.LAB_RESEARCHERS(labId));
    return response.data;
  },
};
