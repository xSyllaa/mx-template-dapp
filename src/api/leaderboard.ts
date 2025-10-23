/**
 * Leaderboard API
 * Handles leaderboard data and user rankings with specific timeframes
 */

import { apiClient } from './client';

type LeaderboardType = 'all_time' | 'weekly' | 'monthly';

interface LeaderboardEntry {
  userId: string;
  username: string | null;
  avatarUrl: string | null;
  points: number;
  rank: number;
}

interface GetLeaderboardResponse {
  success: boolean;
  data: {
    entries: LeaderboardEntry[];
    total: number;
    hasMore: boolean;
  };
  message?: string;
}

interface GetUserRankResponse {
  success: boolean;
  data: {
    userRank: {
      userId: string;
      username: string | null;
      avatarUrl: string | null;
      points: number;
      rank: number;
    };
    allTimeRank: number;
    weeklyRank: number;
    monthlyRank: number;
  };
  message?: string;
}

interface DashboardStatsResponse {
  success: boolean;
  data: {
    totalPoints: number;
    username: string | null;
    walletAddress: string;
    globalRank: number;
    globalTotalUsers: number;
    weeklyRank: number;
    weeklyTotalUsers: number;
    monthlyRank: number;
    monthlyTotalUsers: number;
  };
  message?: string;
}

interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  sourceType: string;
  sourceId?: string;
  metadata?: any;
  createdAt: string;
}

interface GetPointsHistoryResponse {
  success: boolean;
  data: {
    transactions: PointsTransaction[];
    total: number;
    hasMore: boolean;
  };
  message?: string;
}

export const leaderboardAPI = {
  /**
   * Get all-time leaderboard
   * @param limit - Number of entries to return (default: 50, max: 100)
   * @param offset - Pagination offset (default: 0)
   */
  async getAllTime(
    limit = 50,
    offset = 0
  ): Promise<GetLeaderboardResponse> {
    return apiClient<GetLeaderboardResponse>(
      `/leaderboard/all-time?limit=${limit}&offset=${offset}`
    );
  },

  /**
   * Get weekly leaderboard
   * @param week - Week number (1-52). If not specified, uses current week
   * @param year - Year. If not specified, uses current year
   * @param limit - Number of entries to return (default: 50, max: 100)
   * @param offset - Pagination offset (default: 0)
   */
  async getWeekly(
    week?: number,
    year?: number,
    limit = 50,
    offset = 0
  ): Promise<GetLeaderboardResponse> {
    const params = new URLSearchParams();
    if (week !== undefined) params.append('week', week.toString());
    if (year !== undefined) params.append('year', year.toString());
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return apiClient<GetLeaderboardResponse>(
      `/leaderboard/weekly?${params.toString()}`
    );
  },

  /**
   * Get monthly leaderboard
   * @param month - Month (1-12). If not specified, uses current month
   * @param year - Year. If not specified, uses current year
   * @param limit - Number of entries to return (default: 50, max: 100)
   * @param offset - Pagination offset (default: 0)
   */
  async getMonthly(
    month?: number,
    year?: number,
    limit = 50,
    offset = 0
  ): Promise<GetLeaderboardResponse> {
    const params = new URLSearchParams();
    if (month !== undefined) params.append('month', month.toString());
    if (year !== undefined) params.append('year', year.toString());
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return apiClient<GetLeaderboardResponse>(
      `/leaderboard/monthly?${params.toString()}`
    );
  },

  /**
   * Get leaderboard entries (legacy method for backward compatibility)
   * @param type - Leaderboard type (all_time, weekly, monthly)
   * @param limit - Number of entries to return
   * @param offset - Pagination offset
   * @deprecated Use getAllTime, getWeekly, or getMonthly instead
   */
  async get(
    type: LeaderboardType = 'all_time',
    limit = 50,
    offset = 0
  ): Promise<GetLeaderboardResponse> {
    // Map old API to new endpoints
    switch (type) {
      case 'all_time':
        return this.getAllTime(limit, offset);
      case 'weekly':
        return this.getWeekly(undefined, undefined, limit, offset);
      case 'monthly':
        return this.getMonthly(undefined, undefined, limit, offset);
      default:
        return this.getAllTime(limit, offset);
    }
  },

  /**
   * Get current user's rank
   * @param type - Leaderboard type (all_time, weekly, monthly)
   */
  async getUserRank(
    type: LeaderboardType = 'all_time'
  ): Promise<GetUserRankResponse> {
    return apiClient<GetUserRankResponse>(`/leaderboard/user-rank?type=${type}`);
  },

  /**
   * Get user's points transaction history
   * @param limit - Number of transactions to return
   * @param offset - Pagination offset
   */
  async getPointsHistory(
    limit = 50,
    offset = 0
  ): Promise<GetPointsHistoryResponse> {
    return apiClient<GetPointsHistoryResponse>(
      `/leaderboard/points-history?limit=${limit}&offset=${offset}`
    );
  },

  /**
   * Get dashboard stats for current user (all ranks + total users)
   * @returns Dashboard stats including global, weekly, monthly ranks with total users
   */
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    return apiClient<DashboardStatsResponse>('/leaderboard/dashboard-stats');
  },
};

