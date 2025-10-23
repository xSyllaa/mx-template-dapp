/**
 * Users API
 * Handles user profile, stats, and points history
 */

import { apiClient } from './client';

interface User {
  id: string;
  walletAddress: string;
  username?: string;
  role: string;
  totalPoints: number;
  currentStreak: number;
  nftCount: number;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalPredictions: number;
  correctPredictions: number;
  winRate: number;
  totalWarGames: number;
  warGamesWon: number;
  streaksCompleted: number;
  rank: number;
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

interface GetProfileResponse {
  success: boolean;
  user: User;
}

interface UpdateProfileResponse {
  success: boolean;
  user: User;
  message: string;
}

interface UpdateUsernameResponse {
  success: boolean;
  message: string;
  user: User;
}

interface GetStatsResponse {
  success: boolean;
  stats: UserStats;
}

interface GetPointsHistoryResponse {
  success: boolean;
  transactions: PointsTransaction[];
  total: number;
  hasMore: boolean;
}

export const usersAPI = {
  /**
   * Get current user's profile
   */
  async getProfile(): Promise<GetProfileResponse> {
    return apiClient<GetProfileResponse>('/users/profile');
  },

  /**
   * Update user profile
   * @param avatarUrl - Optional avatar URL
   */
  async updateProfile(avatarUrl?: string): Promise<UpdateProfileResponse> {
    return apiClient<UpdateProfileResponse>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ avatarUrl }),
    });
  },

  /**
   * Update username
   * @param username - New username (3-20 characters, alphanumeric + underscore)
   */
  async updateUsername(username: string): Promise<UpdateUsernameResponse> {
    return apiClient<UpdateUsernameResponse>('/users/username', {
      method: 'PUT',
      body: JSON.stringify({ username }),
    });
  },

  /**
   * Get user statistics
   */
  async getStats(): Promise<GetStatsResponse> {
    return apiClient<GetStatsResponse>('/users/stats');
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
      `/users/points-history?limit=${limit}&offset=${offset}`
    );
  },
};

