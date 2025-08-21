import apiClient from './api';
import axios from 'axios';
import { API_ENDPOINTS, API_CONFIG } from '../constants';

// Create a separate axios instance for public API calls (no auth required)
const publicApiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

export const contentService = {
  // Public Announcements (for guests - no auth required)
  getPublicAnnouncements: async (params = {}) => {
    try {
      const response = await publicApiClient.get(API_ENDPOINTS.CONTENT.ANNOUNCEMENTS, { params });
      return response.data;
    } catch (error) {
      // If public access fails, try with auth (for logged-in users)
      if (error.response?.status === 401) {
        const response = await apiClient.get(API_ENDPOINTS.CONTENT.ANNOUNCEMENTS, { params });
        return response.data;
      }
      throw error;
    }
  },

  // Announcements (authenticated)
  getAnnouncements: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.CONTENT.ANNOUNCEMENTS, { params });
    return response.data;
  },

  createAnnouncement: async (announcementData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CONTENT.ANNOUNCEMENTS, announcementData);
      return response.data;
    } catch (error) {
      throw error;

    }
  },

  getAnnouncementById: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CONTENT.ANNOUNCEMENT_DETAIL(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Public announcement details (for guests - no auth required)
  getPublicAnnouncementById: async (id) => {
    try {
      const response = await publicApiClient.get(API_ENDPOINTS.CONTENT.ANNOUNCEMENT_DETAIL(id));
      return response.data;
    } catch (error) {
      // If public access fails, try with auth (for logged-in users)
      if (error.response?.status === 401) {
        const response = await apiClient.get(API_ENDPOINTS.CONTENT.ANNOUNCEMENT_DETAIL(id));
        return response.data;
      }
      throw error;
    }
  },

  updateAnnouncement: async (id, announcementData) => {
    const response = await apiClient.put(API_ENDPOINTS.CONTENT.ANNOUNCEMENT_DETAIL(id), announcementData);
    return response.data;
  },

  deleteAnnouncement: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.CONTENT.ANNOUNCEMENT_DETAIL(id));
    return response.data;
  },

  // Public Posts (for guests - no auth required)
  getPublicPosts: async (params = {}) => {
    try {
      const response = await publicApiClient.get(API_ENDPOINTS.CONTENT.POSTS, { params });
      return response.data;
    } catch (error) {
      // If public access fails, try with auth (for logged-in users)
      if (error.response?.status === 401) {
        const response = await apiClient.get(API_ENDPOINTS.CONTENT.POSTS, { params });
        return response.data;
      }
      throw error;
    }
  },

  // Posts (authenticated)
  getPosts: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.CONTENT.POSTS, { params });
    return response.data;
  },

  // Moderator's own posts
  getMyPosts: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.CONTENT.MY_POSTS, { params });
    return response.data;
  },
  createPost: async (formData) => {
    try {
      // Don't set any headers for FormData - let axios handle it automatically
      const response = await apiClient.post(API_ENDPOINTS.CONTENT.POSTS, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createPostJSON: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CONTENT.POSTS, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // If no ID in response, try to get it from Location header or fetch the latest post
      if (!response.data.id) {
        // Try to extract ID from Location header
        const locationHeader = response.headers.location;
        if (locationHeader) {
          const idMatch = locationHeader.match(/\/(\d+)\/$/);
          if (idMatch) {
            const extractedId = parseInt(idMatch[1]);
            return { ...response.data, id: extractedId };
          }
        }
        // Fallback: search for the post by title
        try {
          const searchResponse = await apiClient.get(API_ENDPOINTS.CONTENT.POSTS, {
            params: {
              search: data.title,
              ordering: '-created_at',
              page_size: 5
            }
          });

          if (searchResponse.data.results && searchResponse.data.results.length > 0) {
            // Find the exact match by title
            const exactMatch = searchResponse.data.results.find(post =>
              post.title === data.title &&
              post.content === data.content
            );

            if (exactMatch) {
              return { ...response.data, id: exactMatch.id };
            }

            // If no exact match, take the first result (most recent)
            const latestPost = searchResponse.data.results[0];
            return { ...response.data, id: latestPost.id };
          }
        } catch (searchError) {
          throw searchError;
        }
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updatePost: async (id, data) => {
    const token = localStorage.getItem('access_token');

    try {
      const isFormData = data instanceof FormData;

      if (isFormData) {
        // Try using axios.putForm which is specifically for multipart uploads
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Convert FormData to plain object for putForm
        const formObject = {};
        for (let [key, value] of data.entries()) {
          formObject[key] = value;
        }

        const response = await apiClient.putForm(API_ENDPOINTS.CONTENT.POST_DETAIL(id), formObject, config);
        return response.data;
      } else {
        // Handle JSON data with PATCH
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };
        const response = await apiClient.patch(API_ENDPOINTS.CONTENT.POST_DETAIL(id), data, config);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },
  patchPost: async (id, data) => {
    const token = localStorage.getItem('access_token');

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await apiClient.patch(API_ENDPOINTS.CONTENT.POST_DETAIL(id), data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },



  // Delete post/event
  deletePost: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.CONTENT.POST_DETAIL(id));
    return response.data;
  },

  // Get events
  getEvents: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.CONTENT.EVENTS, { params });
    return response.data;
  },

  // Get featured posts for home page
  getFeaturedPosts: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.CONTENT.FEATURED, { params });
    return response.data;
  },

  // Comments
  getPostComments: async (postId) => {
    const response = await apiClient.get(API_ENDPOINTS.CONTENT.POST_COMMENTS(postId));
    return response.data;
  },

  addComment: async (postId, commentData) => {
    const response = await apiClient.post(API_ENDPOINTS.CONTENT.POST_COMMENTS(postId), commentData);
    return response.data;
  },

  updateComment: async (commentId, commentData) => {
    const response = await apiClient.put(API_ENDPOINTS.CONTENT.COMMENT_DETAIL(commentId), commentData);
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await apiClient.delete(API_ENDPOINTS.CONTENT.COMMENT_DETAIL(commentId));
    return response.data;
  },

  // Combined public content feed (announcements + posts for homepage)
  getPublicContentFeed: async (params = {}) => {
    try {
      // Fetch both announcements and posts in parallel
      const [announcementsResponse, postsResponse] = await Promise.allSettled([
        contentService.getPublicAnnouncements(params),
        contentService.getPublicPosts(params)
      ]);

      const announcements = announcementsResponse.status === 'fulfilled'
        ? (announcementsResponse.value.results || []).map(item => ({ ...item, type: 'announcement' }))
        : [];

      const posts = postsResponse.status === 'fulfilled'
        ? (postsResponse.value.results || []).map(item => ({ ...item, type: 'post' }))
        : [];

      // Combine and sort by creation date (newest first)
      const combinedContent = [...announcements, ...posts]
        .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));

      return {
        results: combinedContent,
        count: combinedContent.length
      };
    } catch (error) {
      return { results: [], count: 0 };
    }
  },

  // Content Management Methods
  publishContent: async (id, type = 'announcement') => {
    try {
      const endpoint = type === 'announcement'
        ? API_ENDPOINTS.CONTENT.ANNOUNCEMENT_DETAIL(id)
        : API_ENDPOINTS.CONTENT.POST_DETAIL(id);

      const response = await apiClient.patch(endpoint, {
        status: 'published',
        published_at: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  unpublishContent: async (id, type = 'announcement') => {
    try {
      const endpoint = type === 'announcement'
        ? API_ENDPOINTS.CONTENT.ANNOUNCEMENT_DETAIL(id)
        : API_ENDPOINTS.CONTENT.POST_DETAIL(id);

      const response = await apiClient.patch(endpoint, {
        status: 'draft',
        published_at: null
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteContent: async (id, type = 'announcement') => {
    try {
      const endpoint = type === 'announcement'
        ? API_ENDPOINTS.CONTENT.ANNOUNCEMENT_DETAIL(id)
        : API_ENDPOINTS.CONTENT.POST_DETAIL(id);

      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Combined content for admin management
  getAllContent: async (params = {}) => {
    try {
      const [announcements, posts] = await Promise.allSettled([
        contentService.getAnnouncements(params),
        contentService.getPosts(params)
      ]);

      const announcementResults = announcements.status === 'fulfilled'
        ? announcements.value.results || []
        : [];
      const postResults = posts.status === 'fulfilled'
        ? posts.value.results || []
        : [];

      const allContent = [
        ...announcementResults.map(item => ({ ...item, type: 'announcement' })),
        ...postResults.map(item => ({ ...item, type: 'post' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return {
        results: allContent,
        count: allContent.length,
        next: null,
        previous: null
      };
    } catch (error) {
      return {
        results: [],
        count: 0,
        next: null,
        previous: null
      };
    }
  },
  // Content statistics
  getContentStats: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.PUBLICATIONS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getPostById: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CONTENT.POST_DETAIL(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin-specific method to get post details with elevated permissions
  getPostByIdForAdmin: async (id) => {
    try {
      // First try the regular endpoint
      const response = await apiClient.get(API_ENDPOINTS.CONTENT.POST_DETAIL(id));
      return response.data;
    } catch (error) {

      // If 403 or 404, try alternative approaches
      if (error.response?.status === 403 || error.response?.status === 404) {
        try {
          const listResponse = await apiClient.get(API_ENDPOINTS.CONTENT.POSTS, {
            params: {
              search: id,  // Try searching by ID
              page_size: 100  // Get more results to find the post
            }
          });

          if (listResponse.data.results && listResponse.data.results.length > 0) {
            // Find the exact post by ID
            const post = listResponse.data.results.find(p => p.id === parseInt(id));
            if (post) {
              return post;
            }
          }

          // If not found by search, try getting all posts and filter
          const allPostsResponse = await apiClient.get(API_ENDPOINTS.CONTENT.POSTS, {
            params: { page_size: 1000 }  // Get a large number of posts
          });

          if (allPostsResponse.data.results) {
            const post = allPostsResponse.data.results.find(p => p.id === parseInt(id));
            if (post) {
              return post;
            }
          }

        } catch (listError) {
          throw listError;
        }
      }

      throw error;
    }
  },

  // Public post details (for guests - no auth required)
  getPublicPost: async (id) => {
    try {

      // Check if user is logged in first
      const token = localStorage.getItem('access_token');

      if (token) {
        // If user is logged in, try authenticated endpoint first
        try {
          const response = await apiClient.get(API_ENDPOINTS.CONTENT.POST_DETAIL(id));
          return response.data;
        } catch (authError) {
          // Continue to public endpoint if auth fails
        }
      }

      // Try public endpoint
      const response = await publicApiClient.get(API_ENDPOINTS.CONTENT.POST_DETAIL(id));
      return response.data;
    } catch (error) {

      // If public access fails and we haven't tried auth yet, try with auth
      const token = localStorage.getItem('access_token');
      if (error.response?.status === 500 && token) {
        try {
          const response = await apiClient.get(API_ENDPOINTS.CONTENT.POST_DETAIL(id));
          return response.data;
        } catch (authError) {
          throw authError;
        }
      }

      // For other errors, throw the original error
      throw error;
    }
  },

  // Add this method to get statistics
  getStatistics: async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await apiClient.get('/statistics/', config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add method to get public statistics (no auth required)
  getPublicStatistics: async () => {
    try {
      const response = await apiClient.get('/public/statistics/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * رفع صورة جديدة للبوست
   * @param {number|string} postId
   * @param {FormData} formData
   */
  uploadPostImage: async (postId, formData) => {
    try {

      const response = await apiClient.post(`/api/content/posts/${postId}/images/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * حذف صورة من البوست
   * @param {number|string} postId
   * @param {number|string} imageId
   */
  deletePostImage: async (postId, imageId) => {
    try {
      const response = await apiClient.delete(`/api/content/posts/${postId}/images/${imageId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};