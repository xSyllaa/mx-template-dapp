// Export all public components and hooks
export { WeekCalendar } from './components/WeekCalendar';
export { ClaimButton } from './components/ClaimButton';
export { WeekStats } from './components/WeekStats';

export { useWeeklyStreak } from './hooks/useWeeklyStreak';

export type {
  DayOfWeek,
  WeekStreak,
  ClaimStatus,
  DayClaimState,
  WeekClaims,
  ClaimRewardResponse,
  WeekStreakStats
} from './types';

