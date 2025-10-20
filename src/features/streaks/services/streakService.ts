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
    const weekStart = getCurrentWeekStart();

    // Read existing record only, do NOT create
    const { data, error } = await supabase
      .from('weekly_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .maybeSingle();

    if (error) {
      console.error('[StreakService] Error getting current week streak:', error);
      throw error;
    }

    // Return data or null (creation happens only on claim)
    return data ? (data as WeekStreak) : null;
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
    // Get current week streak (may be null if first claim)
    let weekStreak = await getCurrentWeekStreak(userId);
    
    // Create week streak only if it doesn't exist (first claim of the week)
    if (!weekStreak) {
      const weekStart = getCurrentWeekStart();
      console.log('[StreakService] First claim of the week - Creating streak record');
      
      const { data: created, error: createError } = await supabase
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
        
      if (createError) {
        console.error('[StreakService] Error creating streak record:', createError);
        throw createError;
      }
      
      weekStreak = created as WeekStreak;
      console.log('[StreakService] Streak record created:', weekStreak.id);
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

    // Record points transaction for the claim
    const { error: userUpdateError } = await supabase.rpc(
      'record_points_transaction',
      {
        p_user_id: userId,
        p_amount: pointsEarned,
        p_source_type: 'streak_claim',
        p_source_id: weekStreak.id,
        p_metadata: {
          day_of_week: dayOfWeek,
          consecutive_days: consecutiveDays,
          week_start: weekStreak.week_start
        }
      }
    );

    if (userUpdateError) {
      console.warn(
        '[StreakService] Failed to record points transaction:',
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
 * Get streak history for the last N weeks (READ ONLY)
 */
export const getStreakHistory = async (
  userId: string,
  weeksCount = 4
): Promise<WeekStreak[]> => {
  try {
    const { data, error } = await supabase
      .from('weekly_streaks')
      .select('*')
      .eq('user_id', userId)
      .order('week_start', { ascending: false })
      .limit(weeksCount);

    if (error) {
      console.error('[StreakService] Error getting streak history:', error);
      throw error;
    }

    return (data as WeekStreak[]) || [];
  } catch (error) {
    console.error('[StreakService] Error getting streak history:', error);
    throw error;
  }
};

