/**
 * Cached Leaderboard Hook
 *
 * Provides leaderboard data with 5-minute cache and manual refresh
 */
import { useQuery } from '@tanstack/react-query';
import {
  getCurrentWeekNumber,
  getCurrentMonth,
  getCurrentYear
} from '../services/leaderboardService';

export const useCachedLeaderboard = (period: 'all_time' | 'weekly' | 'monthly' = 'all_time') => {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      // Import the service dynamically to avoid circular dependencies
      const { getLeaderboard } = await import('../services/leaderboardService');

      return getLeaderboard({
        type: period,
        // For weekly and monthly, we need current period info
        ...(period === 'weekly' && {
          week: getCurrentWeekNumber(),
          year: getCurrentYear()
        }),
        ...(period === 'monthly' && {
          month: getCurrentMonth(),
          year: getCurrentYear()
        }),
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    leaderboard: data || [],
    loading: isLoading,
    error,
    refetch,
    isRefetching,
    lastUpdated: data ? new Date() : null,
  };
};
