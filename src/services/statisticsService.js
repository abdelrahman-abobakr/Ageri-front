import apiClient, { publicApiClient } from './api';

export const statisticsService = {
  // Get public statistics for homepage (no auth required)
  getPublicStatistics: async () => {
    try {
      // Try to get real statistics from available endpoints
      const [
        publicationsResponse,
        coursesResponse,
        postsResponse,
        orgStatsResponse
      ] = await Promise.allSettled([
        publicApiClient.get('api/training/courses/'),
        publicApiClient.get('api/content/posts/'),
      ]);

      const stats = {
        researchers: 0,
        publications: 0,
        projects: 0,
        courses: 0
      };

      // Get organization stats (including researchers count)
      if (orgStatsResponse.status === 'fulfilled') {
        const orgData = orgStatsResponse.value.data;
        stats.researchers = orgData?.total_researchers || orgData?.researchers_count || 0;
      }

      // Get real data from other endpoints
      if (publicationsResponse.status === 'fulfilled') {
        const pubData = publicationsResponse.value.data;
        stats.publications = pubData?.count || pubData?.results?.length || 0;
      }
      
      if (coursesResponse.status === 'fulfilled') {
        const courseData = coursesResponse.value.data;
        stats.courses = courseData?.count || courseData?.results?.length || 0;
      }
      
      if (postsResponse.status === 'fulfilled') {
        const postData = postsResponse.value.data;
        stats.projects = postData?.count || postData?.results?.length || 0;
      }

      return stats;
    } catch (error) {
      return {
        researchers: 0,
        publications: 0,
        projects: 0,
        courses: 0
      };
    }
  },

  // Get detailed statistics for authenticated users
  getDetailedStatistics: async () => {
    try {
      const [
        usersStats,
        publicationsStats,
        coursesStats,
        servicesStats,
        organizationStats
      ] = await Promise.allSettled([
        apiClient.get('/auth/users/'),
        apiClient.get('/research/publications/statistics/'),
        apiClient.get('/training/api/courses/'),
        apiClient.get('/services/test-services/statistics/'),
        apiClient.get('/organization/stats/')
      ]);

      return {
        users: usersStats.status === 'fulfilled' ? usersStats.value.data : null,
        publications: publicationsStats.status === 'fulfilled' ? publicationsStats.value.data : null,
        courses: coursesStats.status === 'fulfilled' ? coursesStats.value.data : null,
        services: servicesStats.status === 'fulfilled' ? servicesStats.value.data : null,
        organization: organizationStats.status === 'fulfilled' ? organizationStats.value.data : null
      };
    } catch (error) {
      throw error;
    }
  },

  // Alternative: Try to get researchers count from a public endpoint
  getPublicResearchersCount: async () => {
    try {
      // Try different approaches to get researchers count
      const approaches = [
        () => publicApiClient.get('/public/researchers/count/'),
        () => publicApiClient.get('/auth/users/public/count/?role=researcher'),
        () => publicApiClient.get('/statistics/researchers/'),
      ];

      for (const approach of approaches) {
        try {
          const response = await approach();
          return response.data?.count || response.data?.total || 0;
        } catch (error) {
          continue; // Try next approach
        }
      }
      
      return 0; // No approach worked
    } catch (error) {
      return 0;
    }
  },

  // Alternative method using available statistics endpoints
  getPublicStatisticsAlternative: async () => {
    try {
      const [
        publicationsStatsResponse,
        servicesStatsResponse,
        researchStatsResponse
      ] = await Promise.allSettled([
        publicApiClient.get('/research/publications/statistics/'),
        publicApiClient.get('/services/test-services/statistics/'),
        publicApiClient.get('/services/requests/statistics/')
      ]);

      const stats = {
        researchers: 0,
        publications: 0,
        projects: 0,
        courses: 0
      };

      // Extract data from statistics endpoints
      if (publicationsStatsResponse.status === 'fulfilled') {
        const pubStats = publicationsStatsResponse.value.data;
        stats.publications = pubStats?.total_publications || pubStats?.count || 0;
        stats.researchers = pubStats?.total_authors || pubStats?.unique_authors || 0;
      }

      return stats;
    } catch (error) {
      return this.getPublicStatistics();
    }
  },
};
