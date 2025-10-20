import { useState, useEffect, useCallback } from 'react';
import { getPredictionStats } from '../services/predictionStatsService';
import type { Prediction, PredictionStats } from '../types';

interface AdminPredictionStats {
  [predictionId: string]: PredictionStats | null;
}

interface UseAdminPredictionStatsReturn {
  stats: AdminPredictionStats;
  loading: boolean;
  error: string | null;
  fetchStats: (predictionIds: string[]) => Promise<void>;
  getStatsForPrediction: (predictionId: string) => PredictionStats | null;
}

/**
 * Hook pour récupérer les statistiques des prédictions pour l'admin
 * Cache les résultats pour éviter les appels répétés
 */
export const useAdminPredictionStats = (): UseAdminPredictionStatsReturn => {
  const [stats, setStats] = useState<AdminPredictionStats>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (predictionIds: string[]) => {
    if (predictionIds.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch stats for predictions that haven't been loaded yet
      const uncachedIds = predictionIds.filter(id => !(id in stats));
      
      if (uncachedIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch stats for each uncached prediction
      const newStats: AdminPredictionStats = {};
      
      await Promise.all(
        uncachedIds.map(async (id) => {
          try {
            const predictionStats = await getPredictionStats(id);
            newStats[id] = predictionStats;
          } catch (err) {
            console.error(`[useAdminPredictionStats] Error fetching stats for prediction ${id}:`, err);
            newStats[id] = null;
          }
        })
      );

      setStats(prev => ({ ...prev, ...newStats }));
    } catch (err) {
      console.error('[useAdminPredictionStats] Error fetching prediction stats:', err);
      setError('Failed to load prediction statistics');
    } finally {
      setLoading(false);
    }
  }, [stats]);

  const getStatsForPrediction = useCallback((predictionId: string): PredictionStats | null => {
    return stats[predictionId] || null;
  }, [stats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
    getStatsForPrediction
  };
};
