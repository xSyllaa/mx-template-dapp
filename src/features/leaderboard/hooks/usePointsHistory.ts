import { useState, useEffect, useCallback } from 'react';
import { getUserPointsHistory } from '../services/leaderboardService';
import type { PointsTransaction } from '../types';

interface UsePointsHistoryReturn {
  transactions: PointsTransaction[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

/**
 * Custom hook to fetch user's points transaction history
 * @param userId - User's UUID (can be null if not logged in)
 * @param initialLimit - Initial number of transactions to fetch (default: 20)
 */
export const usePointsHistory = (
  userId: string | null,
  initialLimit = 20
): UsePointsHistoryReturn => {
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Fetch transaction history
  const fetchHistory = useCallback(
    async (reset = false) => {
      if (!userId) {
        setLoading(false);
        setTransactions([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const currentOffset = reset ? 0 : offset;
        const data = await getUserPointsHistory(
          userId,
          initialLimit,
          currentOffset
        );

        if (reset) {
          setTransactions(data);
          setOffset(initialLimit);
        } else {
          setTransactions((prev) => [...prev, ...data]);
          setOffset((prev) => prev + initialLimit);
        }

        // Check if there are more transactions
        setHasMore(data.length === initialLimit);
      } catch (err) {
        console.error('[usePointsHistory] Error fetching history:', err);
        setError(err as Error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    [userId, offset, initialLimit]
  );

  // Initial fetch
  useEffect(() => {
    fetchHistory(true);
  }, [userId, initialLimit]); // Only re-fetch on userId/initialLimit change

  // Load more transactions
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchHistory(false);
  }, [hasMore, loading, fetchHistory]);

  // Refresh (reset to first page)
  const refresh = useCallback(async () => {
    setOffset(0);
    await fetchHistory(true);
  }, [fetchHistory]);

  return {
    transactions,
    loading,
    error,
    refresh,
    loadMore,
    hasMore
  };
};

