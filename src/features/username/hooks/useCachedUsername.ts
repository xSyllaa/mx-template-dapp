/**
 * Cached Username Hook
 *
 * Provides username data with 5-minute cache and manual refresh
 */
import { useQuery } from '@tanstack/react-query';
import { useUsername } from './useUsername';

export const useCachedUsername = () => {
  const usernameHook = useUsername();

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['username'],
    queryFn: () => usernameHook.refetch(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    username: usernameHook.username,
    loading: isLoading,
    error: error || usernameHook.error,
    refetch,
    isRefetching,
    lastUpdated: data ? new Date() : null,
  };
};
