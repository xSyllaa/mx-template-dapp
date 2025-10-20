import { supabase } from 'lib/supabase/client';
import type { Prediction } from '../types';

export interface WinnerPreview {
  user_id: string;
  username: string;
  selected_option_id: string;
  points_wagered: number;
  calculated_winnings: number;
  total_after_win: number;
}

export interface WinnersCalculation {
  winners: WinnerPreview[];
  totalWinners: number;
  totalPool: number;
  winningPool: number;
  calculationType: 'fixed_odds' | 'pool_ratio';
  odds: string;
  ratio: number;
}

/**
 * Get actual winners for a prediction with calculated winnings
 * @param predictionId - Prediction UUID
 * @param winningOptionId - Selected winning option ID
 * @returns Detailed winners list with calculated winnings
 */
export const getPredictionWinnersPreview = async (
  predictionId: string,
  winningOptionId: string
): Promise<WinnersCalculation> => {
  try {
    // Get prediction details
    const { data: prediction, error: predError } = await supabase
      .from('predictions')
      .select('*')
      .eq('id', predictionId)
      .single();

    if (predError || !prediction) {
      throw new Error('Prediction not found');
    }

    // Get all user predictions for this prediction
    const { data: userPredictions, error: usersError } = await supabase
      .from('user_predictions')
      .select(`
        user_id,
        selected_option_id,
        points_wagered,
        users!inner(username)
      `)
      .eq('prediction_id', predictionId);

    if (usersError) throw usersError;

    if (!userPredictions || userPredictions.length === 0) {
      return {
        winners: [],
        totalWinners: 0,
        totalPool: 0,
        winningPool: 0,
        calculationType: prediction.bet_calculation_type,
        odds: '',
        ratio: 0
      };
    }

    // Calculate totals
    const totalPool = userPredictions.reduce(
      (sum, pred) => sum + (pred.points_wagered || 0),
      0
    );

    const winningPredictions = userPredictions.filter(
      pred => pred.selected_option_id === winningOptionId
    );

    const winningPool = winningPredictions.reduce(
      (sum, pred) => sum + (pred.points_wagered || 0),
      0
    );

    // Find winning option for odds/ratio calculation
    const winningOption = prediction.options.find(opt => opt.id === winningOptionId);
    if (!winningOption) {
      throw new Error('Winning option not found');
    }

    let ratio: number;
    let odds: string;

    if (prediction.bet_calculation_type === 'fixed_odds') {
      odds = winningOption.odds;
      ratio = parseFloat(odds);
    } else {
      // Pool ratio calculation
      ratio = winningPool > 0 ? totalPool / winningPool : 1;
      odds = '';
    }

    // Calculate winnings for each winner
    const winners: WinnerPreview[] = winningPredictions.map((pred) => {
      let calculatedWinnings: number;

      if (prediction.bet_calculation_type === 'fixed_odds') {
        calculatedWinnings = Math.floor(pred.points_wagered * ratio);
      } else {
        calculatedWinnings = Math.floor(pred.points_wagered * ratio);
      }

      return {
        user_id: pred.user_id,
        username: (pred.users as any)?.username || 'Anonymous',
        selected_option_id: pred.selected_option_id,
        points_wagered: pred.points_wagered || 0,
        calculated_winnings: calculatedWinnings,
        total_after_win: (pred.points_wagered || 0) + calculatedWinnings
      };
    });

    // Sort winners by winnings (descending)
    winners.sort((a, b) => b.calculated_winnings - a.calculated_winnings);

    return {
      winners,
      totalWinners: winners.length,
      totalPool,
      winningPool,
      calculationType: prediction.bet_calculation_type,
      odds,
      ratio
    };

  } catch (error) {
    console.error('[PredictionWinnersService] Error fetching winners preview:', error);
    throw error;
  }
};

/**
 * Get simplified winners count for quick display
 * @param predictionId - Prediction UUID
 * @param winningOptionId - Selected winning option ID
 * @returns Quick winners summary
 */
export const getQuickWinnersCount = async (
  predictionId: string,
  winningOptionId: string
): Promise<{ count: number; totalWinnings: number }> => {
  try {
    const { data, error } = await supabase
      .from('user_predictions')
      .select('points_wagered')
      .eq('prediction_id', predictionId)
      .eq('selected_option_id', winningOptionId);

    if (error) throw error;

    const count = data?.length || 0;
    const totalWinnings = data?.reduce((sum, pred) => sum + (pred.points_wagered || 0), 0) || 0;

    return { count, totalWinnings };
  } catch (error) {
    console.error('[PredictionWinnersService] Error fetching quick count:', error);
    throw error;
  }
};



