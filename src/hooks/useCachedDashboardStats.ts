/**
 * Cached Dashboard Stats Hook
 *
 * Provides dashboard statistics with caching and manual refresh
 * Uses the existing caching logic from useDashboardStats
 */
import { useDashboardStats } from './useDashboardStats';

export const useCachedDashboardStats = () => {
  const statsHook = useDashboardStats();

  return {
    stats: statsHook.stats,
    loading: statsHook.loading,
    error: statsHook.error,
    refetch: statsHook.refresh,
    isRefetching: statsHook.loading,
    lastUpdated: statsHook.loading ? null : new Date(),
  };
};
