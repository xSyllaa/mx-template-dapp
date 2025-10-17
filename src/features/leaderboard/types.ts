// Leaderboard Types for GalacticX dApp

/**
 * Type of leaderboard period
 */
export type LeaderboardType = 'all_time' | 'weekly' | 'monthly';

/**
 * Source type for points transactions
 */
export type PointsSourceType =
  | 'prediction_win'
  | 'prediction_bet'
  | 'streak_claim'
  | 'war_game_win'
  | 'totw_bonus'
  | 'admin_adjustment';

/**
 * Points transaction record
 */
export interface PointsTransaction {
  id: string;
  user_id: string;
  amount: number;
  source_type: PointsSourceType;
  source_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

/**
 * Leaderboard entry (single user in ranking)
 */
export interface LeaderboardEntry {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  points: number;
  rank: number;
}

/**
 * User rank info (extended with total users count)
 */
export interface UserRankInfo extends LeaderboardEntry {
  total_users: number;
}

/**
 * Filters for leaderboard queries
 */
export interface LeaderboardFilters {
  type: LeaderboardType;
  week?: number;
  month?: number;
  year?: number;
  sourceTypes?: PointsSourceType[];
  limit?: number;
}

/**
 * Leaderboard data with metadata
 */
export interface LeaderboardData {
  entries: LeaderboardEntry[];
  filters: LeaderboardFilters;
  fetched_at: string;
}

/**
 * Points history aggregation (for charts)
 */
export interface PointsHistoryItem {
  date: string;
  amount: number;
  source_type: PointsSourceType;
  cumulative_total: number;
}

