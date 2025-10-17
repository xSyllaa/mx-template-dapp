import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from 'lib/supabase/client';
import { getUserRank } from '../services/leaderboardService';
import type { UserRankInfo, LeaderboardFilters } from '../types';

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
  const memoizedFilters = useMemo(() => filters, [
    filters.type,
    filters.week,
    filters.month,
    filters.year,
    JSON.stringify(filters.sourceTypes || [])
  ]);

  // Fetch user rank
  const fetchRank = useCallback(async () => {
    if (!userId) {
      console.log('👤 [useUserRank] No userId, skipping fetch');
      setLoading(false);
      setRank(null);
      return;
    }

    const fetchKey = `${userId}-${JSON.stringify(memoizedFilters)}`;
    
    // Prevent duplicate fetches
    if (lastFetchRef.current === fetchKey) {
      console.log('🔄 [useUserRank] Skipping duplicate fetch:', fetchKey);
      return;
    }

    try {
      console.log('👤 [useUserRank] Fetching user rank:', { userId, filters: memoizedFilters });
      setLoading(true);
      setError(null);
      lastFetchRef.current = fetchKey;

      const data = await getUserRank(userId, memoizedFilters);
      console.log('👤 [useUserRank] Received rank data:', data);
      setRank(data);
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

    console.log('🔔 [useUserRank] Setting up real-time subscription for user:', userId);
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
          console.log('🔔 [useUserRank] Real-time update received:', payload);
          // Debounce: wait 2s before refreshing
          setTimeout(() => {
            lastFetchRef.current = ''; // Force refresh
            fetchRank();
          }, 2000);
        }
      )
      .subscribe();

    return () => {
      console.log('🔔 [useUserRank] Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, enableRealtime, memoizedFilters.type]); // Only depend on type, not full filters

  return {
    rank,
    loading,
    error,
    refresh: fetchRank
  };
};

