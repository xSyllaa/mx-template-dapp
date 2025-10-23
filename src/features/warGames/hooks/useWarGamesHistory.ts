import { useState, useEffect, useCallback } from 'react';
import { warGamesAPI } from 'api/wargames';
import type { WarGameWithDetails } from '../types';

export const useWarGamesHistory = (userId?: string | null, limit = 10) => {
  const [warGames, setWarGames] = useState<WarGameWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchHistory = useCallback(async (isLoadMore = false, currentOffset = 0) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      if (!isLoadMore) {
        setLoading(true);
        setError(null);
      }

      const response = await warGamesAPI.getHistory(
        undefined, // No status filter (get all)
        userId,
        limit,
        currentOffset
      );

      if (!response.success || !response.data) {
        throw new Error('Invalid war games response');
      }

      const data = response.data.warGames;

      if (isLoadMore) {
        setWarGames(prev => {
          // Avoid duplicates by filtering out existing IDs
          const existingIds = new Set(prev.map(g => g.id));
          const newData = data.filter(g => !existingIds.has(g.id));
          return [...prev, ...newData];
        });
      } else {
        setWarGames(data);
      }

      setHasMore(response.data.hasMore);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    const newOffset = offset + limit;
    setOffset(newOffset);
    await fetchHistory(true, newOffset);
  }, [hasMore, loading, offset, limit, fetchHistory]);

  const refresh = useCallback(async () => {
    setOffset(0);
    await fetchHistory(false);
  }, [fetchHistory]);

  return { warGames, loading, error, hasMore, loadMore, refresh };
};
