import { supabase } from 'lib/supabase/client';
import type {
  LeaderboardEntry,
  LeaderboardFilters,
  UserRankInfo,
  PointsTransaction,
  PointsSourceType
} from '../types';

const DEBUG = import.meta.env.DEV;

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

    // Try to call the real Supabase function first
    try {
      console.log(`🏆 [Leaderboard] ${type} - supabase`);
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

      return (data || []) as LeaderboardEntry[];
    } catch (functionError: any) {
      // If function doesn't exist, fallback to direct table query
      if (functionError.code === '42883') { // function does not exist
        // Function not found, fallback to users table
        console.log(`🏆 [Leaderboard] ${type} - fallback (users table)`);

        // Fallback: Get all users with their total_points (including negative)
        const { data, error } = await supabase
          .from('users')
          .select('id, username, avatar_url, total_points')
          .not('total_points', 'is', null)
          .order('total_points', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('📡 [LeaderboardService] Fallback query error:', error);
          throw error;
        }

        // Transform to LeaderboardEntry format with ranks (including negative points)
        const entries: LeaderboardEntry[] = (data || []).map((user, index) => ({
          user_id: user.id,
          username: user.username,
          avatar_url: user.avatar_url,
          points: user.total_points || 0,
          rank: index + 1
        }));

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

    // User rank fetching logs removed as requested - only essential leaderboard logs remain

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
        return null;
      }
      throw error;
    }

    if (!data || data.length === 0) {
      return null;
    }

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
 * Get current week number (Monday to Sunday, matching PostgreSQL)
 */
export const getCurrentWeekNumber = (): number => {
  const now = new Date();
  const year = now.getFullYear();
  
  // Get January 1st of current year
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const jan1DayOfWeek = jan1.getUTCDay();
  
  // Calculate the first Monday of the year
  const firstMonday = new Date(Date.UTC(year, 0, 1));
  if (jan1DayOfWeek === 0) {
    firstMonday.setUTCDate(2); // Sunday -> Monday is next day
  } else if (jan1DayOfWeek === 1) {
    firstMonday.setUTCDate(1); // Already Monday
  } else {
    firstMonday.setUTCDate(1 + (8 - jan1DayOfWeek)); // Tuesday-Saturday -> next Monday
  }
  
  // Calculate week number based on Monday start
  const diff = now.getTime() - firstMonday.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNumber = Math.floor(diff / oneWeek) + 1;
  
  return Math.max(1, weekNumber);
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

// ============================================================
// DATE UTILITIES FOR LEADERBOARD PERIODS
// ============================================================

/**
 * Get start and end dates for a specific week (Monday to Sunday, UTC)
 * This matches PostgreSQL's date_trunc('week') behavior
 * @param week - Week number (1-52)
 * @param year - Year
 */
export const getWeekDateRange = (week: number, year: number): { start: Date; end: Date } => {
  // Create January 1st of the year
  const jan1 = new Date(Date.UTC(year, 0, 1));
  
  // Get the day of week for January 1st (0 = Sunday, 1 = Monday, etc.)
  const jan1DayOfWeek = jan1.getUTCDay();
  
  // Calculate the first Monday of the year
  // If Jan 1 is Sunday (0), first Monday is Jan 2
  // If Jan 1 is Monday (1), first Monday is Jan 1  
  // If Jan 1 is Tuesday-Saturday (2-6), first Monday is next Monday
  const firstMonday = new Date(Date.UTC(year, 0, 1));
  if (jan1DayOfWeek === 0) {
    firstMonday.setUTCDate(2); // Sunday -> Monday is next day
  } else if (jan1DayOfWeek === 1) {
    firstMonday.setUTCDate(1); // Already Monday
  } else {
    firstMonday.setUTCDate(1 + (8 - jan1DayOfWeek)); // Tuesday-Saturday -> next Monday
  }
  
  // Calculate the start of the requested week (Monday at 00:00:00 UTC)
  const weekStart = new Date(firstMonday);
  weekStart.setUTCDate(firstMonday.getUTCDate() + (week - 1) * 7);
  weekStart.setUTCHours(0, 0, 0, 0);
  
  // Calculate the end of the week (Sunday at 23:59:59.999 UTC)
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);
  
  return { start: weekStart, end: weekEnd };
};

/**
 * Get start and end dates for a specific month
 * @param month - Month number (1-12)
 * @param year - Year
 */
export const getMonthDateRange = (month: number, year: number): { start: Date; end: Date } => {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
  
  return { start: monthStart, end: monthEnd };
};

/**
 * Get start and end dates for all time (from beginning to now)
 */
export const getAllTimeDateRange = (): { start: Date; end: Date } => {
  const now = new Date();
  const beginning = new Date('2024-01-01T00:00:00.000Z'); // Adjust this to your app's launch date
  
  return { start: beginning, end: now };
};

/**
 * Get date range for a leaderboard type
 * @param type - Leaderboard type
 * @param week - Week number (for weekly)
 * @param month - Month number (for monthly)
 * @param year - Year
 */
export const getLeaderboardDateRange = (
  type: 'all_time' | 'weekly' | 'monthly',
  week?: number,
  month?: number,
  year?: number
): { start: Date; end: Date } => {
  const currentYear = year || getCurrentYear();
  
  switch (type) {
    case 'weekly':
      const weekNum = week || getCurrentWeekNumber();
      return getWeekDateRange(weekNum, currentYear);
    
    case 'monthly':
      const monthNum = month || getCurrentMonth();
      return getMonthDateRange(monthNum, currentYear);
    
    case 'all_time':
    default:
      return getAllTimeDateRange();
  }
};

/**
 * Format date to UTC string for display (without seconds and milliseconds)
 * @param date - Date to format
 */
export const formatDateToUTC = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
};

