/**
 * API Types for GalacticX Backend
 * Centralized type definitions for API responses
 */

// Generic API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User Types
export interface User {
  id: string;
  walletAddress: string;
  username?: string;
  role: 'user' | 'admin' | 'king';
  totalPoints: number;
  currentStreak: number;
  nftCount: number;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Auth API Types
export interface LoginData {
  user: User;
  accessToken: string;
  expiresIn: string;
}

export interface MeData {
  user: User;
}

export interface CheckWalletData {
  exists: boolean;
  walletAddress?: string;
}

// Leaderboard API Types
export interface LeaderboardEntry {
  userId: string;
  walletAddress: string;
  username?: string;
  points: number;
  rank: number;
  nftCount: number;
  currentStreak: number;
  avatarUrl?: string | null;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  total: number;
  hasMore: boolean;
}

export interface UserRankData {
  userRank: LeaderboardEntry;
  allTimeRank: number;
  weeklyRank: number;
  monthlyRank: number;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  sourceType: string;
  sourceId?: string;
  metadata?: any;
  createdAt: string;
}

export interface PointsHistoryData {
  transactions: PointsTransaction[];
  total: number;
  hasMore: boolean;
}

// Streaks API Types
export interface StreakReward {
  day: number;
  points: number;
}

export interface CurrentStreakData {
  currentStreak: number;
  lastClaimDate: string | null;
  canClaim: boolean;
  streakRewards: StreakReward[];
  nextReward: number;
  daysUntilReset: number;
}

export interface ClaimStreakData {
  pointsEarned: number;
  newStreak: number;
  nextReward: number;
  totalPoints: number;
}

// Predictions API Types
export interface PredictionOption {
  id: string;
  text: string;
  odds: number;
}

export interface Prediction {
  id: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  betType: string;
  options: PredictionOption[];
  status: 'open' | 'closed' | 'resulted';
  startDate: string;
  closeDate: string;
  pointsReward: number;
  minBetPoints: number;
  maxBetPoints: number;
  winningOptionId?: string;
  userPrediction?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PredictionsData {
  predictions: Prediction[];
  total: number;
  hasMore: boolean;
}

export interface PredictionData {
  prediction: Prediction;
}

export interface BetData {
  betId: string;
  pointsWagered: number;
  selectedOption: string;
  potentialWinnings: number;
  remainingPoints: number;
}

// War Games API Types
export interface WarGame {
  id: string;
  creatorId: string;
  opponentId?: string;
  status: 'open' | 'in_progress' | 'completed';
  pointsStake: number;
  entryDeadline: string;
  matchDate?: string;
  creator?: {
    username: string;
    avatarUrl?: string | null;
  };
  opponent?: {
    username: string;
    avatarUrl?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WarGamesData {
  warGames: WarGame[];
  total: number;
  hasMore: boolean;
}

export interface WarGameData {
  warGame: WarGame;
}

// Teams API Types
export interface TeamSlot {
  position: string;
  nftIdentifier: string;
  playerName?: string;
  playerStats?: any;
}

export interface SavedTeam {
  id: string;
  userId: string;
  teamName: string;
  formation: string;
  slots: TeamSlot[];
  totalScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamsData {
  teams: SavedTeam[];
  total: number;
  hasMore: boolean;
}

export interface TeamData {
  team: SavedTeam;
}

// Typed API Responses
export type LoginResponse = ApiResponse<LoginData>;
export type MeResponse = ApiResponse<MeData>;
export type CheckWalletResponse = ApiResponse<CheckWalletData>;

export type LeaderboardResponse = ApiResponse<LeaderboardData>;
export type UserRankResponse = ApiResponse<UserRankData>;
export type PointsHistoryResponse = ApiResponse<PointsHistoryData>;

export type CurrentStreakResponse = ApiResponse<CurrentStreakData>;
export type ClaimStreakResponse = ApiResponse<ClaimStreakData>;

export type PredictionsResponse = ApiResponse<PredictionsData>;
export type PredictionResponse = ApiResponse<PredictionData>;
export type BetResponse = ApiResponse<BetData>;

export type WarGamesResponse = ApiResponse<WarGamesData>;
export type WarGameResponse = ApiResponse<WarGameData>;

export type TeamsResponse = ApiResponse<TeamsData>;
export type TeamResponse = ApiResponse<TeamData>;

// Error Response
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}
