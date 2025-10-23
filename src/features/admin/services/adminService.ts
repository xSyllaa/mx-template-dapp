/**
 * Admin Service
 * Handles admin operations using the backend API
 */

import { adminAPI } from 'api/admin';
import type {
  AdminUser,
  AdminPrediction,
  AdminWarGame,
  AdminBet,
  AdminBetStats,
  AdminWinnersPreview,
  AdminWarGameStats,
  AdminUserStats,
  AdminRecentActivity,
  AdminLeaderboardStats,
  AdminStreakStats,
  AdminAnalyticsOverview,
  AdminSystemHealth,
  AdminCacheStats,
  AdminLogEntry,
} from 'api/admin';

// ============================================================
// PREDICTIONS ADMIN
// ============================================================

export const adminPredictionService = {
  /**
   * Change prediction status
   */
  async changeStatus(
    predictionId: string,
    status: 'open' | 'closed' | 'cancelled'
  ): Promise<AdminPrediction> {
    try {
      const response = await adminAPI.predictions.changeStatus(predictionId, status);
      
      if (!response.success || !response.data) {
        throw new Error('Invalid change status response');
      }
      
      return response.data.prediction;
    } catch (error) {
      console.error('[AdminPredictionService] Error changing status:', error);
      throw error;
    }
  },

  /**
   * Cancel prediction with refund
   */
  async cancel(predictionId: string): Promise<{
    users_refunded: number;
    total_refunded: number;
  }> {
    try {
      const response = await adminAPI.predictions.cancel(predictionId);
      
      if (!response.success || !response.data) {
        throw new Error('Invalid cancel response');
      }
      
      return {
        users_refunded: response.data.users_refunded,
        total_refunded: response.data.total_refunded,
      };
    } catch (error) {
      console.error('[AdminPredictionService] Error cancelling prediction:', error);
      throw error;
    }
  },

  /**
   * Get all bets for a prediction
   */
  async getBets(
    predictionId: string,
    limit = 50,
    offset = 0
  ): Promise<{
    bets: AdminBet[];
    total: number;
    stats: AdminBetStats;
  }> {
    try {
      const response = await adminAPI.predictions.getBets(predictionId, limit, offset);
      
      if (!response.success || !response.data) {
        throw new Error('Invalid get bets response');
      }
      
      return {
        bets: response.data.bets,
        total: response.data.total,
        stats: response.data.stats,
      };
    } catch (error) {
      console.error('[AdminPredictionService] Error getting bets:', error);
      throw error;
    }
  },

  /**
   * Preview winners calculation
   */
  async getWinnersPreview(
    predictionId: string,
    winningOptionId: string
  ): Promise<AdminWinnersPreview> {
    try {
      const response = await adminAPI.predictions.getWinnersPreview(
        predictionId,
        winningOptionId
      );
      
      if (!response.success || !response.data) {
        throw new Error('Invalid winners preview response');
      }
      
      return response.data;
    } catch (error) {
      console.error('[AdminPredictionService] Error getting winners preview:', error);
      throw error;
    }
  },
};

// ============================================================
// USERS ADMIN
// ============================================================

export const adminUserService = {
  /**
   * Get all users with filters
   */
  async getAll(params: {
    limit?: number;
    offset?: number;
    search?: string;
    sortBy?: 'created_at' | 'total_points' | 'username';
    role?: 'all' | 'user' | 'admin' | 'banned';
  } = {}): Promise<{
    users: AdminUser[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const response = await adminAPI.users.getAll(params);
      
      if (!response.success || !response.data) {
        throw new Error('Invalid get users response');
      }
      
      return {
        users: response.data.users,
        total: response.data.total,
        hasMore: response.data.hasMore,
      };
    } catch (error) {
      console.error('[AdminUserService] Error getting users:', error);
      throw error;
    }
  },

  /**
   * Get user details
   */
  async getById(userId: string): Promise<{
    user: AdminUser;
    stats: AdminUserStats;
    recentActivity: AdminRecentActivity[];
  }> {
    try {
      const response = await adminAPI.users.getById(userId);
      
      if (!response.success || !response.data) {
        throw new Error('Invalid get user response');
      }
      
      return {
        user: response.data.user,
        stats: response.data.stats,
        recentActivity: response.data.recentActivity,
      };
    } catch (error) {
      console.error('[AdminUserService] Error getting user:', error);
      throw error;
    }
  },

  /**
   * Change user role
   */
  async changeRole(
    userId: string,
    role: 'user' | 'admin' | 'banned'
  ): Promise<AdminUser> {
    try {
      const response = await adminAPI.users.changeRole(userId, role);
      
      if (!response.success || !response.data) {
        throw new Error('Invalid change role response');
      }
      
      return response.data.user;
    } catch (error) {
      console.error('[AdminUserService] Error changing role:', error);
      throw error;
    }
  },

  /**
   * Ban user
   */
  async ban(
    userId: string,
    reason: string,
    duration?: number
  ): Promise<{
    success: boolean;
    banEnd: string | null;
  }> {
    try {
      const response = await adminAPI.users.ban(userId, reason, duration);
      
      if (!response.success || !response.data) {
        throw new Error('Invalid ban response');
      }
      
      return {
        success: response.data.success,
        banEnd: response.data.banEnd,
      };
    } catch (error) {
      console.error('[AdminUserService] Error banning user:', error);
      throw error;
    }
  },

  /**
   * Unban user
   */
  async unban(userId: string): Promise<{ success: boolean }> {
    try {
      const response = await adminAPI.users.unban(userId);
      
      if (!response.success || !response.data) {
        throw new Error('Invalid unban response');
      }
      
      return { success: response.data.success };
    } catch (error) {
      console.error('[AdminUserService] Error unbanning user:', error);
      throw error;
    }
  },

  /**
   * Adjust user points
   */
  async adjustPoints(
    userId: string,
    amount: number,
    reason: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await adminAPI.users.adjustPoints(userId, amount, reason);
      
      if (!response.success || !response.data) {
        throw new Error('Invalid adjust points response');
      }
      
      return { success: response.data.success };
    } catch (error) {
      console.error('[AdminUserService] Error adjusting points:', error);
      throw error;
    }
  },
};

// ============================================================
// WAR GAMES ADMIN
// ============================================================

export const adminWarGameService = {
  /**
   * Get all war games with filters
   */
  async getAll(params: {
    status?: 'all' | 'open' | 'in_progress' | 'completed' | 'cancelled';
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    warGames: AdminWarGame[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const response = await adminAPI.warGames.getAll(params);
      
      if (!response.success || !response.data) {
        throw new Error('Invalid get war games response');
      }
      
      return {
        warGames: response.data.warGames,
        total: response.data.total,
        hasMore: response.data.hasMore,
      };
    } catch (error) {
      console.error('[AdminWarGameService] Error getting war games:', error);
      throw error;
    }
  },

  /**
   * Validate war game result
   */
  async validate(
    warGameId: string,
    winnerId: string,
    creatorScore: number,
    opponentScore: number
  ): Promise<{
    warGame: AdminWarGame;
    winnerPayout: number;
  }> {
    try {
      const response = await adminAPI.warGames.validate(
        warGameId,
        winnerId,
        creatorScore,
        opponentScore
      );
      
      if (!response.success || !response.data) {
        throw new Error('Invalid validate response');
      }
      
      return {
        warGame: response.data.warGame,
        winnerPayout: response.data.winnerPayout,
      };
    } catch (error) {
      console.error('[AdminWarGameService] Error validating war game:', error);
      throw error;
    }
  },

  /**
   * Force cancel war game
   */
  async forceCancel(
    warGameId: string,
    reason: string
  ): Promise<{
    success: boolean;
    refundedUsers: number;
    refundedAmount: number;
  }> {
    try {
      const response = await adminAPI.warGames.forceCancel(warGameId, reason);
      
      if (!response.success || !response.data) {
        throw new Error('Invalid force cancel response');
      }
      
      return {
        success: response.data.success,
        refundedUsers: response.data.refundedUsers,
        refundedAmount: response.data.refundedAmount,
      };
    } catch (error) {
      console.error('[AdminWarGameService] Error force cancelling war game:', error);
      throw error;
    }
  },

  /**
   * Get war games statistics
   */
  async getStats(): Promise<AdminWarGameStats> {
    try {
      const response = await adminAPI.warGames.getStats();
      
      if (!response.success || !response.data) {
        throw new Error('Invalid get stats response');
      }
      
      return response.data;
    } catch (error) {
      console.error('[AdminWarGameService] Error getting stats:', error);
      throw error;
    }
  },
};

// ============================================================
// LEADERBOARD ADMIN
// ============================================================

export const adminLeaderboardService = {
  /**
   * Adjust user points
   */
  async adjustPoints(
    userId: string,
    amount: number,
    reason: string,
    sourceType = 'admin_adjustment'
  ): Promise<{ success: boolean }> {
    try {
      const response = await adminAPI.leaderboard.adjustPoints(
        userId,
        amount,
        reason,
        sourceType
      );
      
      if (!response.success || !response.data) {
        throw new Error('Invalid adjust points response');
      }
      
      return { success: response.data.success };
    } catch (error) {
      console.error('[AdminLeaderboardService] Error adjusting points:', error);
      throw error;
    }
  },

  /**
   * Reset leaderboard
   */
  async reset(
    type: 'weekly' | 'monthly',
    confirmationCode: string
  ): Promise<{
    message: string;
    affectedUsers: number;
  }> {
    try {
      const response = await adminAPI.leaderboard.reset(type, confirmationCode);
      
      if (!response.success || !response.data) {
        throw new Error('Invalid reset response');
      }
      
      return {
        message: response.data.message,
        affectedUsers: response.data.affectedUsers,
      };
    } catch (error) {
      console.error('[AdminLeaderboardService] Error resetting leaderboard:', error);
      throw error;
    }
  },

  /**
   * Get leaderboard statistics
   */
  async getStats(): Promise<AdminLeaderboardStats> {
    try {
      const response = await adminAPI.leaderboard.getStats();
      
      if (!response.success || !response.data) {
        throw new Error('Invalid get stats response');
      }
      
      return response.data;
    } catch (error) {
      console.error('[AdminLeaderboardService] Error getting stats:', error);
      throw error;
    }
  },
};

// ============================================================
// STREAKS ADMIN
// ============================================================

export const adminStreakService = {
  /**
   * Get streaks statistics
   */
  async getStats(): Promise<AdminStreakStats> {
    try {
      const response = await adminAPI.streaks.getStats();
      
      if (!response.success || !response.data) {
        throw new Error('Invalid get stats response');
      }
      
      return response.data;
    } catch (error) {
      console.error('[AdminStreakService] Error getting stats:', error);
      throw error;
    }
  },

  /**
   * Adjust user streak
   */
  async adjust(
    userId: string,
    action: 'reset' | 'complete_day' | 'complete_week',
    dayOfWeek?: string,
    reason?: string
  ): Promise<{
    weekStreak: any;
    message: string;
  }> {
    try {
      const response = await adminAPI.streaks.adjust(userId, action, dayOfWeek, reason);
      
      if (!response.success || !response.data) {
        throw new Error('Invalid adjust response');
      }
      
      return {
        weekStreak: response.data.weekStreak,
        message: response.data.message,
      };
    } catch (error) {
      console.error('[AdminStreakService] Error adjusting streak:', error);
      throw error;
    }
  },
};

// ============================================================
// ANALYTICS ADMIN
// ============================================================

export const adminAnalyticsService = {
  /**
   * Get analytics overview
   */
  async getOverview(): Promise<AdminAnalyticsOverview> {
    try {
      const response = await adminAPI.analytics.getOverview();
      
      if (!response.success || !response.data) {
        throw new Error('Invalid get overview response');
      }
      
      return response.data;
    } catch (error) {
      console.error('[AdminAnalyticsService] Error getting overview:', error);
      throw error;
    }
  },

  /**
   * Get recent activity
   */
  async getActivity(hours = 24, limit = 100): Promise<{
    logins: Array<{
      timestamp: string;
      userId: string;
      username: string;
    }>;
    predictions: Array<{
      timestamp: string;
      predictionId: string;
      userId: string;
      pointsWagered: number;
    }>;
    warGames: Array<{
      timestamp: string;
      warGameId: string;
      userId: string;
      action: string;
    }>;
    pointsTransactions: Array<{
      timestamp: string;
      userId: string;
      amount: number;
      type: string;
    }>;
  }> {
    try {
      const response = await adminAPI.analytics.getActivity(hours, limit);
      
      if (!response.success || !response.data) {
        throw new Error('Invalid get activity response');
      }
      
      return response.data;
    } catch (error) {
      console.error('[AdminAnalyticsService] Error getting activity:', error);
      throw error;
    }
  },
};

// ============================================================
// SYSTEM ADMIN
// ============================================================

export const adminSystemService = {
  /**
   * Get system health
   */
  async getHealth(): Promise<AdminSystemHealth> {
    try {
      const response = await adminAPI.system.getHealth();
      
      if (!response.success || !response.data) {
        throw new Error('Invalid get health response');
      }
      
      return response.data;
    } catch (error) {
      console.error('[AdminSystemService] Error getting health:', error);
      throw error;
    }
  },

  /**
   * Clear cache
   */
  async clearCache(type: 'all' | 'users' | 'nfts' | 'predictions'): Promise<{
    cleared: boolean;
    type: string;
  }> {
    try {
      const response = await adminAPI.system.clearCache(type);
      
      if (!response.success || !response.data) {
        throw new Error('Invalid clear cache response');
      }
      
      return {
        cleared: response.data.cleared,
        type: response.data.type,
      };
    } catch (error) {
      console.error('[AdminSystemService] Error clearing cache:', error);
      throw error;
    }
  },

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<AdminCacheStats> {
    try {
      const response = await adminAPI.system.getCacheStats();
      
      if (!response.success || !response.data) {
        throw new Error('Invalid get cache stats response');
      }
      
      return response.data;
    } catch (error) {
      console.error('[AdminSystemService] Error getting cache stats:', error);
      throw error;
    }
  },

  /**
   * Get system logs
   */
  async getLogs(params: {
    level?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    logs: AdminLogEntry[];
    total: number;
  }> {
    try {
      const response = await adminAPI.system.getLogs(params);
      
      if (!response.success || !response.data) {
        throw new Error('Invalid get logs response');
      }
      
      return {
        logs: response.data.logs,
        total: response.data.total,
      };
    } catch (error) {
      console.error('[AdminSystemService] Error getting logs:', error);
      throw error;
    }
  },
};

// ============================================================
// MAIN ADMIN SERVICE EXPORT
// ============================================================

export const adminService = {
  predictions: adminPredictionService,
  users: adminUserService,
  warGames: adminWarGameService,
  leaderboard: adminLeaderboardService,
  streaks: adminStreakService,
  analytics: adminAnalyticsService,
  system: adminSystemService,
};
