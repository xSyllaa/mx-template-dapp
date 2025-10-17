import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from 'lib/supabase/client';
import { getLeaderboard } from '../services/leaderboardService';
import type { LeaderboardEntry, LeaderboardFilters } from '../types';

interface UseLeaderboardReturn {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook to fetch and subscribe to leaderboard updates
 * @param filters - Leaderboard filters (type, period, etc.)
 * @param enableRealtime - Whether to subscribe to real-time updates (default: true)
 */
export const useLeaderboard = (
  filters: LeaderboardFilters,
  enableRealtime = true
): UseLeaderboardReturn => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
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

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    const filterKey = JSON.stringify(memoizedFilters);
    
    // Prevent duplicate fetches
    if (lastFetchRef.current === filterKey) {
      console.log('🔄 [useLeaderboard] Skipping duplicate fetch:', filterKey);
      return;
    }

    try {
      console.log('🏆 [useLeaderboard] Fetching leaderboard:', memoizedFilters);
      setLoading(true);
      setError(null);
      lastFetchRef.current = filterKey;

      const data = await getLeaderboard(memoizedFilters);
      console.log('🏆 [useLeaderboard] Received data:', data.length, 'entries');
      setEntries(data);
    } catch (err) {
      console.error('[useLeaderboard] Error fetching leaderboard:', err);
      setError(err as Error);
      setEntries([]);
      lastFetchRef.current = ''; // Reset on error to allow retry
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  // Initial fetch
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Real-time subscription to points_transactions
  useEffect(() => {
    if (!enableRealtime) return;

    console.log('🔔 [useLeaderboard] Setting up real-time subscription');
    const channel = supabase
      .channel(`leaderboard-updates-${memoizedFilters.type}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'points_transactions'
        },
        (payload) => {
          console.log('🔔 [useLeaderboard] Real-time update received:', payload);
          // Debounce: wait 2s before refreshing
          setTimeout(() => {
            lastFetchRef.current = ''; // Force refresh
            fetchLeaderboard();
          }, 2000);
        }
      )
      .subscribe();

    return () => {
      console.log('🔔 [useLeaderboard] Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, memoizedFilters.type]); // Only depend on type, not full filters

  return {
    entries,
    loading,
    error,
    refresh: fetchLeaderboard
  };
};

