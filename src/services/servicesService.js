import apiClient from './api';
import { API_ENDPOINTS } from "../constants/index"

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

  getTestServicesStatistics: async () => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.TEST_SERVICES_STATS);
    return response.data;
  },

  assignTechnicianToService: async (serviceId, technicianData) => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.ASSIGN_TECHNICIAN_TO_SERVICE(serviceId), technicianData);
    return response.data;
  },

  removeTechnicianFromService: async (serviceId, technicianData) => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.REMOVE_TECHNICIAN_FROM_SERVICE(serviceId), technicianData);
    return response.data;
  },

  // Clients
  getClients: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.CLIENTS, { params });
    return response.data;
  },

  createClient: async (clientData) => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.CLIENTS, clientData);
    return response.data;
  },

  getClientById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.CLIENT_DETAIL(id));
    return response.data;
  },

  updateClient: async (id, clientData) => {
    const response = await apiClient.put(API_ENDPOINTS.SERVICES.CLIENT_DETAIL(id), clientData);
    return response.data;
  },

  deleteClient: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.SERVICES.CLIENT_DETAIL(id));
    return response.data;
  },

  getClientStatistics: async () => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.CLIENT_STATS);
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

  assignTechnicianToRequest: async (requestId, technicianData) => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.ASSIGN_TECHNICIAN_TO_REQUEST(requestId), technicianData);
    return response.data;
  },

  startRequest: async (requestId) => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.START_REQUEST(requestId));
    return response.data;
  },

  completeRequest: async (requestId, data) => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.COMPLETE_REQUEST(requestId), data);
    return response.data;
  },

  approveRequest: async (requestId, data) => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.APPROVE_REQUEST(requestId), data);
    return response.data;
  },

  rejectRequest: async (requestId, data) => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.REJECT_REQUEST(requestId), data);
    return response.data;
  },

  getServiceRequestStatistics: async () => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.REQUEST_STATS);
    return response.data;
  },

  // Technician Assignments
  getTechnicianAssignments: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.TECHNICIAN_ASSIGNMENTS, { params });
    return response.data;
  },

  createTechnicianAssignment: async (assignmentData) => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.TECHNICIAN_ASSIGNMENTS, assignmentData);
    return response.data;
  },

  getTechnicianAssignmentById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.TECHNICIAN_ASSIGNMENT_DETAIL(id));
    return response.data;
  },

  updateTechnicianAssignment: async (id, assignmentData) => {
    const response = await apiClient.put(API_ENDPOINTS.SERVICES.TECHNICIAN_ASSIGNMENT_DETAIL(id), assignmentData);
    return response.data;
  },

  deleteTechnicianAssignment: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.SERVICES.TECHNICIAN_ASSIGNMENT_DETAIL(id));
    return response.data;
  },

  getTechnicianWorkload: async () => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.TECHNICIAN_WORKLOAD);
    return response.data;
  },

  // My Requests
  getMyRequests: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.MY_REQUESTS, { params });
    return response.data;
  },
};
