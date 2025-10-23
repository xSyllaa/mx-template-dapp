import { useState, useEffect, useCallback } from 'react';
import type { Prediction } from '../types';
import {
  getActivePredictions,
  getRecentHistory,
  getAllPredictions
} from '../services/predictionService';

export type PredictionFilter = 'active' | 'history' | 'all';

interface UsePredictionsReturn {
  predictions: Prediction[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

/**
 * Custom hook to fetch and manage predictions
 * @param filter - Type of predictions to fetch ('active', 'history', 'all')
 * @param limit - Number of items per page for history (default: 10)
 */
export const usePredictions = (
  filter: PredictionFilter = 'active',
  limit = 10
): UsePredictionsReturn => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPredictions = useCallback(
    async (isLoadMore = false, currentOffset = 0) => {
      try {
        if (!isLoadMore) {
          setLoading(true);
          setError(null);
        }

        let data: Prediction[] = [];

        switch (filter) {
          case 'active':
            data = await getActivePredictions();
            setHasMore(false); // Active predictions don't paginate
            break;

          case 'history':
            data = await getRecentHistory(limit, currentOffset);
            setHasMore(data.length === limit);
            break;

          case 'all':
            data = await getAllPredictions();
            setHasMore(false); // All predictions don't paginate
            break;
        }

        if (isLoadMore) {
          setPredictions((prev) => {
            // Avoid duplicates by filtering out existing IDs
            const existingIds = new Set(prev.map(p => p.id));
            const newData = data.filter(p => !existingIds.has(p.id));
            return [...prev, ...newData];
          });
        } else {
          setPredictions(data);
        }
      } catch (err) {
        console.error('[usePredictions] Error fetching predictions:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [filter, limit]
  );

  // Initial fetch
  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  // Refresh function
  const refresh = useCallback(async () => {
    setOffset(0);
    await fetchPredictions(false);
  }, [fetchPredictions]);

  // Load more function (for history pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    const newOffset = offset + limit;
    setOffset(newOffset);
    await fetchPredictions(true, newOffset);
  }, [hasMore, loading, offset, limit, fetchPredictions]);

  return {
    predictions,
    loading,
    error,
    refresh,
    loadMore,
    hasMore
  };
};

