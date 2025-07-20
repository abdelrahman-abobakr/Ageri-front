import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { researchService, trainingService, servicesService } from '../services';
import { USER_ROLES } from '../constants';

export const useResearcherStats = () => {
  const [stats, setStats] = useState({
    publications: 0,
    enrolledCourses: 0,
    serviceRequests: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user } = useSelector((state) => state.auth);

  const fetchResearcherStats = async () => {
    if (!user || user.role !== USER_ROLES.RESEARCHER) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all stats in parallel
      const [publicationsResponse, enrollmentsResponse, requestsResponse] = await Promise.allSettled([
        // Get user's publications - we'll filter on the frontend for now
        researchService.getPublications(),
        // Get user's course enrollments
        trainingService.getMyEnrollments(),
        // Get user's service requests
        servicesService.getMyRequests(),
      ]);

      const newStats = {
        publications: 0,
        enrolledCourses: 0,
        serviceRequests: 0,
      };

      // Handle publications
      if (publicationsResponse.status === 'fulfilled') {
        const publications = publicationsResponse.value.results || publicationsResponse.value || [];
        // Filter publications by current user (assuming publications have an author field or similar)
        const userPublications = publications.filter(pub =>
          pub.authors?.some(author => author.id === user.id || author.user === user.id) ||
          pub.created_by === user.id ||
          pub.author === user.id
        );
        newStats.publications = userPublications.length;
      } else {
        console.warn('Failed to fetch publications:', publicationsResponse.reason);
      }

      // Handle enrollments
      if (enrollmentsResponse.status === 'fulfilled') {
        newStats.enrolledCourses = enrollmentsResponse.value.results?.length || enrollmentsResponse.value.length || 0;
      } else {
        console.warn('Failed to fetch enrollments:', enrollmentsResponse.reason);
      }

      // Handle service requests
      if (requestsResponse.status === 'fulfilled') {
        newStats.serviceRequests = requestsResponse.value.results?.length || requestsResponse.value.length || 0;
      } else {
        console.warn('Failed to fetch service requests:', requestsResponse.reason);
      }

      setStats(newStats);
    } catch (err) {
      console.error('Error fetching researcher stats:', err);
      setError(err.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearcherStats();
  }, [user?.id]);

  return {
    stats,
    loading,
    error,
    refetch: fetchResearcherStats,
  };
};
