import { supabase } from 'lib/supabase/client';
import { streaksAPI } from 'api/streaks';
import type {
  WeekStreak,
  WeekClaims,
  DayOfWeek,
  ClaimRewardResponse,
  DAYS_OF_WEEK
} from '../types';

/**
 * Get the Monday date of the current week
 */
export const getCurrentWeekStart = (): string => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0]; // YYYY-MM-DD
};

/**
 * Get current day of week as our DayOfWeek type
 */
export const getCurrentDayOfWeek = (): DayOfWeek => {
  const days: DayOfWeek[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
  ];
  return days[new Date().getDay()];
};

/**
 * Calculate consecutive days from the most recent claimed day backwards
 * Returns the number of consecutive days claimed from the end of the streak
 */
export const calculateConsecutiveDays = (claims: WeekClaims): number => {
  const daysOrder: DayOfWeek[] = [
    'sunday',
    'saturday',
    'friday',
    'thursday',
    'wednesday',
    'tuesday',
    'monday'
  ];

  let consecutive = 0;
  let foundClaimedDay = false;
  
  for (const day of daysOrder) {
    if (claims[day]) {
      consecutive++;
      foundClaimedDay = true;
    } else if (foundClaimedDay) {
      // Stop at first non-claimed day after finding claimed days
      break;
    }
  }

  return consecutive;
};

/**
 * Calculate reward points based on consecutive days
 * Day 1 = 10 points, Day 2 = 20 points, ..., Day 7 = 70 points
 */
export const getClaimReward = (consecutiveDays: number): number => {
  // consecutiveDays is the current streak BEFORE this claim
  // So we add 1 to get the reward for the next day
  const nextDay = consecutiveDays + 1;
  return nextDay * 10; // 10, 20, 30, 40, 50, 60, 70
};

/**
 * Get the current week's streak record for a user (READ ONLY)
 * Returns null if no streak exists yet - creation happens only on claim
 */
export const getCurrentWeekStreak = async (
  userId: string
): Promise<WeekStreak | null> => {
  try {
    console.log('[StreakService] Fetching current streak for user:', userId);
    const response = await streaksAPI.getCurrent();
    
    console.log('[StreakService] API response:', response);
    
    // Check if response is successful and has data
    if (!response.success || !response.data) {
      console.log('[StreakService] Invalid response:', response);
      throw new Error('Invalid streak response');
    }

    const data = response.data as any; // Temporary type assertion
    console.log('[StreakService] Streak data:', data);
    
    // Check if we have a weekStreak object in the response
    if (!data.weekStreak) {
      console.log('[StreakService] No weekStreak in response');
      return null;
    }

    // Use the weekStreak data directly from the API
    const weekStreak = {
      id: data.weekStreak.id,
      user_id: data.weekStreak.user_id,
      week_start: data.weekStreak.week_start,
      week_end: data.weekStreak.week_end || new Date(new Date(data.weekStreak.week_start).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      claims: data.weekStreak.claims,
      total_points: parseInt(data.weekStreak.total_points) || 0,
      bonus_tokens: parseInt(data.weekStreak.bonus_tokens) || 0,
      completed: data.weekStreak.completed,
      created_at: data.weekStreak.created_at,
      updated_at: data.weekStreak.updated_at
    };
    
    console.log('[StreakService] Using weekStreak from API:', weekStreak);
    return weekStreak;
  } catch (error) {
    console.error('[StreakService] Error getting current week streak:', error);
    throw error;
  }
};

/**
 * Claim daily reward for a specific day
 * Creates the week streak record if it doesn't exist yet
 */
export const claimDailyReward = async (
  userId: string,
  dayOfWeek: DayOfWeek
): Promise<ClaimRewardResponse> => {
  try {
    console.log('[StreakService] Claiming reward for day:', dayOfWeek);
    const response = await streaksAPI.claim(dayOfWeek);
    
    console.log('[StreakService] Claim response:', response);
    
    // Check if response is successful and has data
    if (!response.success || !response.data) {
      throw new Error('Invalid claim response');
    }
    
    return {
      success: true,
      points_earned: response.data.pointsEarned,
      consecutive_days: response.data.newStreak,
      total_points: response.data.totalPoints,
      message: response.message
    };
  } catch (error) {
    console.error('[StreakService] Error claiming daily reward:', error);
    throw error;
  }
};

/**
 * Get streak history for the last N weeks (READ ONLY)
 */
export const getStreakHistory = async (
  userId: string,
  weeksCount = 4
): Promise<WeekStreak[]> => {
  try {
    const response = await streaksAPI.getHistory(weeksCount);
    
    // Check if response is successful and has data
    if (!response.success || !response.data) {
      throw new Error('Invalid streak history response');
    }
    
    // Transform API response to WeekStreak format
    return response.data.streaks.map((streak: any) => ({
      id: streak.id,
      user_id: streak.userId,
      week_start: streak.weekStart,
      week_end: streak.weekEnd,
      claims: streak.daysCompleted.reduce((acc: WeekClaims, day: DayOfWeek) => {
        acc[day] = true;
        return acc;
      }, {} as WeekClaims),
      total_points: streak.totalPointsEarned,
      bonus_tokens: 0,
      completed: streak.isCompleted,
      created_at: streak.createdAt,
      updated_at: streak.updatedAt
    })) as WeekStreak[];
  } catch (error) {
    console.error('[StreakService] Error getting streak history:', error);
    throw error;
  }
};

