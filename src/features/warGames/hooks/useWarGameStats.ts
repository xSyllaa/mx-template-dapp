import { useState, useEffect } from 'react';
import { warGamesAPI } from 'api/wargames';

interface UseWarGameStatsReturn {
  stats: {
    active: number;
    historical: number;
    total: number;
  } | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export const useWarGameStats = (): UseWarGameStatsReturn => {
  const [stats, setStats] = useState<{
    active: number;
    historical: number;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await warGamesAPI.getStats();
      
      if (!response.success || !response.data) {
        throw new Error('Invalid war games stats response');
      }
      
      setStats(response.data);
    } catch (err) {
      console.error('[useWarGameStats] Error fetching stats:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refresh = async () => {
    await fetchStats();
  };

  return { stats, loading, error, refresh };
};
