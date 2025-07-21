// Robust deletePublication function with error handling
import axios from 'axios';

export const deletePublication = async (publicationId) => {
  try {
    const response = await axios.delete(`/api/research/publications/${publicationId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting publication:', error);
    throw error;
  }
};
import apiClient from './api'; // Correct import for apiClient

export const API_ENDPOINTS = {
  RESEARCH: {
    PUBLICATIONS: 'research/publications/',
    PUBLICATION_DETAIL: (id) => `research/publications/${id}/`,
    // For authors, the backend uses /api/research/authors/ not /api/research/publications/{id}/authors/
    // The filter `?publication={publicationId}` is correct for listing authors associated with a publication
    PUBLICATION_AUTHORS: (publicationId) => `research/authors/?publication=${publicationId}`,
    ADD_AUTHOR: 'research/authors/', // For adding a new PublicationAuthor instance
    REMOVE_AUTHOR: (authorId) => `research/authors/${authorId}/`, // Correct for deleting a PublicationAuthor instance
    // Note: PUBLICATION_FILES and DELETE_FILE mapping might need clarification from backend if not directly on publication detail
    // Assuming file operations are part of PUT/PATCH on PUBLICATION_DETAIL or custom actions
    PUBLICATION_FILES: (publicationId) => `research/publications/${publicationId}/`, // Used for upload (PATCH/PUT) or retrieval of detail
    DELETE_FILE: (publicationId) => `research/publications/${publicationId}/`, // Used for setting document_file to null (PATCH/PUT)
  },
  SEARCH: {
    PUBLICATIONS: 'research/publications/',
  },
};

const researchService = {
  getPublications: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.RESEARCH.PUBLICATIONS, { params });
    return response.data;
  },

  createPublication: async (publicationData) => {
    // publicationData should be a FormData object if it includes a file
    const response = await apiClient.post(API_ENDPOINTS.RESEARCH.PUBLICATIONS, publicationData, {
      headers: { 'Content-Type': 'multipart/form-data' }, // Essential for file uploads
    });
    return response.data;
  },

  getPublicationById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.RESEARCH.PUBLICATION_DETAIL(id));
    return response.data;
  },

  updatePublication: async (id, publicationData) => {
    // publicationData should be a FormData object if it includes a file
    const response = await apiClient.put(API_ENDPOINTS.RESEARCH.PUBLICATION_DETAIL(id), publicationData, {
      headers: { 'Content-Type': 'multipart/form-data' }, // Essential for file uploads
    });
    return response.data;
  },

  partialUpdatePublication: async (id, publicationData) => {
    // publicationData should be a FormData object if it includes a file
    const response = await apiClient.patch(API_ENDPOINTS.RESEARCH.PUBLICATION_DETAIL(id), publicationData, {
      headers: { 'Content-Type': 'multipart/form-data' }, // Essential for file uploads
    });
    return response.data;
  },

  deletePublication: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.RESEARCH.PUBLICATION_DETAIL(id));
    // DRF delete usually returns 204 No Content for success
    return response.status === 204 || response.status === 200
      ? { success: true, message: 'Publication deleted successfully' }
      : Promise.reject(new Error('Failed to delete publication'));
  },

  // Author Management related to a publication (via PublicationAuthorViewSet)
  getPublicationAuthors: async (publicationId) => {
    // This endpoint lists PublicationAuthor instances for a given publication
    const response = await apiClient.get(API_ENDPOINTS.RESEARCH.PUBLICATION_AUTHORS(publicationId));
    return response.data;
  },

  addAuthorToPublication: async (authorData) => {
    // authorData should include 'publication' ID and 'author' ID, plus other metadata
    // Example: { publication: 1, author: 5, order: 1, role: '...' }
    const response = await apiClient.post(API_ENDPOINTS.RESEARCH.ADD_AUTHOR, authorData);
    return response.data;
  },

  removeAuthorFromPublication: async (authorId) => {
    // authorId here refers to the ID of the PublicationAuthor instance, not the User ID
    const response = await apiClient.delete(API_ENDPOINTS.RESEARCH.REMOVE_AUTHOR(authorId));
    return response.data;
  },

  // File Management - assuming document_file is part of the main Publication model
  // The backend currently handles document_file via PublicationCreateUpdateSerializer on PUT/PATCH
  // The getPublicationFiles method might not directly map to a separate endpoint if files are part of PublicationDetail
  getPublicationFiles: async (publicationId) => {
    // This might just retrieve the publication details which includes the file URL
    const response = await apiClient.get(API_ENDPOINTS.RESEARCH.PUBLICATION_DETAIL(publicationId));
    return response.data.document_file_url; // Assuming backend sends a direct URL
  },

  uploadPublicationFile: async (publicationId, file, metadata = {}) => {
    const formData = new FormData();
    formData.append('document_file', file); // Field name should match Django model field name
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });
    // This will be a PATCH or PUT request to update the publication with the new file
    const response = await apiClient.patch(
      API_ENDPOINTS.RESEARCH.PUBLICATION_DETAIL(publicationId),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  deletePublicationFile: async (publicationId) => {
    // To delete a file, you'd typically send a PATCH/PUT request setting the file field to null
    const formData = new FormData();
    formData.append('document_file', ''); // Send empty string or null to clear the file field
    const response = await apiClient.patch(
      API_ENDPOINTS.RESEARCH.PUBLICATION_DETAIL(publicationId),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },


  // Metrics / Custom Actions
  incrementView: async (publicationId) => {
    const response = await apiClient.post(
      `${API_ENDPOINTS.RESEARCH.PUBLICATION_DETAIL(publicationId)}increment_view/`
    );
    return response.data;
  },

  incrementDownload: async (publicationId) => {
    const response = await apiClient.post(
      `${API_ENDPOINTS.RESEARCH.PUBLICATION_DETAIL(publicationId)}increment_download/`
    );
    return response.data;
  },

  getMyPublications: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.RESEARCH.PUBLICATIONS}my_publications/`);
    return response.data;
  },

  getPendingReviewPublications: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.RESEARCH.PUBLICATIONS}pending_review/`);
    return response.data;
  },

  approvePublication: async (id, reviewData = {}) => {
    // reviewData might contain { review_notes: "..." }
    const response = await apiClient.post(
      `${API_ENDPOINTS.RESEARCH.PUBLICATION_DETAIL(id)}approve/`,
      reviewData
    );
    return response.data;
  },

  rejectPublication: async (id, reviewData = {}) => {
    const response = await apiClient.post(
      `${API_ENDPOINTS.RESEARCH.PUBLICATION_DETAIL(id)}reject/`,
      reviewData
    );
    return response.data;
  },

  bulkApproveRejectPublications: async (data) => {
    // data should be like { ids: [1, 2, 3], status: 'approved'/'rejected', review_notes: '' }
    const response = await apiClient.post(
      `${API_ENDPOINTS.RESEARCH.PUBLICATIONS}bulk_approve/`,
      data
    );
    return response.data;
  },
};

export default researchService;