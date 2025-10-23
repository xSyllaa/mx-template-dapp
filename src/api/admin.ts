/**
 * Admin API
 * Handles admin operations for predictions, users, warGames, analytics, and system
 */

import { apiClient } from './client';

// ============================================================
// TYPES
// ============================================================

// Admin User Types
export interface AdminUser {
  id: string;
  walletAddress: string;
  username: string | null;
  role: 'user' | 'admin' | 'banned';
  totalPoints: number;
  nftCount: number;
  createdAt: string;
  lastActive: string;
  isBanned?: boolean;
  banInfo?: {
    reason: string;
    bannedAt: string;
    banEnd: string | null;
  } | null;
}

export interface AdminPrediction {
  id: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  status: 'open' | 'closed' | 'resulted' | 'cancelled';
  startDate: string;
  closeDate: string;
  updatedAt: string;
}

export interface AdminWarGame {
  id: string;
  creator: AdminUser;
  opponent: AdminUser | null;
  winner: AdminUser | null;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  pointsStake: number;
  pointsAwarded: number;
  creatorScore: number | null;
  opponentScore: number | null;
  matchDate: string | null;
  entryDeadline: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBet {
  userId: string;
  username: string;
  walletAddress: string;
  selectedOptionId: string;
  pointsWagered: number;
  pointsEarned: number;
  isCorrect: boolean | null;
  createdAt: string;
}

export interface AdminBetStats {
  totalPointsWagered: number;
  distributionByOption: Record<string, { count: number; totalPoints: number }>;
}

export interface AdminWinnersPreview {
  winningOptionId: string;
  calculationType: string;
  totalPool: number;
  winningPool: number;
  losingPool: number;
  ratio: number;
  winners: Array<{
    userId: string;
    username: string;
    pointsWagered: number;
    estimatedWinnings: number;
  }>;
  losersCount: number;
}

export interface AdminWarGameStats {
  totalGames: number;
  byStatus: {
    open: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  totalPointsStaked: number;
  averageStake: number;
  mostActiveUsers: Array<{
    userId: string;
    username: string;
    gamesPlayed: number;
    winRate: number;
  }>;
}

export interface AdminUserStats {
  totalPredictions: number;
  correctPredictions: number;
  winRate: number;
  totalWarGames: number;
  warGamesWon: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  netPoints: number;
}

export interface AdminRecentActivity {
  type: string;
  description: string;
  timestamp: string;
}

export interface AdminLeaderboardStats {
  totalUsers: number;
  totalPointsInCirculation: number;
  pointsDistributedToday: number;
  pointsDistributedThisWeek: number;
  topEarners: Array<{
    userId: string;
    username: string;
    totalEarned: number;
  }>;
  topSpenders: Array<{
    userId: string;
    username: string;
    totalSpent: number;
  }>;
  averageUserPoints: number;
  medianUserPoints: number;
}

export interface AdminStreakStats {
  currentWeek: {
    totalActiveStreaks: number;
    completedStreaks: number;
    averageProgress: number;
    pointsDistributed: number;
  };
  allTime: {
    totalStreaksCompleted: number;
    totalPointsDistributed: number;
    mostConsistentUsers: Array<{
      userId: string;
      username: string;
      weeksCompleted: number;
    }>;
  };
}

export interface AdminAnalyticsOverview {
  users: {
    total: number;
    activeToday: number;
    activeThisWeek: number;
    newThisWeek: number;
  };
  predictions: {
    total: number;
    open: number;
    totalBets: number;
    totalPointsWagered: number;
  };
  warGames: {
    total: number;
    active: number;
    totalPointsStaked: number;
  };
  economy: {
    totalPointsInCirculation: number;
    pointsDistributedToday: number;
    pointsDistributedThisWeek: number;
  };
  engagement: {
    dailyActiveUsers: Array<{ date: string; count: number }>;
    predictionParticipation: number;
    warGameParticipation: number;
  };
}

export interface AdminSystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: {
      connected: boolean;
      latency: number;
      activeConnections: number;
    };
    multiversxAPI: {
      available: boolean;
      latency: number;
    };
    cache: {
      hitRate: number;
      size: number;
    };
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  errors: string[];
}

export interface AdminCacheStats {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  byType: Record<string, { entries: number; size: number }>;
}

export interface AdminLogEntry {
  timestamp: string;
  level: string;
  message: string;
  context: Record<string, any>;
}

// ============================================================
// PREDICTIONS ADMIN
// ============================================================

export const adminPredictionsAPI = {
  /**
   * Change prediction status
   */
  async changeStatus(
    predictionId: string,
    status: 'open' | 'closed' | 'cancelled'
  ) {
    return apiClient(`/admin/predictions/${predictionId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Cancel prediction with refund
   */
  async cancel(predictionId: string) {
    return apiClient(`/admin/predictions/${predictionId}/cancel`, {
      method: 'POST',
    });
  },

  /**
   * Get all bets for a prediction
   */
  async getBets(predictionId: string, limit = 50, offset = 0) {
    return apiClient(
      `/admin/predictions/${predictionId}/bets?limit=${limit}&offset=${offset}`
    );
  },

  /**
   * Preview winners calculation
   */
  async getWinnersPreview(predictionId: string, winningOptionId: string) {
    return apiClient(
      `/admin/predictions/${predictionId}/winners-preview?winningOptionId=${winningOptionId}`
    );
  },
};

// ============================================================
// USERS ADMIN
// ============================================================

export const adminUsersAPI = {
  /**
   * Get all users with filters
   */
  async getAll(params: {
    limit?: number;
    offset?: number;
    search?: string;
    sortBy?: 'created_at' | 'total_points' | 'username';
    role?: 'all' | 'user' | 'admin' | 'banned';
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    return apiClient(`/admin/users?${queryParams}`);
  },

  /**
   * Get user details
   */
  async getById(userId: string) {
    return apiClient(`/admin/users/${userId}`);
  },

  /**
   * Change user role
   */
  async changeRole(userId: string, role: 'user' | 'admin' | 'banned') {
    return apiClient(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  /**
   * Ban user
   */
  async ban(userId: string, reason: string, duration?: number) {
    return apiClient(`/admin/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason, duration }),
    });
  },

  /**
   * Unban user
   */
  async unban(userId: string) {
    return apiClient(`/admin/users/${userId}/unban`, {
      method: 'POST',
    });
  },

  /**
   * Adjust user points
   */
  async adjustPoints(userId: string, amount: number, reason: string) {
    return apiClient(`/admin/users/${userId}/points`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  },
};

// ============================================================
// WAR GAMES ADMIN
// ============================================================

export const adminWarGamesAPI = {
  /**
   * Get all war games with filters
   */
  async getAll(params: {
    status?: 'all' | 'open' | 'in_progress' | 'completed' | 'cancelled';
    limit?: number;
    offset?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    return apiClient(`/admin/wargames?${queryParams}`);
  },

  /**
   * Validate war game result
   */
  async validate(
    warGameId: string,
    winnerId: string,
    creatorScore: number,
    opponentScore: number
  ) {
    return apiClient(`/admin/wargames/${warGameId}/validate`, {
      method: 'POST',
      body: JSON.stringify({ winnerId, creatorScore, opponentScore }),
    });
  },

  /**
   * Force cancel war game
   */
  async forceCancel(warGameId: string, reason: string) {
    return apiClient(`/admin/wargames/${warGameId}/force-cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Get war games statistics
   */
  async getStats() {
    return apiClient('/admin/wargames/stats');
  },
};

// ============================================================
// LEADERBOARD ADMIN
// ============================================================

export const adminLeaderboardAPI = {
  /**
   * Adjust user points
   */
  async adjustPoints(
    userId: string,
    amount: number,
    reason: string,
    sourceType = 'admin_adjustment'
  ) {
    return apiClient('/admin/leaderboard/adjust-points', {
      method: 'POST',
      body: JSON.stringify({ userId, amount, reason, sourceType }),
    });
  },

  /**
   * Reset leaderboard
   */
  async reset(type: 'weekly' | 'monthly', confirmationCode: string) {
    return apiClient('/admin/leaderboard/reset', {
      method: 'POST',
      body: JSON.stringify({ type, confirmationCode }),
    });
  },

  /**
   * Get leaderboard statistics
   */
  async getStats() {
    return apiClient('/admin/leaderboard/stats');
  },
};

// ============================================================
// STREAKS ADMIN
// ============================================================

export const adminStreaksAPI = {
  /**
   * Get streaks statistics
   */
  async getStats() {
    return apiClient('/admin/streaks/stats');
  },

  /**
   * Adjust user streak
   */
  async adjust(
    userId: string,
    action: 'reset' | 'complete_day' | 'complete_week',
    dayOfWeek?: string,
    reason?: string
  ) {
    return apiClient(`/admin/streaks/${userId}/adjust`, {
      method: 'POST',
      body: JSON.stringify({ action, dayOfWeek, reason }),
    });
  },
};

// ============================================================
// ANALYTICS ADMIN
// ============================================================

export const adminAnalyticsAPI = {
  /**
   * Get analytics overview
   */
  async getOverview() {
    return apiClient('/admin/analytics/overview');
  },

  /**
   * Get recent activity
   */
  async getActivity(hours = 24, limit = 100) {
    return apiClient(`/admin/analytics/activity?hours=${hours}&limit=${limit}`);
  },
};

// ============================================================
// SYSTEM ADMIN
// ============================================================

export const adminSystemAPI = {
  /**
   * Get system health
   */
  async getHealth() {
    return apiClient('/admin/system/health');
  },

  /**
   * Clear cache
   */
  async clearCache(type: 'all' | 'users' | 'nfts' | 'predictions') {
    return apiClient('/admin/system/cache/clear', {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  },

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return apiClient('/admin/system/cache/stats');
  },

  /**
   * Get system logs
   */
  async getLogs(params: {
    level?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    return apiClient(`/admin/system/logs?${queryParams}`);
  },
};

// ============================================================
// MAIN ADMIN API EXPORT
// ============================================================

export const adminAPI = {
  predictions: adminPredictionsAPI,
  users: adminUsersAPI,
  warGames: adminWarGamesAPI,
  leaderboard: adminLeaderboardAPI,
  streaks: adminStreaksAPI,
  analytics: adminAnalyticsAPI,
  system: adminSystemAPI,
};
