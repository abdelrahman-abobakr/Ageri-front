// services/enhancedResearchService.js
import apiClient, { publicApiClient } from './api';
import { API_ENDPOINTS } from '../constants';

// Enhanced error handling utility that preserves the original error structure
const handleApiError = (error, context = '') => {
  console.error(`⌐ API Error [${context}]:`, error);

  // Log detailed error information
  if (error.response) {
    console.error(`⌐ Status: ${error.response.status}`, error.response.data);
  } else if (error.request) {
    console.error('⌐ Network Error:', error.request);
  } else {
    console.error('⌐ Error:', error.message);
  }

  // For validation errors (400) and other structured errors, preserve the original error
  // This allows the React component to handle them properly
  if (error.response && (error.response.status === 400 || error.response.data)) {
    // Re-throw the original error to preserve the structure
    throw error;
  }

  // For network errors or other cases, create a user-friendly error
  if (!error.response) {
    const networkError = new Error('Network error - Please check your connection');
    networkError.isNetworkError = true;
    throw networkError;
  }

  // For other status codes, create appropriate errors
  const { status, data } = error.response;
  let message;

  switch (status) {
    case 401:
      message = 'Authentication required - Please log in';
      break;
    case 403:
      message = 'Permission denied - You are not authorized to perform this action';
      break;
    case 404:
      message = 'Resource not found';
      break;
    case 413:
      message = 'File too large - Maximum size is 10MB';
      break;
    case 500:
      message = 'Server error - Please try again later';
      break;
    default:
      message = data?.detail || data?.message || `Server error (${status})`;
  }

  const customError = new Error(message);
  customError.status = status;
  customError.originalError = error;
  throw customError;
};

// Enhanced Research Service
class EnhancedResearchService {
  constructor() {
    this.baseEndpoints = {
      PUBLICATIONS: API_ENDPOINTS.RESEARCH.PUBLICATIONS,
      AUTHORS: '/api/research/authors/',
      METRICS: '/api/research/metrics/',
    };
  }

  // Helper method to create FormData safely
  createFormData(data) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          // Handle arrays (e.g., keywords, authors)
          if (key === 'keywords_list') {
            formData.append('keywords', value.join(', '));
          } else if (key === 'authors_data') {
            formData.append('authors_data', JSON.stringify(value));
          } else {
            value.forEach((item, index) => {
              formData.append(`${key}[${index}]`, item);
            });
          }
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Log FormData contents for debugging
    console.log('📤 FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `[File: ${value.name}]` : value);
    }

    return formData;
  }

  // Publications CRUD Operations
  async getAllPublications(params = {}) {
    try {
      console.log('📤 Fetching all publications with params:', params);

      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.set(key, value);
          }
        }
      });

      const response = await apiClient.get(`${this.baseEndpoints.PUBLICATIONS}?${queryParams}`);
      console.log('📥 Publications response:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'getAllPublications');
    }
  }

  async getPublicationById(id) {
    try {
      console.log('📤 Fetching publication with ID:', id);
      const response = await apiClient.get(`${this.baseEndpoints.PUBLICATIONS}${id}/`);
      console.log('📥 Publication detail response:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'getPublicationById');
    }
  }

  async createPublication(data) {
    try {
      console.log('📤 Creating publication with data:', data);

      // Client-side validation for better UX
      if (!data.title || data.title.trim().length < 10) {
        const validationError = new Error('Validation Error');
        validationError.response = {
          status: 400,
          data: {
            error_type: 'validation',
            errors: {
              title: {
                messages: ['Title is required and must be at least 10 characters long'],
                type: 'validation_error'
              }
            },
            message: 'Client-side validation failed',
            success: false
          }
        };
        throw validationError;
      }

      if (!data.publication_type) {
        const validationError = new Error('Validation Error');
        validationError.response = {
          status: 400,
          data: {
            error_type: 'validation',
            errors: {
              publication_type: {
                messages: ['Publication type is required'],
                type: 'validation_error'
              }
            },
            message: 'Client-side validation failed',
            success: false
          }
        };
        throw validationError;
      }

      // Prepare data for submission
      let submitData;
      let config = {};

      // Check if we have file uploads
      const hasFiles = data.document_file instanceof File;

      if (hasFiles) {
        // Use FormData for file uploads
        submitData = this.createFormData(data);
        // Don't set Content-Type - let Axios handle it for FormData
        config = {};
      } else {
        // Use JSON for text-only data
        submitData = {
          ...data,
          // Convert keywords array to string if needed
          keywords: Array.isArray(data.keywords_list)
            ? data.keywords_list.join(', ')
            : data.keywords || '',
          // Ensure authors_data is properly formatted
          authors_data: data.authors_data || []
        };
        config = {
          headers: {
            'Content-Type': 'application/json'
          }
        };
      }

      console.log('📤 Submitting publication data:', submitData);
      const response = await apiClient.post(this.baseEndpoints.PUBLICATIONS, submitData, config);
      console.log('📥 Publication created successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'createPublication');
    }
  }

  async updatePublication(id, data) {
    try {
      console.log('📤 Updating publication ID:', id, 'with data:', data);

      // Prepare data for submission
      let submitData;
      let config = {};

      // Check if we have file uploads
      const hasFiles = data.document_file instanceof File;

      if (hasFiles) {
        // Use FormData for file uploads
        submitData = this.createFormData(data);
        config = {};
      } else {
        // Use JSON for text-only data
        submitData = {
          ...data,
          keywords: Array.isArray(data.keywords_list)
            ? data.keywords_list.join(', ')
            : data.keywords || '',
          authors_data: data.authors_data || []
        };
        config = {
          headers: {
            'Content-Type': 'application/json'
          }
        };
      }

      // Use PATCH for partial updates to avoid 400 errors
      const response = await apiClient.patch(`${this.baseEndpoints.PUBLICATIONS}${id}/`, submitData, config);
      console.log('📥 Publication updated successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'updatePublication');
    }
  }

  async deletePublication(id) {
    try {
      console.log('📤 Deleting publication ID:', id);
      const response = await apiClient.delete(`${this.baseEndpoints.PUBLICATIONS}${id}/`);
      console.log('📥 Publication deleted successfully, status:', response.status);
      return { success: true, message: 'Publication deleted successfully' };
    } catch (error) {
      handleApiError(error, 'deletePublication');
    }
  }

  async getMyPublications(params = {}) {
    try {
      console.log('📤 Fetching my publications with params:', params);

      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.set(key, value);
        }
      });

      const response = await apiClient.get(`${this.baseEndpoints.PUBLICATIONS}my_publications/?${queryParams}`);
      console.log('📥 My publications response:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'getMyPublications');
    }
  }

  async approvePublication(id, reviewData = {}) {
    try {
      console.log('📤 Approving publication ID:', id, 'with review data:', reviewData);
      const response = await apiClient.post(`${this.baseEndpoints.PUBLICATIONS}${id}/approve/`, reviewData);
      console.log('📥 Publication approved:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'approvePublication');
    }
  }

  async featurePublication(id) {
    try {
      console.log('📤 Toggling feature status for publication ID:', id);
      const response = await apiClient.post(`${this.baseEndpoints.PUBLICATIONS}${id}/feature/`);
      console.log('📥 Publication feature toggled:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'featurePublication');
    }
  }

  async getPublicationStatistics() {
    try {
      console.log('📤 Fetching publication statistics');
      const response = await apiClient.get(`${this.baseEndpoints.PUBLICATIONS}statistics/`);
      console.log('📥 Statistics response:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'getPublicationStatistics');
    }
  }

  async bulkApprove(data) {
    try {
      console.log('📤 Bulk approve publications:', data);
      const response = await apiClient.post(`${this.baseEndpoints.PUBLICATIONS}bulk_approve/`, data);
      console.log('📥 Bulk approve response:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'bulkApprove');
    }
  }

  async advancedSearch(searchParams) {
    try {
      console.log('📤 Advanced search with params:', searchParams);
      const response = await apiClient.get(`${this.baseEndpoints.PUBLICATIONS}advanced_search/`, {
        params: searchParams
      });
      console.log('📥 Advanced search response:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'advancedSearch');
    }
  }

  // File upload operations with enhanced error handling
  async uploadPublicationFile(publicationId, file, metadata = {}) {
    try {
      console.log('📤 Uploading file for publication ID:', publicationId);
      console.log('📤 File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Validate file
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        const validationError = new Error('Invalid file type');
        validationError.response = {
          status: 400,
          data: {
            error_type: 'validation',
            errors: {
              document_file: {
                messages: ['Invalid file type. Only PDF, DOC, and DOCX files are allowed.'],
                type: 'validation_error'
              }
            },
            message: 'File validation failed',
            success: false
          }
        };
        throw validationError;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        const validationError = new Error('File too large');
        validationError.response = {
          status: 413,
          data: {
            error_type: 'validation',
            errors: {
              document_file: {
                messages: ['File size too large. Maximum size is 10MB.'],
                type: 'validation_error'
              }
            },
            message: 'File size validation failed',
            success: false
          }
        };
        throw validationError;
      }

      const formData = new FormData();
      formData.append('document_file', file);

      // Add metadata
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await apiClient.patch(
        `${this.baseEndpoints.PUBLICATIONS}${publicationId}/`,
        formData
      );
      console.log('📥 File uploaded successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'uploadPublicationFile');
    }
  }

  async deletePublicationFile(publicationId) {
    try {
      console.log('📤 Deleting file for publication ID:', publicationId);
      const response = await apiClient.patch(
        `${this.baseEndpoints.PUBLICATIONS}${publicationId}/`,
        { document_file: null }
      );
      console.log('📥 File deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'deletePublicationFile');
    }
  }

  // Authors management
  async getPublicationAuthors(publicationId, params = {}) {
    try {
      console.log('📤 Fetching authors for publication ID:', publicationId);
      const queryParams = { publication: publicationId, ...params };
      const response = await apiClient.get(this.baseEndpoints.AUTHORS, { params: queryParams });
      console.log('📥 Publication authors response:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'getPublicationAuthors');
    }
  }

  async addAuthorToPublication(authorData) {
    try {
      console.log('📤 Adding author to publication:', authorData);
      const response = await apiClient.post(this.baseEndpoints.AUTHORS, authorData);
      console.log('📥 Author added successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'addAuthorToPublication');
    }
  }

  async updatePublicationAuthor(authorId, authorData) {
    try {
      console.log('📤 Updating publication author ID:', authorId);
      const response = await apiClient.patch(`${this.baseEndpoints.AUTHORS}${authorId}/`, authorData);
      console.log('📥 Author updated successfully:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'updatePublicationAuthor');
    }
  }

  async removeAuthorFromPublication(authorId) {
    try {
      console.log('📤 Removing publication author ID:', authorId);
      const response = await apiClient.delete(`${this.baseEndpoints.AUTHORS}${authorId}/`);
      console.log('📥 Author removed successfully, status:', response.status);
      return { success: true, message: 'Author removed successfully' };
    } catch (error) {
      handleApiError(error, 'removeAuthorFromPublication');
    }
  }

  // Metrics operations
  async getPublicationMetrics(publicationId) {
    try {
      console.log('📤 Fetching metrics for publication ID:', publicationId);
      const params = { publication: publicationId };
      const response = await apiClient.get(this.baseEndpoints.METRICS, { params });
      console.log('📥 Publication metrics response:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'getPublicationMetrics');
    }
  }

  async getAllMetrics(params = {}) {
    try {
      console.log('📤 Fetching all publication metrics');
      const response = await apiClient.get(this.baseEndpoints.METRICS, { params });
      console.log('📥 All metrics response:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'getAllMetrics');
    }
  }

  // Utility methods for view/download tracking
  async incrementView(publicationId) {
    try {
      console.log('📤 Incrementing view count for publication ID:', publicationId);
      const response = await apiClient.post(
        `${this.baseEndpoints.PUBLICATIONS}${publicationId}/increment_view/`
      );
      console.log('📥 View incremented successfully:', response.data);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Failed to increment view count:', error.message);
      // Don't throw error for view increment failures
      return null;
    }
  }

  async incrementDownload(publicationId) {
    try {
      console.log('📤 Incrementing download count for publication ID:', publicationId);
      const response = await apiClient.post(
        `${this.baseEndpoints.PUBLICATIONS}${publicationId}/increment_download/`
      );
      console.log('📥 Download incremented successfully:', response.data);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Failed to increment download count:', error.message);
      return null;
    }
  }

  // Public endpoints (no authentication required)
  async getPublicPublications(params = {}) {
    try {
      console.log('📤 Fetching public publications');
      const response = await publicApiClient.get(this.baseEndpoints.PUBLICATIONS, { params });
      console.log('📥 Public publications response:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'getPublicPublications');
    }
  }

  async getPublicPublicationById(id) {
    try {
      console.log('📤 Fetching public publication ID:', id);
      const response = await publicApiClient.get(`${this.baseEndpoints.PUBLICATIONS}${id}/`);
      console.log('📥 Public publication detail response:', response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'getPublicPublicationById');
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await publicApiClient.get('research/health/');
      return response.data;
    } catch (error) {
      handleApiError(error, 'healthCheck');
    }
  }

  // Enhanced form validation helpers
  validatePublicationData(data) {
    const errors = {};

    // Title validation
    if (!data.title || data.title.trim().length < 10) {
      errors.title = ['Title is required and must be at least 10 characters long'];
    } else if (data.title.length > 500) {
      errors.title = ['Title cannot exceed 500 characters'];
    }

    // Publication type validation
    if (!data.publication_type) {
      errors.publication_type = ['Publication type is required'];
    }

    // Conditional validations based on publication type
    if (data.publication_type === 'journal_article' && !data.journal_name) {
      errors.journal_name = ['Journal name is required for journal articles'];
    }

    if (data.publication_type === 'conference_paper' && !data.conference_name) {
      errors.conference_name = ['Conference name is required for conference papers'];
    }

    // DOI validation
    if (data.doi && !data.doi.startsWith('10.')) {
      errors.doi = ['DOI must start with "10."'];
    }

    // Abstract length validation
    if (data.abstract && data.abstract.length > 2000) {
      errors.abstract = ['Abstract cannot exceed 2000 characters'];
    }

    // Publication date validation
    if (data.publication_date) {
      const pubDate = new Date(data.publication_date);
      const today = new Date();
      if (pubDate > today) {
        errors.publication_date = ['Publication date cannot be in the future'];
      }
    }

    // Authors validation
    if (data.authors_data && Array.isArray(data.authors_data)) {
      const orders = data.authors_data.map(author => author.order);
      const uniqueOrders = new Set(orders);
      if (orders.length !== uniqueOrders.size) {
        errors.authors_data = ['Author orders must be unique'];
      }

      const firstAuthors = data.authors_data.filter(author => author.is_first_author);
      if (firstAuthors.length > 1) {
        errors.authors_data = [...(errors.authors_data || []), 'Only one first author is allowed'];
      }

      if (firstAuthors.length === 1 && firstAuthors[0].order !== 1) {
        errors.authors_data = [...(errors.authors_data || []), 'First author must have order = 1'];
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Helper method to prepare form data for submission
  prepareSubmissionData(formValues, fileList = [], authors = [], keywords = []) {
    const data = {
      ...formValues,
      // Handle keywords
      keywords: keywords.length > 0 ? keywords.join(', ') : (formValues.keywords || ''),
      keywords_list: keywords,
      // Handle authors
      authors_data: authors,
      // Handle file upload
      document_file: fileList.length > 0 ? fileList[0].originFileObj || fileList[0] : null,
      // Format date
      publication_date: formValues.publication_date
        ? (formValues.publication_date.format ? formValues.publication_date.format('YYYY-MM-DD') : formValues.publication_date)
        : null
    };

    // Remove empty values
    Object.keys(data).forEach(key => {
      if (data[key] === null || data[key] === undefined || data[key] === '') {
        delete data[key];
      }
    });

    return data;
  }

  // Check if DOI already exists
  async checkDoiExists(doi, excludeId = null) {
    try {
      console.log('🔍 Checking DOI existence:', doi, 'excluding ID:', excludeId);

      // Use search endpoint to check if DOI exists
      const response = await publicApiClient.get(`${this.baseEndpoints.PUBLICATIONS}`, {
        params: {
          search: doi,
          doi: doi,
          limit: 10 // Get a few results to check
        }
      });

      console.log('📋 DOI check response:', response.data);

      // Check if any publication has this exact DOI
      let exists = false;
      let conflictingPublication = null;

      if (response.data.results) {
        for (const pub of response.data.results) {
          if (pub.doi && pub.doi.toLowerCase() === doi.toLowerCase()) {
            // If we're updating a publication, exclude the current publication from the check
            if (!excludeId || pub.id !== parseInt(excludeId)) {
              exists = true;
              conflictingPublication = pub;
              break;
            }
          }
        }
      }

      return {
        exists,
        count: response.data.count || 0,
        conflictingPublication
      };
    } catch (error) {
      console.error('⌐ Error checking DOI:', error);
      // Return false on error to avoid blocking user
      return { exists: false, count: 0, conflictingPublication: null };
    }
  }
}

// Create and export singleton instance
const enhancedResearchService = new EnhancedResearchService();

export default enhancedResearchService;

// Also export the class for custom instantiation if needed
export { EnhancedResearchService };