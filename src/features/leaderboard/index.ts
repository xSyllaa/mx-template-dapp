// Public API for leaderboard feature

// Types
export type {
  LeaderboardType,
  PointsSourceType,
  PointsTransaction,
  LeaderboardEntry,
  UserRankInfo,
  LeaderboardFilters,
  LeaderboardData,
  PointsHistoryItem
} from './types';

// Services
export {
  recordPointsTransaction,
  getLeaderboard,
  getUserRank,
  getUserPointsHistory,
  getUserPointsForPeriod,
  getCurrentWeekNumber,
  getCurrentMonth,
  getCurrentYear,
  calculateTotalPoints
} from './services/leaderboardService';

// Hooks
export { useLeaderboard, useUserRank, usePointsHistory } from './hooks';

