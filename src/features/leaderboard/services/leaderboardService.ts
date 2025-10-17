import { supabase } from 'lib/supabase/client';
import type {
  LeaderboardEntry,
  LeaderboardFilters,
  UserRankInfo,
  PointsTransaction,
  PointsSourceType
} from '../types';

// ============================================================
// RECORD POINTS TRANSACTIONS
// ============================================================

/**
 * Record a points transaction (gain or loss)
 * @param userId - User's UUID
 * @param amount - Points amount (positive for gains, negative for losses)
 * @param sourceType - Type of activity
 * @param sourceId - UUID of source entity (optional)
 * @param metadata - Additional context (optional)
 */
export const recordPointsTransaction = async (
  userId: string,
  amount: number,
  sourceType: PointsSourceType,
  sourceId: string | null = null,
  metadata: Record<string, any> | null = null
): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('record_points_transaction', {
      p_user_id: userId,
      p_amount: amount,
      p_source_type: sourceType,
      p_source_id: sourceId,
      p_metadata: metadata
    });

    if (error) throw error;

    return data as string; // Returns transaction ID
  } catch (error) {
    console.error('[LeaderboardService] Error recording points transaction:', error);
    throw error;
  }
};

// ============================================================
// FETCH LEADERBOARDS
// ============================================================

/**
 * Get leaderboard for a specific period
 * @param filters - Leaderboard filters (type, period, source types)
 */
export const getLeaderboard = async (
  filters: LeaderboardFilters
): Promise<LeaderboardEntry[]> => {
  try {
    const { type, week, month, year, sourceTypes, limit = 100 } = filters;

    console.log('📡 [LeaderboardService] Calling get_leaderboard with:', {
      type,
      week,
      month,
      year,
      sourceTypes,
      limit
    });

    // Try to call the real Supabase function first
    try {
      const { data, error } = await supabase.rpc('get_leaderboard', {
        p_type: type,
        p_week: week || null,
        p_month: month || null,
        p_year: year || null,
        p_limit: limit,
        p_source_types: sourceTypes || null
      });

      if (error) {
        console.error('📡 [LeaderboardService] Supabase function error:', error);
        throw error;
      }

      console.log('📡 [LeaderboardService] Received data from function:', data?.length || 0, 'entries');
      return (data || []) as LeaderboardEntry[];
    } catch (functionError: any) {
      // If function doesn't exist, fallback to direct table query
      if (functionError.code === '42883') { // function does not exist
        console.log('📡 [LeaderboardService] Function not found, falling back to users table');
        
        // Fallback: Get all users with their total_points
        const { data, error } = await supabase
          .from('users')
          .select('id, username, avatar_url, total_points')
          .not('total_points', 'is', null)
          .gt('total_points', 0)
          .order('total_points', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('📡 [LeaderboardService] Fallback query error:', error);
          throw error;
        }

        // Transform to LeaderboardEntry format with ranks
        const entries: LeaderboardEntry[] = (data || []).map((user, index) => ({
          user_id: user.id,
          username: user.username,
          avatar_url: user.avatar_url,
          points: user.total_points || 0,
          rank: index + 1
        }));

        console.log('📡 [LeaderboardService] Fallback data:', entries.length, 'entries');
        return entries;
      }
      throw functionError;
    }
  } catch (error) {
    console.error('[LeaderboardService] Error fetching leaderboard:', error);
    throw error;
  }
};

/**
 * Get user's rank in a specific leaderboard
 * @param userId - User's UUID
 * @param filters - Leaderboard filters
 */
export const getUserRank = async (
  userId: string,
  filters: LeaderboardFilters
): Promise<UserRankInfo | null> => {
  try {
    const { type, week, month, year, sourceTypes } = filters;

    console.log('📡 [LeaderboardService] Calling get_user_rank with:', {
      userId,
      type,
      week,
      month,
      year,
      sourceTypes
    });

    // Try to call the real Supabase function
    const { data, error } = await supabase.rpc('get_user_rank', {
      p_user_id: userId,
      p_type: type,
      p_week: week || null,
      p_month: month || null,
      p_year: year || null,
      p_source_types: sourceTypes || null
    });

    if (error) {
      console.error('📡 [LeaderboardService] Supabase error:', error);
      // If function doesn't exist yet, return null
      if (error.code === '42883') { // function does not exist
        console.log('📡 [LeaderboardService] Function not found, returning null');
        return null;
      }
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('📡 [LeaderboardService] No rank data found for user');
      return null;
    }

    console.log('📡 [LeaderboardService] Received rank data:', data[0]);
    return data[0] as UserRankInfo;
  } catch (error) {
    console.error('[LeaderboardService] Error fetching user rank:', error);
    throw error;
  }
};

// ============================================================
// POINTS HISTORY
// ============================================================

/**
 * Get user's points transaction history
 * @param userId - User's UUID
 * @param limit - Number of transactions to fetch
 * @param offset - Pagination offset
 */
export const getUserPointsHistory = async (
  userId: string,
  limit = 50,
  offset = 0
): Promise<PointsTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (data || []) as PointsTransaction[];
  } catch (error) {
    console.error('[LeaderboardService] Error fetching points history:', error);
    throw error;
  }
};

/**
 * Get all points transactions for a specific period
 * @param userId - User's UUID
 * @param startDate - Start of period
 * @param endDate - End of period
 */
export const getUserPointsForPeriod = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<PointsTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []) as PointsTransaction[];
  } catch (error) {
    console.error(
      '[LeaderboardService] Error fetching points for period:',
      error
    );
    throw error;
  }
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get current week number (ISO week)
 */
export const getCurrentWeekNumber = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
};

/**
 * Get current month (1-12)
 */
export const getCurrentMonth = (): number => {
  return new Date().getMonth() + 1;
};

/**
 * Get current year
 */
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

/**
 * Calculate total points from transactions
 */
export const calculateTotalPoints = (
  transactions: PointsTransaction[]
): number => {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
};

