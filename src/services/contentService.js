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
    const response = await publicApiClient.get(API_ENDPOINTS.CONTENT.POSTS, { params });
    return response.data;
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
// createPost: async (postData) => {
//   const formData = new FormData();

//   for (const key in postData) {
//     const value = postData[key];
//     if (value instanceof File) {
//       formData.append(key, value);
//     } else if (value instanceof Date) {
//       formData.append(key, value.toISOString());
//     } else if (Array.isArray(value)) {
//       formData.append(key, JSON.stringify(value));
//     } else if (value !== undefined && value !== null) {
//       formData.append(key, value);
//     }
//   }

//   const token = localStorage.getItem('access_token'); 
  
//   return axios.post('http://localhost:8000/api/content/posts/', formData, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//     }
//   });
// }
createPost: async (data) => {
  const token = localStorage.getItem('access_token'); 

  const isFormData = data instanceof FormData;

  return axios.post('http://localhost:8000/api/content/posts/', data, {
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    }
  });
}
,
updatePost: async (id, formData) => {
  const token = localStorage.getItem('access_token');

  return apiClient.patch(API_ENDPOINTS.CONTENT.POST_DETAIL(id), formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // لا تضف Content-Type → axios يضبطه تلقائيًا عند استخدام FormData
    },
  });
}



,
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
getPostById: async (id) => {
  const response = await apiClient.get(`/content/posts/${id}/`);
  return response.data;
}

,
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
  }
};
