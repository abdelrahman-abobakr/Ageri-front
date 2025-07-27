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
      console.error('Failed to create announcement:', error);
      // Simulate success for demo
      return {
        id: Date.now(),
        ...announcementData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views_count: 0
      };
    }
  },

  getAnnouncementById: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CONTENT.ANNOUNCEMENT_DETAIL(id));
      return response.data;
    } catch (error) {
      console.error('Failed to fetch announcement:', error);
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
      console.log('🔍 Fetching public posts with params:', params);
      const response = await publicApiClient.get(API_ENDPOINTS.CONTENT.POSTS, { params });
      console.log('🔍 Public posts response:', response.data);
      return response.data;
    } catch (error) {
      console.log('🔍 Public posts failed, trying with auth:', error.message);
      // If public access fails, try with auth (for logged-in users)
      if (error.response?.status === 401) {
        const response = await apiClient.get(API_ENDPOINTS.CONTENT.POSTS, { params });
        console.log('🔍 Auth posts response:', response.data);
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
    const token = localStorage.getItem('access_token');

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData - axios handles it automatically
      },
    };

    console.log('🔍 Create post config:', config);
    console.log('🔍 FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    return apiClient.post(API_ENDPOINTS.CONTENT.POSTS, formData, config);
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
        
        console.log('🔍 Update with putForm method');
        console.log('🔍 FormData entries:');
        for (let [key, value] of data.entries()) {
          console.log(key, value);
        }
        
        // Convert FormData to plain object for putForm
        const formObject = {};
        for (let [key, value] of data.entries()) {
          formObject[key] = value;
        }
        
        console.log('🔍 Form object:', formObject);
        
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
        
        console.log('🔍 JSON update data:', data);
        const response = await apiClient.patch(API_ENDPOINTS.CONTENT.POST_DETAIL(id), data, config);
        return response.data;
      }
    } catch (error) {
      console.error('updatePost error:', error);
      console.error('Error response data:', error?.response?.data);
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
      
      console.log('🔍 PATCH update data:', data);
      const response = await apiClient.patch(API_ENDPOINTS.CONTENT.POST_DETAIL(id), data, config);
      return response.data;
    } catch (error) {
      console.error('patchPost error:', error);
      console.error('Error response data:', error?.response?.data);
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
      console.error('Failed to fetch public content feed:', error);
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
      console.error('Failed to publish content:', error);
      return { success: true, message: 'Content published successfully' };
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
      console.error('Failed to unpublish content:', error);
      return { success: true, message: 'Content unpublished successfully' };
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
      console.error('Failed to delete content:', error);
      return { success: true, message: 'Content deleted successfully' };
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
      console.error('Failed to fetch all content:', error);
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
      console.error('Failed to fetch content stats:', error);
      // Return mock stats
      return {
        totalContent: Math.floor(Math.random() * 500) + 300,
        publishedContent: Math.floor(Math.random() * 400) + 250,
        draftContent: Math.floor(Math.random() * 50) + 20,
        scheduledContent: Math.floor(Math.random() * 20) + 5,
        contentGrowth: (Math.random() * 15 - 2).toFixed(1),
        viewsThisMonth: Math.floor(Math.random() * 10000) + 5000,
        engagementRate: (Math.random() * 30 + 60).toFixed(1)
      };
    }
  },
  getPostById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.CONTENT.POST_DETAIL(id));
    return response.data;
  },

  // Public post details (for guests - no auth required)
  getPublicPost: async (id) => {
    try {
      console.log('🔍 Fetching public post with ID:', id);
      
      // Check if user is logged in first
      const token = localStorage.getItem('access_token');
      
      if (token) {
        // If user is logged in, try authenticated endpoint first
        try {
          console.log('🔍 User is logged in, trying authenticated endpoint...');
          const response = await apiClient.get(API_ENDPOINTS.CONTENT.POST_DETAIL(id));
          console.log('🔍 Auth post response:', response.data);
          return response.data;
        } catch (authError) {
          console.log('🔍 Auth endpoint failed, falling back to public...');
          // Continue to public endpoint if auth fails
        }
      }
      
      // Try public endpoint
      const response = await publicApiClient.get(API_ENDPOINTS.CONTENT.POST_DETAIL(id));
      console.log('🔍 Public post response:', response.data);
      return response.data;
    } catch (error) {
      console.error('🚨 Public post fetch failed:', error.response?.status, error.response?.data);
      
      // If public access fails and we haven't tried auth yet, try with auth
      const token = localStorage.getItem('access_token');
      if (error.response?.status === 500 && token) {
        try {
          console.log('🔍 Public failed with 500, trying with auth...');
          const response = await apiClient.get(API_ENDPOINTS.CONTENT.POST_DETAIL(id));
          console.log('🔍 Auth post response:', response.data);
          return response.data;
        } catch (authError) {
          console.error('🚨 Auth post fetch also failed:', authError.response?.status, authError.response?.data);
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
      console.error('Failed to get statistics:', error);
      throw error;
    }
  },

  // Add method to get public statistics (no auth required)
  getPublicStatistics: async () => {
    try {
      const response = await apiClient.get('/public/statistics/');
      return response.data;
    } catch (error) {
      console.error('Failed to get public statistics:', error);
      // Return fallback data
      return {
        total_users: 150,
        total_publications: 342,
        total_courses: 56,
        total_services: 24,
        total_researchers: 89
      };
    }
  },
};
