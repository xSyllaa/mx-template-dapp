import { supabase } from 'lib/supabase/client';
import { leaderboardAPI } from 'api/leaderboard';
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
 * Get all-time leaderboard
 * @param limit - Number of entries to return (default: 50, max: 100)
 * @param offset - Pagination offset (default: 0)
 */
export const getAllTimeLeaderboard = async (
  limit = 50,
  offset = 0
): Promise<LeaderboardEntry[]> => {
  try {
    console.log(`🏆 [Leaderboard] All-time - API`);
    const response = await leaderboardAPI.getAllTime(limit, offset);
    
    // Check if response is successful and has data
    if (!response.success || !response.data) {
      throw new Error('Invalid all-time leaderboard response');
    }
    
    // Transform API response to LeaderboardEntry format
    const entries: LeaderboardEntry[] = response.data.entries.map((entry) => ({
      user_id: entry.userId,
      username: entry.username || null,
      avatar_url: entry.avatarUrl || null,
      points: entry.points,
      rank: entry.rank
    }));

    return entries;
  } catch (error) {
    console.error('[LeaderboardService] Error fetching all-time leaderboard:', error);
    throw error;
  }
};

/**
 * Get weekly leaderboard
 * @param week - Week number (1-52). If not specified, uses current week
 * @param year - Year. If not specified, uses current year
 * @param limit - Number of entries to return (default: 50, max: 100)
 * @param offset - Pagination offset (default: 0)
 */
export const getWeeklyLeaderboard = async (
  week?: number,
  year?: number,
  limit = 50,
  offset = 0
): Promise<LeaderboardEntry[]> => {
  try {
    console.log(`🏆 [Leaderboard] Weekly - API (week: ${week || 'current'}, year: ${year || 'current'})`);
    const response = await leaderboardAPI.getWeekly(week, year, limit, offset);
    
    // Check if response is successful and has data
    if (!response.success || !response.data) {
      throw new Error('Invalid weekly leaderboard response');
    }
    
    // Transform API response to LeaderboardEntry format
    const entries: LeaderboardEntry[] = response.data.entries.map((entry) => ({
      user_id: entry.userId,
      username: entry.username || null,
      avatar_url: entry.avatarUrl || null,
      points: entry.points,
      rank: entry.rank
    }));

    return entries;
  } catch (error) {
    console.error('[LeaderboardService] Error fetching weekly leaderboard:', error);
    throw error;
  }
};

/**
 * Get monthly leaderboard
 * @param month - Month (1-12). If not specified, uses current month
 * @param year - Year. If not specified, uses current year
 * @param limit - Number of entries to return (default: 50, max: 100)
 * @param offset - Pagination offset (default: 0)
 */
export const getMonthlyLeaderboard = async (
  month?: number,
  year?: number,
  limit = 50,
  offset = 0
): Promise<LeaderboardEntry[]> => {
  try {
    console.log(`🏆 [Leaderboard] Monthly - API (month: ${month || 'current'}, year: ${year || 'current'})`);
    const response = await leaderboardAPI.getMonthly(month, year, limit, offset);
    
    // Check if response is successful and has data
    if (!response.success || !response.data) {
      throw new Error('Invalid monthly leaderboard response');
    }
    
    // Transform API response to LeaderboardEntry format
    const entries: LeaderboardEntry[] = response.data.entries.map((entry) => ({
      user_id: entry.userId,
      username: entry.username || null,
      avatar_url: entry.avatarUrl || null,
      points: entry.points,
      rank: entry.rank
    }));

    return entries;
  } catch (error) {
    console.error('[LeaderboardService] Error fetching monthly leaderboard:', error);
    throw error;
  }
};

/**
 * Get leaderboard for a specific period
 * @param filters - Leaderboard filters (type, period, source types)
 */
export const getLeaderboard = async (
  filters: LeaderboardFilters
): Promise<LeaderboardEntry[]> => {
  try {
    const { type, limit = 100, week, month, year } = filters;

    console.log(`🏆 [Leaderboard] ${type} - API`);
    
    let response;
    
    // Use specific API endpoints based on type
    switch (type) {
      case 'all_time':
        response = await leaderboardAPI.getAllTime(limit, 0);
        break;
      case 'weekly':
        response = await leaderboardAPI.getWeekly(week, year, limit, 0);
        break;
      case 'monthly':
        response = await leaderboardAPI.getMonthly(month, year, limit, 0);
        break;
      default:
        response = await leaderboardAPI.getAllTime(limit, 0);
    }
    
    // Check if response is successful and has data
    if (!response.success || !response.data) {
      throw new Error('Invalid leaderboard response');
    }
    
    // Transform API response to LeaderboardEntry format
    const entries: LeaderboardEntry[] = response.data.entries.map((entry) => ({
      user_id: entry.userId,
      username: entry.username || null,
      avatar_url: entry.avatarUrl || null,
      points: entry.points,
      rank: entry.rank
    }));

    return entries;
  } catch (error) {
    console.error('[LeaderboardService] Error fetching leaderboard:', error);
    throw error;
  }
};

/**
 * Get dashboard stats for current user (all ranks + total users)
 * @returns Complete dashboard stats including all ranks with total users
 */
export const getDashboardStats = async (): Promise<{
  totalPoints: number;
  username: string | null;
  walletAddress: string;
  globalRank: number;
  globalTotalUsers: number;
  weeklyRank: number;
  weeklyTotalUsers: number;
  monthlyRank: number;
  monthlyTotalUsers: number;
} | null> => {
  try {
    console.log('[LeaderboardService] Fetching dashboard stats...');
    const response = await leaderboardAPI.getDashboardStats();
    
    // Check if response is successful and has data
    if (!response.success || !response.data) {
      console.warn('[LeaderboardService] Invalid dashboard stats response:', response);
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error('[LeaderboardService] Error fetching dashboard stats:', error);
    return null;
  }
};

/**
 * Get user's rank in a specific leaderboard
 * @param userId - User's UUID (unused, backend gets it from JWT)
 * @param filters - Leaderboard filters
 */
export const getUserRank = async (
  userId: string,
  filters: LeaderboardFilters
): Promise<UserRankInfo | null> => {
  try {
    const { type } = filters;

    const response = await leaderboardAPI.getUserRank(type);
    
    // Debug: Log the full response to understand the structure
    console.log('[LeaderboardService] getUserRank response:', response);
    console.log('[LeaderboardService] Response data structure:', {
      hasUserRank: !!response.data.userRank,
      hasUserId: !!(response.data as any).userId,
      hasTotalUsers: !!(response.data as any).totalUsers,
      totalUsersValue: (response.data as any).totalUsers,
      allData: response.data
    });
    
    // Check if response is successful and has data
    if (!response.success || !response.data) {
      console.warn('[LeaderboardService] Invalid user rank response:', response);
      return null;
    }
    
    // Handle different possible response structures
    let userRankData: any = null;
    let totalUsers = 0;
    
    // Check if response.data has userRank property (new structure)
    if (response.data.userRank && typeof response.data.userRank === 'object') {
      userRankData = response.data.userRank;
      totalUsers = response.data.allTimeRank || 0;
    }
    // Check if response.data is directly the userRank (alternative structure)
    else if ((response.data as any).userId && typeof (response.data as any).points === 'number') {
      userRankData = response.data;
      // Check for totalUsers in the response data - this is the correct field name
      totalUsers = (response.data as any).totalUsers || 0;
    }
    // Check if response.data has entries array (fallback to first entry)
    else if ((response.data as any).entries && Array.isArray((response.data as any).entries) && (response.data as any).entries.length > 0) {
      userRankData = (response.data as any).entries[0];
      totalUsers = (response.data as any).total || 0;
    }
    
    if (!userRankData) {
      console.warn('[LeaderboardService] No user rank data available in response:', response.data);
      return null;
    }
    
    // Validate required fields
    if (!userRankData.userId || typeof userRankData.points !== 'number' || typeof userRankData.rank !== 'number') {
      console.warn('[LeaderboardService] Invalid user rank structure:', userRankData);
      return null;
    }
    
    // Transform API response to UserRankInfo format
    const userRankInfo: UserRankInfo = {
      user_id: userRankData.userId,
      username: userRankData.username || null,
      avatar_url: userRankData.avatarUrl || null,
      points: userRankData.points,
      rank: userRankData.rank,
      total_users: totalUsers
    };

    // Debug log to verify the data
    console.log('[LeaderboardService] Processed user rank info:', {
      userId: userRankInfo.user_id,
      rank: userRankInfo.rank,
      totalUsers: userRankInfo.total_users,
      originalTotalUsers: totalUsers,
      userRankData: userRankData
    });

    return userRankInfo;
  } catch (error) {
    console.error('[LeaderboardService] Error fetching user rank:', error);
    // Return null on error (user might not be ranked yet)
    return null;
  }
};

// ============================================================
// POINTS HISTORY
// ============================================================

/**
 * Get user's points transaction history
 * @param userId - User's UUID (unused, backend gets it from JWT)
 * @param limit - Number of transactions to fetch
 * @param offset - Pagination offset
 */
export const getUserPointsHistory = async (
  userId: string,
  limit = 50,
  offset = 0
): Promise<PointsTransaction[]> => {
  try {
    const response = await leaderboardAPI.getPointsHistory(limit, offset);
    
    // Check if response is successful and has data
    if (!response.success || !response.data) {
      throw new Error('Invalid points history response');
    }
    
    // Transform API response to PointsTransaction format
    const transactions: PointsTransaction[] = response.data.transactions.map((tx) => ({
      id: tx.id,
      user_id: tx.userId,
      amount: tx.amount,
      source_type: tx.sourceType as PointsSourceType,
      source_id: tx.sourceId || null,
      metadata: tx.metadata || null,
      created_at: tx.createdAt
    }));

    return transactions;
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

