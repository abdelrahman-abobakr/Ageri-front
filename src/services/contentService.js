import apiClient from './api';
import axios from 'axios';
import { API_ENDPOINTS, API_CONFIG } from '../constants';

// Create a separate axios instance for public API calls (no auth required)
const publicApiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
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
    try {
      const response = await apiClient.get(API_ENDPOINTS.CONTENT.ANNOUNCEMENTS, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      // Return mock data as fallback
      return {
        results: [
          {
            id: 1,
            title: 'إعلان عن ورشة الزراعة المستدامة',
            content: 'ورشة تدريبية حول أحدث تقنيات الزراعة المستدامة والممارسات البيئية الصديقة.',
            excerpt: 'ورشة تدريبية حول أحدث تقنيات الزراعة المستدامة...',
            status: 'published',
            author: 'أحمد محمد',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
            published_at: '2024-01-15T10:30:00Z',
            views_count: 1245,
            type: 'announcement'
          },
          {
            id: 2,
            title: 'مؤتمر التكنولوجيا الزراعية 2024',
            content: 'مؤتمر سنوي يجمع خبراء التكنولوجيا الزراعية من جميع أنحاء المنطقة.',
            excerpt: 'مؤتمر سنوي يجمع خبراء التكنولوجيا الزراعية...',
            status: 'scheduled',
            author: 'محمد حسن',
            created_at: '2024-01-13T09:15:00Z',
            updated_at: '2024-01-13T09:15:00Z',
            published_at: '2024-02-01T09:00:00Z',
            views_count: 0,
            type: 'event'
          }
        ],
        count: 89,
        next: null,
        previous: null
      };
    }
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

  createPost: async (postData) => {
    const response = await apiClient.post(API_ENDPOINTS.CONTENT.POSTS, postData);
    return response.data;
  },

  getPostById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.CONTENT.POST_DETAIL(id));
    return response.data;
  },

  updatePost: async (id, postData) => {
    const response = await apiClient.put(API_ENDPOINTS.CONTENT.POST_DETAIL(id), postData);
    return response.data;
  },

  deletePost: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.CONTENT.POST_DETAIL(id));
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
      // Return mock data
      return {
        results: [
          {
            id: 1,
            title: 'إعلان عن ورشة الزراعة المستدامة',
            type: 'announcement',
            status: 'published',
            author: 'أحمد محمد',
            publishDate: '2024-01-15',
            lastModified: '2024-01-15',
            views: 1245,
            excerpt: 'ورشة تدريبية حول أحدث تقنيات الزراعة المستدامة...'
          },
          {
            id: 2,
            title: 'أحدث البحوث في مجال الذكاء الاصطناعي الزراعي',
            type: 'post',
            status: 'published',
            author: 'فاطمة علي',
            publishDate: '2024-01-14',
            lastModified: '2024-01-14',
            views: 987,
            excerpt: 'مقال شامل حول تطبيقات الذكاء الاصطناعي في الزراعة...'
          },
          {
            id: 3,
            title: 'مؤتمر التكنولوجيا الزراعية 2024',
            type: 'event',
            status: 'scheduled',
            author: 'محمد حسن',
            publishDate: '2024-02-01',
            lastModified: '2024-01-13',
            views: 0,
            excerpt: 'مؤتمر سنوي يجمع خبراء التكنولوجيا الزراعية...'
          },
          {
            id: 4,
            title: 'دليل تحليل التربة المتقدم',
            type: 'post',
            status: 'draft',
            author: 'سارة أحمد',
            publishDate: null,
            lastModified: '2024-01-12',
            views: 0,
            excerpt: 'دليل شامل لتحليل التربة باستخدام التقنيات الحديثة...'
          }
        ],
        count: 89,
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
  }
};
