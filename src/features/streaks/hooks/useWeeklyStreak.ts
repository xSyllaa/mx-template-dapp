import { useState, useEffect, useCallback } from 'react';
import { useGetAccount } from 'lib';
import { useSupabaseAuth } from 'hooks/useSupabaseAuth';
import { ClaimStatus } from '../types';
import type {
  WeekStreak,
  DayOfWeek,
  ClaimRewardResponse,
  WeekStreakStats,
  DayClaimState
} from '../types';
import {
  getCurrentWeekStreak,
  claimDailyReward,
  calculateConsecutiveDays,
  getCurrentDayOfWeek,
  getClaimReward
} from '../services/streakService';

interface UseWeeklyStreakReturn {
  weekStreak: WeekStreak | null;
  loading: boolean;
  error: Error | null;
  claimDay: (day: DayOfWeek) => Promise<ClaimRewardResponse>;
  refresh: () => Promise<void>;
  stats: WeekStreakStats | null;
  daysState: DayClaimState[];
  canClaimToday: boolean;
  todaysClaim: DayClaimState | null;
}

/**
 * Hook to manage weekly streak state and operations
 */
export const useWeeklyStreak = (): UseWeeklyStreakReturn => {
  const { address } = useGetAccount();
  const { isAuthenticated, loading: authLoading } = useSupabaseAuth();
  const [weekStreak, setWeekStreak] = useState<WeekStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get user_id from localStorage (set during Supabase auth)
  const getUserId = useCallback((): string | null => {
    const storedUser = localStorage.getItem('galacticx.user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.id;
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  // Fetch current week streak
  const fetchWeekStreak = useCallback(async () => {
    if (!address) {
      setLoading(false);
      setWeekStreak(null);
      setError(null);
      return;
    }

    // Wait for authentication to complete
    if (authLoading) {
      setLoading(true);
      return;
    }

    // If not authenticated, clear data and show error
    if (!isAuthenticated) {
      setError(new Error('User not authenticated'));
      setLoading(false);
      setWeekStreak(null);
      return;
    }

    const userId = getUserId();
    if (!userId) {
      setError(new Error('User not authenticated'));
      setLoading(false);
      setWeekStreak(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentWeekStreak(userId);
      setWeekStreak(data);
    } catch (err) {
      console.error('[useWeeklyStreak] Error fetching streak:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [address, isAuthenticated, authLoading, getUserId]);

  // Initial fetch
  useEffect(() => {
    fetchWeekStreak();
  }, [fetchWeekStreak]);

  // Listen for authentication changes
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('[useWeeklyStreak] Authentication state changed, refreshing...');
      fetchWeekStreak();
    };

    // Listen for custom auth events
    window.addEventListener('supabaseAuthChanged', handleAuthChange);
    window.addEventListener('retrySupabaseAuth', handleAuthChange);

    return () => {
      window.removeEventListener('supabaseAuthChanged', handleAuthChange);
      window.removeEventListener('retrySupabaseAuth', handleAuthChange);
    };
  }, [fetchWeekStreak]);

  // Claim a day's reward
  const claimDay = useCallback(
    async (day: DayOfWeek): Promise<ClaimRewardResponse> => {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        const response = await claimDailyReward(userId, day);
        // Refresh data after successful claim
        await fetchWeekStreak();
        return response;
      } catch (err) {
        console.error('[useWeeklyStreak] Error claiming day:', err);
        throw err;
      }
    },
    [getUserId, fetchWeekStreak]
  );

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchWeekStreak();
  }, [fetchWeekStreak]);

  // Calculate stats
  const stats: WeekStreakStats | null = weekStreak
    ? {
        daysClaimed: Object.values(weekStreak.claims).filter(Boolean).length,
        totalPoints: weekStreak.total_points,
        consecutiveDays: calculateConsecutiveDays(weekStreak.claims),
        completionRate:
          (Object.values(weekStreak.claims).filter(Boolean).length / 7) * 100,
        isCompleted: weekStreak.completed
      }
    : null;

  // Calculate days state for calendar
  const daysState: DayClaimState[] = (() => {
    if (!weekStreak) return [];

    const currentDay = getCurrentDayOfWeek();
    const days: DayOfWeek[] = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday'
    ];

    const currentDayIndex = days.indexOf(currentDay);
    const consecutiveDays = calculateConsecutiveDays(weekStreak.claims);

    return days.map((day, index) => {
      const claimed = weekStreak.claims[day] === true;
      const isToday = day === currentDay;
      const isPast = index < currentDayIndex;
      const isFuture = index > currentDayIndex;

      let status: ClaimStatus;
      if (claimed) {
        status = ClaimStatus.CLAIMED;
      } else if (isToday) {
        status = ClaimStatus.AVAILABLE;
      } else if (isPast) {
        status = ClaimStatus.MISSED;
      } else {
        status = ClaimStatus.LOCKED;
      }

      // Calculate points for this day
      let points = 0;
      if (claimed) {
        // Points already earned (need to reconstruct)
        // Count how many consecutive days up to this day
        const daysUpToThis = days.slice(0, index + 1);
        const consecutiveUpToThis = daysUpToThis.filter(
          (d) => weekStreak.claims[d]
        ).length;
        // If this day was part of consecutive streak
        if (consecutiveUpToThis > 0) {
          points = consecutiveUpToThis * 10;
        }
      } else if (isToday) {
        // Points available today
        points = getClaimReward(consecutiveDays);
      }

      return {
        day,
        claimed,
        isToday,
        points,
        status
      };
    });
  })();

  // Today's claim info
  const todaysClaim: DayClaimState | null =
    daysState.find((d) => d.isToday) || null;

  // Can claim today if not already claimed
  const canClaimToday =
    todaysClaim !== null && todaysClaim.status === ClaimStatus.AVAILABLE;

  return {
    weekStreak,
    loading,
    error,
    claimDay,
    refresh,
    stats,
    daysState,
    canClaimToday,
    todaysClaim
  };
};

