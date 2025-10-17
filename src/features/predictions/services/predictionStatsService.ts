import { supabase } from 'lib/supabase/client';
import type { PredictionStats, PredictionOptionStats, Prediction } from '../types';

/**
 * Calculate and fetch real-time statistics for a prediction
 * @param predictionId - Prediction UUID
 * @returns Aggregated stats for all options
 */
export const getPredictionStats = async (
  predictionId: string
): Promise<PredictionStats> => {
  try {
    // Fetch all user predictions for this prediction
    const { data: userPredictions, error } = await supabase
      .from('user_predictions')
      .select('selected_option_id, points_wagered, user_id, users!inner(username)')
      .eq('prediction_id', predictionId);

    if (error) throw error;

    if (!userPredictions || userPredictions.length === 0) {
      return {
        total_pool: 0,
        total_participants: 0,
        options: []
      };
    }

    // Calculate totals
    const total_pool = userPredictions.reduce(
      (sum, pred) => sum + (pred.points_wagered || 0),
      0
    );
    const total_participants = userPredictions.length;

    // Group by option
    const optionMap = new Map<string, {
      total_wagered: number;
      participant_count: number;
      bets: Array<{ amount: number; username: string }>;
    }>();

    userPredictions.forEach((pred) => {
      const optionId = pred.selected_option_id;
      const amount = pred.points_wagered || 0;
      const username = (pred.users as any)?.username || 'Anonymous';

      if (!optionMap.has(optionId)) {
        optionMap.set(optionId, {
          total_wagered: 0,
          participant_count: 0,
          bets: []
        });
      }

      const option = optionMap.get(optionId)!;
      option.total_wagered += amount;
      option.participant_count += 1;
      option.bets.push({ amount, username });
    });

    // Build option stats
    const options: PredictionOptionStats[] = Array.from(optionMap.entries()).map(
      ([option_id, data]) => {
        const percentage = total_pool > 0 ? (data.total_wagered / total_pool) * 100 : 0;
        const ratio = data.total_wagered > 0 ? total_pool / data.total_wagered : 1;
        
        // Find biggest bet
        const sortedBets = data.bets.sort((a, b) => b.amount - a.amount);
        const biggestBet = sortedBets[0];

        return {
          option_id,
          total_wagered: data.total_wagered,
          participant_count: data.participant_count,
          percentage,
          ratio,
          biggest_bet: biggestBet?.amount || 0,
          top_bettor: biggestBet?.username || null
        };
      }
    );

    return {
      total_pool,
      total_participants,
      options
    };
  } catch (error) {
    console.error('[PredictionStatsService] Error fetching stats:', error);
    throw error;
  }
};

/**
 * Validate if a user can place a bet with the specified amount
 * @param userId - User's UUID
 * @param amount - Amount to wager
 * @param prediction - Prediction object with min/max limits
 * @returns Validation result with error message if invalid
 */
export const validateBetAmount = async (
  userId: string,
  amount: number,
  prediction: Prediction
): Promise<{ valid: boolean; error?: string }> => {
  try {
    // Check min/max limits
    if (amount < prediction.min_bet_points) {
      return {
        valid: false,
        error: `Minimum bet is ${prediction.min_bet_points} points`
      };
    }

    if (amount > prediction.max_bet_points) {
      return {
        valid: false,
        error: `Maximum bet is ${prediction.max_bet_points} points`
      };
    }

    // Check user's balance
    const { data: user, error } = await supabase
      .from('users')
      .select('total_points')
      .eq('id', userId)
      .single();

    if (error) throw error;

    if (!user || user.total_points < amount) {
      return {
        valid: false,
        error: `Insufficient points. You have ${user?.total_points || 0} points`
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('[PredictionStatsService] Error validating bet:', error);
    return {
      valid: false,
      error: 'Failed to validate bet amount'
    };
  }
};

/**
 * Subscribe to real-time updates for prediction stats
 * @param predictionId - Prediction UUID
 * @param callback - Function to call when stats change
 * @returns Cleanup function to unsubscribe
 */
export const subscribeToPredictionStats = (
  predictionId: string,
  callback: (stats: PredictionStats) => void
): (() => void) => {
  const channel = supabase
    .channel(`prediction-stats-${predictionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_predictions',
        filter: `prediction_id=eq.${predictionId}`
      },
      async () => {
        // Refetch stats when any prediction changes
        try {
          const stats = await getPredictionStats(predictionId);
          callback(stats);
        } catch (error) {
          console.error('[PredictionStatsService] Error in subscription:', error);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

