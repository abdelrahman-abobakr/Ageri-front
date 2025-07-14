import { useState, useEffect, useCallback, useRef } from 'react';
import { adminService } from '../services';

/**
 * Custom hook for real-time statistics with automatic refresh
 * @param {string} statsType - Type of statistics to fetch ('dashboard', 'users', 'content', 'system')
 * @param {number} refreshInterval - Refresh interval in milliseconds (default: 30000 = 30 seconds)
 * @param {boolean} autoRefresh - Whether to auto-refresh (default: true)
 */
export const useRealTimeStats = (statsType = 'dashboard', refreshInterval = 30000, autoRefresh = true) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Map stats types to service methods
  const statsServices = {
    dashboard: adminService.getDashboardStats,
    users: adminService.getUserStats,
    content: adminService.getContentStats,
    system: adminService.getSystemHealth,
    research: adminService.getContentStats, // Reuse content stats for research
    services: adminService.getContentStats, // Reuse content stats for services
    training: adminService.getContentStats, // Reuse content stats for training
    organization: adminService.getContentStats, // Reuse content stats for organization
    notifications: adminService.getContentStats // Reuse content stats for notifications
  };

  const fetchStats = useCallback(async (showLoading = true) => {
    if (!mountedRef.current) return;

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const service = statsServices[statsType];
      if (!service) {
        throw new Error(`Unknown stats type: ${statsType}`);
      }

      const data = await service();
      
      if (mountedRef.current) {
        setStats(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error(`Failed to fetch ${statsType} stats:`, err);
      if (mountedRef.current) {
        setError(err.message || 'Failed to fetch statistics');
      }
    } finally {
      if (mountedRef.current && showLoading) {
        setLoading(false);
      }
    }
  }, [statsType]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchStats(false); // Don't show loading for manual refresh
  }, [fetchStats]);

  // Setup auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      fetchStats(false); // Background refresh without loading state
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchStats, refreshInterval, autoRefresh]);

  // Initial fetch
  useEffect(() => {
    fetchStats(true);
  }, [fetchStats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Pause/resume auto-refresh (useful for when component is not visible)
  const pauseAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resumeAutoRefresh = useCallback(() => {
    if (autoRefresh && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        fetchStats(false);
      }, refreshInterval);
    }
  }, [fetchStats, refreshInterval, autoRefresh]);

  return {
    stats,
    loading,
    error,
    lastUpdated,
    refresh,
    pauseAutoRefresh,
    resumeAutoRefresh
  };
};

/**
 * Hook for multiple stats types with unified loading state
 */
export const useMultipleStats = (statsTypes = ['dashboard'], refreshInterval = 30000) => {
  const [allStats, setAllStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAllStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const promises = statsTypes.map(async (type) => {
        const service = {
          dashboard: adminService.getDashboardStats,
          users: adminService.getUserStats,
          content: adminService.getContentStats,
          system: adminService.getSystemHealth
        }[type];

        if (!service) {
          throw new Error(`Unknown stats type: ${type}`);
        }

        const data = await service();
        return { type, data };
      });

      const results = await Promise.all(promises);
      const statsObject = {};
      
      results.forEach(({ type, data }) => {
        statsObject[type] = data;
      });

      setAllStats(statsObject);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch multiple stats:', err);
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, [statsTypes]);

  useEffect(() => {
    fetchAllStats();

    const interval = setInterval(fetchAllStats, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchAllStats, refreshInterval]);

  return {
    stats: allStats,
    loading,
    error,
    lastUpdated,
    refresh: fetchAllStats
  };
};

/**
 * Hook for real-time counters with smooth animations
 */
export const useAnimatedCounter = (targetValue, duration = 1000) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (targetValue === currentValue) return;

    setIsAnimating(true);
    const startValue = currentValue;
    const difference = targetValue - startValue;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const newValue = Math.round(startValue + (difference * easeOutQuart));
      
      setCurrentValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, currentValue, duration]);

  return { value: currentValue, isAnimating };
};

/**
 * Hook for percentage changes with trend indicators
 */
export const useTrendIndicator = (currentValue, previousValue) => {
  const [trend, setTrend] = useState({ direction: 'stable', percentage: 0, isPositive: true });

  useEffect(() => {
    if (!previousValue || previousValue === 0) {
      setTrend({ direction: 'stable', percentage: 0, isPositive: true });
      return;
    }

    const change = currentValue - previousValue;
    const percentage = Math.abs((change / previousValue) * 100);
    
    let direction = 'stable';
    let isPositive = true;

    if (change > 0) {
      direction = 'up';
      isPositive = true;
    } else if (change < 0) {
      direction = 'down';
      isPositive = false;
    }

    setTrend({
      direction,
      percentage: percentage.toFixed(1),
      isPositive,
      change: change.toFixed(0)
    });
  }, [currentValue, previousValue]);

  return trend;
};

export default useRealTimeStats;
