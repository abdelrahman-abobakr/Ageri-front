import apiClient from './api';
import { API_ENDPOINTS } from '../constants';

export const servicesService = {
  // Test Services
  getTestServices: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.TEST_SERVICES, { params });
    return response.data;
  },

  createTestService: async (serviceData) => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.TEST_SERVICES, serviceData);
    return response.data;
  },

  getTestServiceById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.TEST_SERVICE_DETAIL(id));
    return response.data;
  },

  updateTestService: async (id, serviceData) => {
    const response = await apiClient.put(API_ENDPOINTS.SERVICES.TEST_SERVICE_DETAIL(id), serviceData);
    return response.data;
  },

  deleteTestService: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.SERVICES.TEST_SERVICE_DETAIL(id));
    return response.data;
  },

  // Service Requests
  getServiceRequests: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.REQUESTS, { params });
    return response.data;
  },

  createServiceRequest: async (requestData) => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.REQUESTS, requestData);
    return response.data;
  },

  getServiceRequestById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.REQUEST_DETAIL(id));
    return response.data;
  },

  updateServiceRequest: async (id, requestData) => {
    const response = await apiClient.put(API_ENDPOINTS.SERVICES.REQUEST_DETAIL(id), requestData);
    return response.data;
  },

  partialUpdateServiceRequest: async (id, requestData) => {
    const response = await apiClient.patch(API_ENDPOINTS.SERVICES.REQUEST_DETAIL(id), requestData);
    return response.data;
  },

  deleteServiceRequest: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.SERVICES.REQUEST_DETAIL(id));
    return response.data;
  },

  // Service Management
  assignTechnician: async (requestId, technicianData) => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.ASSIGN_TECHNICIAN(requestId), technicianData);
    return response.data;
  },

  updateRequestStatus: async (requestId, statusData) => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.UPDATE_STATUS(requestId), statusData);
    return response.data;
  },

  getMyRequests: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.MY_REQUESTS, { params });
    return response.data;
  },
};
