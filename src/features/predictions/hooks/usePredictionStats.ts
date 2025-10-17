import { useState, useEffect, useCallback } from 'react';
import type { PredictionStats } from '../types';
import {
  getPredictionStats,
  subscribeToPredictionStats
} from '../services/predictionStatsService';

interface UsePredictionStatsReturn {
  stats: PredictionStats | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook to fetch and subscribe to real-time prediction statistics
 * @param predictionId - Prediction UUID
 */
export const usePredictionStats = (
  predictionId: string | null
): UsePredictionStatsReturn => {
  const [stats, setStats] = useState<PredictionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!predictionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getPredictionStats(predictionId);
      setStats(data);
    } catch (err) {
      console.error('[usePredictionStats] Error fetching stats:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [predictionId]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!predictionId) return;

    const unsubscribe = subscribeToPredictionStats(predictionId, (newStats) => {
      setStats(newStats);
    });

    return unsubscribe;
  }, [predictionId]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
};

