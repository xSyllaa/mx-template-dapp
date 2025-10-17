// TypeScript types for Weekly Streaks feature

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

export const DAY_NUMBERS: Record<DayOfWeek, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7
};

export enum ClaimStatus {
  CLAIMED = 'claimed',
  AVAILABLE = 'available',
  LOCKED = 'locked',
  MISSED = 'missed'
}

export interface DayClaimState {
  day: DayOfWeek;
  claimed: boolean;
  isToday: boolean;
  points: number;
  status: ClaimStatus;
}

export interface WeekClaims {
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
  saturday?: boolean;
  sunday?: boolean;
}

export interface WeekStreak {
  id: string;
  user_id: string;
  week_start: string; // ISO date string (Monday)
  claims: WeekClaims;
  total_points: number;
  bonus_tokens: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClaimRewardResponse {
  success: boolean;
  points_earned: number;
  consecutive_days: number;
  total_points: number;
  message?: string;
}

export interface WeekStreakStats {
  daysClaimed: number;
  totalPoints: number;
  consecutiveDays: number;
  completionRate: number;
  isCompleted: boolean;
}

