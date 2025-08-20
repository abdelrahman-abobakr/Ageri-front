import apiClient from './api';
import { API_ENDPOINTS } from "../constants/index"

export const servicesService = {
  // Test Services
  getTestServices: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.TEST_SERVICES, { params });
    return response.data;
  },

  createTestService: async (serviceData) => {
    // Handle form data for file uploads
    const formData = new FormData();
    Object.keys(serviceData).forEach(key => {
      if (serviceData[key] !== null && serviceData[key] !== undefined) {
        if (key === 'featured_image' && serviceData[key]?.file) {
          formData.append(key, serviceData[key].file);
        } else if (key === 'is_free') {
          // Convert string to boolean
          formData.append(key, serviceData[key] === 'true' || serviceData[key] === true);
        } else {
          formData.append(key, serviceData[key]);
        }
      }
    });

    const response = await apiClient.post(API_ENDPOINTS.SERVICES.TEST_SERVICES, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getTestServiceById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.TEST_SERVICE_DETAIL(id));
    return response.data;
  },

  updateTestService: async (id, serviceData) => {
    // Handle form data for file uploads
    const formData = new FormData();
    Object.keys(serviceData).forEach(key => {
      if (serviceData[key] !== null && serviceData[key] !== undefined) {
        if (key === 'featured_image' && serviceData[key]?.file) {
          formData.append(key, serviceData[key].file);
        } else if (key === 'is_free') {
          // Convert string to boolean
          formData.append(key, serviceData[key] === 'true' || serviceData[key] === true);
        } else {
          formData.append(key, serviceData[key]);
        }
      }
    });

    const response = await apiClient.put(API_ENDPOINTS.SERVICES.TEST_SERVICE_DETAIL(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

  // Featured services
  getFeaturedServices: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.SERVICES.TEST_SERVICES}featured/`);
    return response.data;
  },

  // Services by category
  getServicesByCategory: async (category) => {
    const response = await apiClient.get(`${API_ENDPOINTS.SERVICES.TEST_SERVICES}by_category/`, {
      params: { category }
    });
    return response.data;
  },

  // Toggle featured status
  toggleFeatured: async (id) => {
    const response = await apiClient.post(`${API_ENDPOINTS.SERVICES.TEST_SERVICE_DETAIL(id)}toggle_featured/`);
    return response.data;
  },

  // Toggle status
  toggleStatus: async (id, status) => {
    const response = await apiClient.post(`${API_ENDPOINTS.SERVICES.TEST_SERVICE_DETAIL(id)}toggle_status/`, {
      status
    });
    return response.data;
  },

  // Service Images
  uploadServiceImage: async (serviceId, imageData) => {
    const formData = new FormData();
    formData.append('image', imageData.image);
    formData.append('is_primary', imageData.is_primary || false);

    const response = await apiClient.post(
      `${API_ENDPOINTS.SERVICES.TEST_SERVICE_DETAIL(serviceId)}upload_image/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getServiceImages: async (serviceId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.SERVICES.TEST_SERVICE_DETAIL(serviceId)}images/`);
    return response.data;
  },

  deleteServiceImage: async (serviceId, imageId) => {
    const response = await apiClient.delete(
      `${API_ENDPOINTS.SERVICES.TEST_SERVICE_DETAIL(serviceId)}delete_image/`,
      {
        data: { image_id: imageId }
      }
    );
    return response.data;
  },

  setPrimaryImage: async (serviceId, imageId) => {
    const response = await apiClient.post(
      `${API_ENDPOINTS.SERVICES.TEST_SERVICE_DETAIL(serviceId)}set_primary_image/`,
      { image_id: imageId }
    );
    return response.data;
  },

  getServiceWithImages: async (serviceId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.SERVICES.TEST_SERVICE_DETAIL(serviceId)}with_images/`);
    return response.data;
  },

  // Legacy methods (kept for backward compatibility but not used with current backend)
  assignTechnicianToService: async (serviceId, technicianData) => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.ASSIGN_TECHNICIAN_TO_SERVICE?.(serviceId), technicianData);
    return response.data;
  },

  removeTechnicianFromService: async (serviceId, technicianData) => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.REMOVE_TECHNICIAN_FROM_SERVICE?.(serviceId), technicianData);
    return response.data;
  },

  // Client methods (may not be available in current backend)
  getClients: async (params = {}) => {
    if (!API_ENDPOINTS.SERVICES.CLIENTS) return { results: [] };
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.CLIENTS, { params });
    return response.data;
  },

  createClient: async (clientData) => {
    if (!API_ENDPOINTS.SERVICES.CLIENTS) throw new Error('Endpoint not available');
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.CLIENTS, clientData);
    return response.data;
  },

  getClientById: async (id) => {
    if (!API_ENDPOINTS.SERVICES.CLIENT_DETAIL) throw new Error('Endpoint not available');
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.CLIENT_DETAIL(id));
    return response.data;
  },

  updateClient: async (id, clientData) => {
    if (!API_ENDPOINTS.SERVICES.CLIENT_DETAIL) throw new Error('Endpoint not available');
    const response = await apiClient.put(API_ENDPOINTS.SERVICES.CLIENT_DETAIL(id), clientData);
    return response.data;
  },

  deleteClient: async (id) => {
    if (!API_ENDPOINTS.SERVICES.CLIENT_DETAIL) throw new Error('Endpoint not available');
    const response = await apiClient.delete(API_ENDPOINTS.SERVICES.CLIENT_DETAIL(id));
    return response.data;
  },

  getClientStatistics: async () => {
    if (!API_ENDPOINTS.SERVICES.CLIENT_STATS) return {};
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.CLIENT_STATS);
    return response.data;
  },

  // Service Request methods (may not be available in current backend)
  getServiceRequests: async (params = {}) => {
    if (!API_ENDPOINTS.SERVICES.REQUESTS) return { results: [] };
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.REQUESTS, { params });
    return response.data;
  },

  createServiceRequest: async (requestData) => {
    if (!API_ENDPOINTS.SERVICES.REQUESTS) throw new Error('Endpoint not available');
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.REQUESTS, requestData);
    return response.data;
  },

  getServiceRequestById: async (id) => {
    if (!API_ENDPOINTS.SERVICES.REQUEST_DETAIL) throw new Error('Endpoint not available');
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.REQUEST_DETAIL(id));
    return response.data;
  },

  updateServiceRequest: async (id, requestData) => {
    if (!API_ENDPOINTS.SERVICES.REQUEST_DETAIL) throw new Error('Endpoint not available');
    const response = await apiClient.put(API_ENDPOINTS.SERVICES.REQUEST_DETAIL(id), requestData);
    return response.data;
  },

  partialUpdateServiceRequest: async (id, requestData) => {
    if (!API_ENDPOINTS.SERVICES.REQUEST_DETAIL) throw new Error('Endpoint not available');
    const response = await apiClient.patch(API_ENDPOINTS.SERVICES.REQUEST_DETAIL(id), requestData);
    return response.data;
  },

  deleteServiceRequest: async (id) => {
    if (!API_ENDPOINTS.SERVICES.REQUEST_DETAIL) throw new Error('Endpoint not available');
    const response = await apiClient.delete(API_ENDPOINTS.SERVICES.REQUEST_DETAIL(id));
    return response.data;
  },

  assignTechnicianToRequest: async (requestId, technicianData) => {
    if (!API_ENDPOINTS.SERVICES.ASSIGN_TECHNICIAN_TO_REQUEST) throw new Error('Endpoint not available');
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.ASSIGN_TECHNICIAN_TO_REQUEST(requestId), technicianData);
    return response.data;
  },

  startRequest: async (requestId) => {
    if (!API_ENDPOINTS.SERVICES.START_REQUEST) throw new Error('Endpoint not available');
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.START_REQUEST(requestId));
    return response.data;
  },

  completeRequest: async (requestId, data) => {
    if (!API_ENDPOINTS.SERVICES.COMPLETE_REQUEST) throw new Error('Endpoint not available');
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.COMPLETE_REQUEST(requestId), data);
    return response.data;
  },

  approveRequest: async (requestId, data) => {
    if (!API_ENDPOINTS.SERVICES.APPROVE_REQUEST) throw new Error('Endpoint not available');
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.APPROVE_REQUEST(requestId), data);
    return response.data;
  },

  rejectRequest: async (requestId, data) => {
    if (!API_ENDPOINTS.SERVICES.REJECT_REQUEST) throw new Error('Endpoint not available');
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.REJECT_REQUEST(requestId), data);
    return response.data;
  },

  getServiceRequestStatistics: async () => {
    if (!API_ENDPOINTS.SERVICES.REQUEST_STATS) return {};
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.REQUEST_STATS);
    return response.data;
  },

  // Technician Assignment methods (may not be available in current backend)
  getTechnicianAssignments: async (params = {}) => {
    if (!API_ENDPOINTS.SERVICES.TECHNICIAN_ASSIGNMENTS) return { results: [] };
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.TECHNICIAN_ASSIGNMENTS, { params });
    return response.data;
  },

  createTechnicianAssignment: async (assignmentData) => {
    if (!API_ENDPOINTS.SERVICES.TECHNICIAN_ASSIGNMENTS) throw new Error('Endpoint not available');
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.TECHNICIAN_ASSIGNMENTS, assignmentData);
    return response.data;
  },

  getTechnicianAssignmentById: async (id) => {
    if (!API_ENDPOINTS.SERVICES.TECHNICIAN_ASSIGNMENT_DETAIL) throw new Error('Endpoint not available');
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.TECHNICIAN_ASSIGNMENT_DETAIL(id));
    return response.data;
  },

  updateTechnicianAssignment: async (id, assignmentData) => {
    if (!API_ENDPOINTS.SERVICES.TECHNICIAN_ASSIGNMENT_DETAIL) throw new Error('Endpoint not available');
    const response = await apiClient.put(API_ENDPOINTS.SERVICES.TECHNICIAN_ASSIGNMENT_DETAIL(id), assignmentData);
    return response.data;
  },

  deleteTechnicianAssignment: async (id) => {
    if (!API_ENDPOINTS.SERVICES.TECHNICIAN_ASSIGNMENT_DETAIL) throw new Error('Endpoint not available');
    const response = await apiClient.delete(API_ENDPOINTS.SERVICES.TECHNICIAN_ASSIGNMENT_DETAIL(id));
    return response.data;
  },

  getTechnicianWorkload: async () => {
    if (!API_ENDPOINTS.SERVICES.TECHNICIAN_WORKLOAD) return {};
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.TECHNICIAN_WORKLOAD);
    return response.data;
  },

  // My Requests (may not be available in current backend)
  getMyRequests: async (params = {}) => {
    if (!API_ENDPOINTS.SERVICES.MY_REQUESTS) return { results: [] };
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.MY_REQUESTS, { params });
    return response.data;
  },
};