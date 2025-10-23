import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from 'lib/supabase/client';
import { getUserRank } from '../services/leaderboardService';
import type { UserRankInfo, LeaderboardFilters } from '../types';

// Debug logs are centralized in useLeaderboard; keep this hook quiet

interface UseUserRankReturn {
  rank: UserRankInfo | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook to fetch and track user's rank in real-time
 * @param userId - User's UUID (can be null if not logged in)
 * @param filters - Leaderboard filters
 * @param enableRealtime - Whether to subscribe to real-time updates (default: true)
 */
export const useUserRank = (
  userId: string | null,
  filters: LeaderboardFilters,
  enableRealtime = true
): UseUserRankReturn => {
  const [rank, setRank] = useState<UserRankInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchRef = useRef<string>('');

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => {
    return {
      type: filters.type,
      week: filters.week,
      month: filters.month,
      year: filters.year,
      sourceTypes: filters.sourceTypes
    };
  }, [
    filters.type,
    filters.week,
    filters.month,
    filters.year,
    // Use stable reference for sourceTypes
    filters.sourceTypes?.join(',') ?? ''
  ]);

  // Fetch user rank
  const fetchRank = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setRank(null);
      setError(null);
      return;
    }

    const fetchKey = `${userId}-${JSON.stringify(memoizedFilters)}`;
    
    // Prevent duplicate fetches
    if (lastFetchRef.current === fetchKey) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      lastFetchRef.current = fetchKey;

      const data = await getUserRank(userId, memoizedFilters);
      
      // Handle case where getUserRank returns null (user not ranked)
      if (data === null) {
        console.log('[useUserRank] User not ranked yet for filters:', memoizedFilters);
        setRank(null);
        setError(null); // This is not an error, just no rank data
      } else {
        setRank(data);
      }
    } catch (err) {
      console.error('[useUserRank] Error fetching user rank:', err);
      setError(err as Error);
      setRank(null);
      lastFetchRef.current = ''; // Reset on error to allow retry
    } finally {
      setLoading(false);
    }
  }, [userId, memoizedFilters]);

  // Initial fetch
  useEffect(() => {
    fetchRank();
  }, [fetchRank]);

  // Real-time subscription
  useEffect(() => {
    if (!enableRealtime || !userId) return;

    const channel = supabase
      .channel(`user-rank-${userId}-${memoizedFilters.type}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'points_transactions'
        },
        (payload) => {
          // Debounce: wait 1s before refreshing
          setTimeout(() => {
            lastFetchRef.current = ''; // Force refresh
            fetchRank();
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, enableRealtime, memoizedFilters.type, fetchRank]);

  return {
    rank,
    loading,
    error,
    refresh: fetchRank
  };
};

