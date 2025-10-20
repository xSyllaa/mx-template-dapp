import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from 'lib/supabase/client';
import { getLeaderboard } from '../services/leaderboardService';
import type { LeaderboardEntry, LeaderboardFilters } from '../types';

const DEBUG = import.meta.env.DEV;

interface UseLeaderboardReturn {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

// Cache for leaderboard data (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const cache = new Map<string, { data: LeaderboardEntry[]; timestamp: number }>();

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

  // Fetch leaderboard data with cache
  const fetchLeaderboard = useCallback(async () => {
    const filterKey = JSON.stringify(memoizedFilters);
    
    // Check cache first
    const cached = cache.get(filterKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      if (DEBUG) console.log('🔁 [Leaderboard] Source: cache');
      if (DEBUG && cached.data.length) {
        console.log('🏆 [Leaderboard] Current rankings:', cached.data.map(entry =>
          `${entry.rank}. ${entry.username || 'Anonymous'} - ${entry.points} points`
        ).join(', '));
      }
      setEntries(cached.data);
      setLoading(false);
      return;
    }
    
    // Prevent duplicate fetches
    if (lastFetchRef.current === filterKey) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      lastFetchRef.current = filterKey;

      const data = await getLeaderboard(memoizedFilters);
      
      // Cache the data
      cache.set(filterKey, { data, timestamp: now });
      
      if (DEBUG) console.log('🔁 [Leaderboard] Source: supabase');
      if (DEBUG && data.length) {
        console.log('🏆 [Leaderboard] Current rankings:', data.map(entry =>
          `${entry.rank}. ${entry.username || 'Anonymous'} - ${entry.points} points`
        ).join(', '));
      }
      
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
          // Clear cache and force refresh
          const filterKey = JSON.stringify(memoizedFilters);
          cache.delete(filterKey);
          lastFetchRef.current = ''; // Force refresh
          setTimeout(() => {
            fetchLeaderboard();
          }, 1000); // Reduced debounce time
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, memoizedFilters.type, fetchLeaderboard]);

  return {
    entries,
    loading,
    error,
    refresh: fetchLeaderboard
  };
};

