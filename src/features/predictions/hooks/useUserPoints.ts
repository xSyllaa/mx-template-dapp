import { useState, useEffect, useCallback } from 'react';
import { supabase } from 'lib/supabase/client';

interface UseUserPointsReturn {
  points: number;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook to fetch and track user's current point balance
 * @param userId - User's UUID (can be null if not logged in)
 */
export const useUserPoints = (userId: string | null): UseUserPointsReturn => {
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user's point balance
  const fetchPoints = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setPoints(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('total_points')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      setPoints(data?.total_points || 0);
    } catch (err) {
      console.error('[useUserPoints] Error fetching user points:', err);
      setError(err as Error);
      setPoints(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  // Subscribe to real-time updates on user's points
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-points-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          if (payload.new && 'total_points' in payload.new) {
            setPoints((payload.new as { total_points: number }).total_points);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    points,
    loading,
    error,
    refresh: fetchPoints
  };
};

