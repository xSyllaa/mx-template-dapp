import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats } from '../services/leaderboardService';

interface DashboardStats {
  totalPoints: number;
  username: string | null;
  walletAddress: string;
  globalRank: number;
  globalTotalUsers: number;
  weeklyRank: number;
  weeklyTotalUsers: number;
  monthlyRank: number;
  monthlyTotalUsers: number;
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook to fetch dashboard stats for current user
 * @param enableRealtime - Whether to subscribe to real-time updates (default: true)
 */
export const useDashboardStats = (
  enableRealtime = true
): UseDashboardStatsReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getDashboardStats();
      
      if (data === null) {
        console.log('[useDashboardStats] No dashboard stats available');
        setStats(null);
        setError(null); // This is not an error, just no stats data
      } else {
        setStats(data);
      }
    } catch (err) {
      console.error('[useDashboardStats] Error fetching dashboard stats:', err);
      setError(err as Error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
};

/**
 * Utility function to format rank display
 * @param rank - User's rank
 * @param total - Total number of users
 * @returns Formatted rank string (e.g., "#1/100" or "Non classé")
 */
export const formatRank = (rank: number, total: number): string => {
  if (rank === 0 || total === 0) {
    return 'Non classé';
  }
  return `#${rank}/${total}`;
};

/**
 * Utility function to get rank info for a specific type
 * @param stats - Dashboard stats
 * @param type - Rank type ('global', 'weekly', 'monthly')
 * @returns Rank info object
 */
export const getRankInfo = (
  stats: DashboardStats | null,
  type: 'global' | 'weekly' | 'monthly'
): { rank: number; total: number; formatted: string } => {
  if (!stats) {
    return { rank: 0, total: 0, formatted: 'Non classé' };
  }

  let rank: number;
  let total: number;

  switch (type) {
    case 'global':
      rank = stats.globalRank;
      total = stats.globalTotalUsers;
      break;
    case 'weekly':
      rank = stats.weeklyRank;
      total = stats.weeklyTotalUsers;
      break;
    case 'monthly':
      rank = stats.monthlyRank;
      total = stats.monthlyTotalUsers;
      break;
    default:
      rank = 0;
      total = 0;
  }

  return {
    rank,
    total,
    formatted: formatRank(rank, total)
  };
};
