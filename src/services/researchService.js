import apiClient from './api';
import { API_ENDPOINTS } from '../constants';

export const researchService = {
  // Publications
  getPublications: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.RESEARCH.PUBLICATIONS, { params });
    return response.data;
  },

  createPublication: async (publicationData) => {
    const response = await apiClient.post(API_ENDPOINTS.RESEARCH.PUBLICATIONS, publicationData);
    return response.data;
  },

  getPublicationById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.RESEARCH.PUBLICATION_DETAIL(id));
    return response.data;
  },

  updatePublication: async (id, publicationData) => {
    const response = await apiClient.put(API_ENDPOINTS.RESEARCH.PUBLICATION_DETAIL(id), publicationData);
    return response.data;
  },

  partialUpdatePublication: async (id, publicationData) => {
    const response = await apiClient.patch(API_ENDPOINTS.RESEARCH.PUBLICATION_DETAIL(id), publicationData);
    return response.data;
  },

  deletePublication: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.RESEARCH.PUBLICATION_DETAIL(id));
    return response.data;
  },

  // Publication Authors
  getPublicationAuthors: async (publicationId) => {
    const response = await apiClient.get(API_ENDPOINTS.RESEARCH.PUBLICATION_AUTHORS(publicationId));
    return response.data;
  },

  addAuthorToPublication: async (publicationId, authorData) => {
    const response = await apiClient.post(API_ENDPOINTS.RESEARCH.PUBLICATION_AUTHORS(publicationId), authorData);
    return response.data;
  },

  removeAuthorFromPublication: async (publicationId, authorId) => {
    const response = await apiClient.delete(API_ENDPOINTS.RESEARCH.REMOVE_AUTHOR(publicationId, authorId));
    return response.data;
  },

  // Publication Files
  getPublicationFiles: async (publicationId) => {
    const response = await apiClient.get(API_ENDPOINTS.RESEARCH.PUBLICATION_FILES(publicationId));
    return response.data;
  },

  uploadPublicationFile: async (publicationId, file, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata if provided
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    const response = await apiClient.post(
      API_ENDPOINTS.RESEARCH.PUBLICATION_FILES(publicationId), 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deletePublicationFile: async (publicationId, fileId) => {
    const response = await apiClient.delete(API_ENDPOINTS.RESEARCH.DELETE_FILE(publicationId, fileId));
    return response.data;
  },

  // Search publications
  searchPublications: async (query, params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.SEARCH.PUBLICATIONS, {
      params: { search: query, ...params }
    });
    return response.data;
  },
};
