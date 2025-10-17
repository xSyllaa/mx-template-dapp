import { supabase } from 'lib/supabase/client';
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
 * Calculate consecutive days from the start of the week
 * Returns the number of consecutive days claimed from Monday onwards
 */
export const calculateConsecutiveDays = (claims: WeekClaims): number => {
  const daysOrder: DayOfWeek[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ];

  let consecutive = 0;
  for (const day of daysOrder) {
    if (claims[day]) {
      consecutive++;
    } else {
      // Stop at first non-claimed day
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
 * Get user's JWT token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('supabase.auth.token');
};

/**
 * Get or create the current week's streak record for a user
 */
export const getCurrentWeekStreak = async (
  userId: string
): Promise<WeekStreak | null> => {
  try {
    const weekStart = getCurrentWeekStart();
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication token not found. Please sign in.');
    }

    // Try to get existing record
    const { data, error } = await supabase
      .from('weekly_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found, which is ok
      throw error;
    }

    // If record exists, return it
    if (data) {
      return data as WeekStreak;
    }

    // Create new record for this week
    const { data: newRecord, error: insertError } = await supabase
      .from('weekly_streaks')
      .insert({
        user_id: userId,
        week_start: weekStart,
        claims: {},
        total_points: 0,
        bonus_tokens: 0,
        completed: false
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return newRecord as WeekStreak;
  } catch (error) {
    console.error('[StreakService] Error getting current week streak:', error);
    throw error;
  }
};

/**
 * Claim daily reward for a specific day
 */
export const claimDailyReward = async (
  userId: string,
  dayOfWeek: DayOfWeek
): Promise<ClaimRewardResponse> => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication token not found. Please sign in.');
    }

    // Get current week streak
    const weekStreak = await getCurrentWeekStreak(userId);

    if (!weekStreak) {
      throw new Error('Failed to get or create week streak record');
    }

    // Check if already claimed
    if (weekStreak.claims[dayOfWeek]) {
      throw new Error('Already claimed for this day');
    }

    // Calculate consecutive days BEFORE this claim
    const consecutiveDays = calculateConsecutiveDays(weekStreak.claims);

    // Calculate reward for this claim
    const pointsEarned = getClaimReward(consecutiveDays);

    // Update claims
    const updatedClaims: WeekClaims = {
      ...weekStreak.claims,
      [dayOfWeek]: true
    };

    // Calculate new total
    const newTotalPoints = weekStreak.total_points + pointsEarned;

    // Check if week is completed
    const isCompleted = Object.keys(updatedClaims).length === 7;

    // Update record in Supabase
    const { data, error } = await supabase
      .from('weekly_streaks')
      .update({
        claims: updatedClaims,
        total_points: newTotalPoints,
        completed: isCompleted
      })
      .eq('id', weekStreak.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Also update user's total_points
    const { error: userUpdateError } = await supabase.rpc(
      'update_user_total_points',
      {
        p_user_id: userId,
        p_points_to_add: pointsEarned
      }
    );

    if (userUpdateError) {
      console.warn(
        '[StreakService] Failed to update user total points:',
        userUpdateError
      );
    }

    return {
      success: true,
      points_earned: pointsEarned,
      consecutive_days: consecutiveDays + 1,
      total_points: newTotalPoints,
      message: `Successfully claimed ${pointsEarned} points!`
    };
  } catch (error) {
    console.error('[StreakService] Error claiming daily reward:', error);
    throw error;
  }
};

/**
 * Get streak history for the last N weeks
 */
export const getStreakHistory = async (
  userId: string,
  weeksCount = 4
): Promise<WeekStreak[]> => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication token not found. Please sign in.');
    }

    const { data, error } = await supabase
      .from('weekly_streaks')
      .select('*')
      .eq('user_id', userId)
      .order('week_start', { ascending: false })
      .limit(weeksCount);

    if (error) {
      throw error;
    }

    return (data as WeekStreak[]) || [];
  } catch (error) {
    console.error('[StreakService] Error getting streak history:', error);
    throw error;
  }
};

