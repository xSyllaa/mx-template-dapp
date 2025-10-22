/**
 * Cached Weekly Streak Hook
 *
 * Provides weekly streak data with 5-minute cache and manual refresh
 */
import { useQuery } from '@tanstack/react-query';
import { useWeeklyStreak } from './useWeeklyStreak';

export const useCachedWeeklyStreak = () => {
  const streakHook = useWeeklyStreak();

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['weeklyStreak'],
    queryFn: () => streakHook.refetch(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    streak: streakHook.streak,
    loading: isLoading,
    error: error || streakHook.error,
    refetch,
    isRefetching,
    lastUpdated: data ? new Date() : null,
  };
};
