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
  getDashboardStats,
  getUserPointsHistory,
  getUserPointsForPeriod,
  getCurrentWeekNumber,
  getCurrentMonth,
  getCurrentYear,
  calculateTotalPoints,
  getWeekDateRange,
  getMonthDateRange,
  getAllTimeDateRange,
  getLeaderboardDateRange,
  formatDateToUTC
} from './services/leaderboardService';

// Hooks
export { 
  useLeaderboard, 
  useUserRank, 
  usePointsHistory, 
  useDashboardStats,
  formatRank,
  getRankInfo
} from './hooks';

