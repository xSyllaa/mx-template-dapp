/**
 * Cached Predictions Hook
 *
 * Provides predictions data with 5-minute cache and manual refresh
 */
import { useQuery } from '@tanstack/react-query';
import { usePredictions } from './usePredictions';

export const useCachedPredictions = () => {
  const predictionsHook = usePredictions();

  // Use TanStack Query with 5-minute cache for predictions
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => predictionsHook.refetch(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    predictions: predictionsHook.predictions,
    loading: isLoading,
    error: error || predictionsHook.error,
    refetch,
    isRefetching,
    lastUpdated: data ? new Date() : null,
  };
};
