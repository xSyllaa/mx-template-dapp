import { supabase } from 'lib/supabase/client';
import { predictionsAPI } from 'api/predictions';
import type {
  Prediction,
  UserPrediction,
  CreatePredictionData,
  UpdatePredictionData,
  ValidateResultResponse
} from '../types';

// ============================================================
// USER OPERATIONS
// ============================================================

/**
 * Get all active predictions (status = 'open' or 'closed')
 * Only show predictions where close_date is after current time
 * Closed predictions are shown but users can't bet on them
 */
export const getActivePredictions = async (): Promise<Prediction[]> => {
  try {
    // Get all predictions and filter for open/closed
    const response = await predictionsAPI.getAll();
    
    // Check if response is successful and has data
    if (!response.success || !response.data) {
      throw new Error('Invalid predictions response');
    }
    
    const now = new Date();
    
    const predictions = response.data.predictions.filter(
      (p) => {
        // Must be open or closed status
        const hasValidStatus = p.status === 'open' || p.status === 'closed';
        
        // Must have close_date after current time
        const isNotExpired = new Date(p.close_date) > now;
        
        return hasValidStatus && isNotExpired;
      }
    );
    
    // Sort by start_date ascending
    predictions.sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    return predictions as Prediction[];
  } catch (error) {
    console.error('[PredictionService] Error fetching active predictions:', error);
    throw error;
  }
};

/**
 * Get prediction history (resulted/closed/expired predictions)
 * @param limit - Number of predictions to fetch (default: 10)
 * @param offset - Pagination offset (default: 0)
 */
export const getRecentHistory = async (
  limit = 10,
  offset = 0
): Promise<Prediction[]> => {
  try {
    const response = await predictionsAPI.getHistory(undefined, limit, offset);
    
    if (!response.success || !response.data) {
      throw new Error('Invalid predictions response');
    }
    
    return response.data.predictions as Prediction[];
  } catch (error) {
    console.error('[PredictionService] Error fetching prediction history:', error);
    throw error;
  }
};

/**
 * Get a specific prediction by ID
 */
export const getPredictionById = async (
  predictionId: string
): Promise<Prediction | null> => {
  try {
    const response = await predictionsAPI.getById(predictionId);
    
    // Check if response is successful and has data
    if (!response.success || !response.data) {
      return null;
    }
    
    return response.data.prediction as Prediction;
  } catch (error) {
    // If error message indicates not found, return null
    if (error instanceof Error && error.message.includes('not found')) {
      return null;
    }
    console.error('[PredictionService] Error fetching prediction:', error);
    throw error;
  }
};

/**
 * Submit a user's prediction
 * @param userId - User's UUID (unused, backend gets it from JWT)
 * @param predictionId - Prediction UUID
 * @param selectedOptionId - Selected option ID
 * @param pointsWagered - Amount of points to wager
 */
export const submitPrediction = async (
  userId: string,
  predictionId: string,
  selectedOptionId: string,
  pointsWagered: number
): Promise<UserPrediction> => {
  try {
    const response = await predictionsAPI.placeBet(
      predictionId,
      selectedOptionId,
      pointsWagered
    );
    
    // Check if response is successful and has data
    if (!response.success || !response.data) {
      throw new Error('Invalid bet response');
    }
    
    // Create a UserPrediction object from the response data
    const userPrediction: UserPrediction = {
      id: response.data.betId,
      user_id: userId,
      prediction_id: predictionId,
      selected_option_id: response.data.selectedOption,
      points_wagered: response.data.pointsWagered,
      points_earned: 0, // Will be set when result is validated
      is_correct: null, // Will be set when result is validated
      created_at: new Date().toISOString()
    };
    
    return userPrediction;
  } catch (error) {
    console.error('[PredictionService] Error submitting prediction:', error);
    throw error;
  }
};

/**
 * Get user's prediction for a specific match
 * @param userId - User's UUID (unused, backend gets it from JWT)
 * @param predictionId - Prediction UUID
 */
export const getUserPrediction = async (
  userId: string,
  predictionId: string
): Promise<UserPrediction | null> => {
  try {
    // Get all user predictions and find the one matching this prediction
    const response = await predictionsAPI.getUserPredictions('active', 1000, 0);
    
    // Check if response is successful and has data
    if (!response.success || !response.data) {
      return null;
    }
    
    const userPrediction = response.data.predictions.find(
      (p: any) => p.prediction_id === predictionId
    );
    
    return userPrediction ? (userPrediction as UserPrediction) : null;
  } catch (error) {
    console.error('[PredictionService] Error fetching user prediction:', error);
    throw error;
  }
};

/**
 * Get all user predictions for multiple predictions at once
 * @param userId - User's UUID (unused, backend gets it from JWT)
 * @param predictionIds - Array of prediction UUIDs
 */
export const getUserPredictions = async (
  userId: string,
  predictionIds: string[]
): Promise<UserPrediction[]> => {
  try {
    if (predictionIds.length === 0) return [];

    // Get all user predictions and filter by prediction IDs
    const response = await predictionsAPI.getUserPredictions('active', 1000, 0);
    
    // Check if response is successful and has data
    if (!response.success || !response.data) {
      return [];
    }
    
    const filtered = response.data.predictions.filter((p: any) =>
      predictionIds.includes(p.prediction_id)
    );

    return filtered as UserPrediction[];
  } catch (error) {
    console.error('[PredictionService] Error fetching user predictions:', error);
    throw error;
  }
};

// ============================================================
// ADMIN OPERATIONS
// ============================================================

/**
 * Get all predictions (admin view)
 */
export const getAllPredictions = async (): Promise<Prediction[]> => {
  try {
    // Use admin API instead of direct Supabase
    const response = await predictionsAPI.getAll();
    
    // 🔍 DEBUG: Log API response
    console.log('🔍 [PredictionService] getAllPredictions API response:', response);
    
    if (!response.success || !response.data) {
      console.error('🔍 [PredictionService] Invalid predictions response:', response);
      throw new Error('Invalid predictions response');
    }
    
    const predictions = response.data.predictions as Prediction[];
    
    // 🔍 DEBUG: Log predictions data
    console.log('🔍 [PredictionService] Predictions from API:', predictions);
    console.log('🔍 [PredictionService] Predictions count:', predictions.length);
    
    // Log each prediction status
    predictions.forEach((prediction, index) => {
      console.log(`🔍 [PredictionService] Prediction ${index + 1} status:`, {
        id: prediction.id,
        status: prediction.status,
        home_team: prediction.home_team,
        away_team: prediction.away_team
      });
    });
    
    return predictions;
  } catch (error) {
    console.error('[PredictionService] Error fetching all predictions:', error);
    throw error;
  }
};

/**
 * Create a new prediction (admin only)
 */
export const createPrediction = async (
  data: CreatePredictionData,
  createdBy: string
): Promise<Prediction> => {
  try {
    // Use Supabase directly for creation (admin API not yet implemented)
    const { data: newPrediction, error } = await supabase
      .from('predictions')
      .insert({
        competition: data.competition,
        home_team: data.home_team,
        away_team: data.away_team,
        bet_type: data.bet_type,
        bet_calculation_type: data.bet_calculation_type,
        extended_bet_type: data.extended_bet_type,
        options: data.options,
        start_date: data.start_date,
        close_date: data.close_date,
        points_reward: data.points_reward,
        min_bet_points: data.min_bet_points,
        max_bet_points: data.max_bet_points,
        created_by: createdBy,
        status: 'open',
        winning_option_id: null
      })
      .select()
      .single();

    if (error) throw error;

    return newPrediction as Prediction;
  } catch (error) {
    console.error('[PredictionService] Error creating prediction:', error);
    throw error;
  }
};

/**
 * Update an existing prediction (admin only)
 */
export const updatePrediction = async (
  predictionId: string,
  data: UpdatePredictionData
): Promise<Prediction> => {
  try {
    const { data: updatedPrediction, error } = await supabase
      .from('predictions')
      .update(data)
      .eq('id', predictionId)
      .select()
      .single();

    if (error) throw error;

    return updatedPrediction as Prediction;
  } catch (error) {
    console.error('[PredictionService] Error updating prediction:', error);
    throw error;
  }
};

/**
 * Validate prediction result (admin only)
 * Sets the winning option and calculates winnings based on calculation type
 * @param predictionId - Prediction UUID
 * @param winningOptionId - ID of the winning option
 */
export const validateResult = async (
  predictionId: string,
  winningOptionId: string
): Promise<ValidateResultResponse> => {
  try {
    // Get the prediction
    const prediction = await getPredictionById(predictionId);
    if (!prediction) {
      throw new Error('Prediction not found');
    }

    // Get all user predictions
    const { data: allPredictions, error: fetchError } = await supabase
      .from('user_predictions')
      .select('*')
      .eq('prediction_id', predictionId);

    if (fetchError) throw fetchError;

    if (!allPredictions || allPredictions.length === 0) {
      throw new Error('No predictions to validate');
    }

    // Get winning bets
    const winningBets = allPredictions.filter(
      (pred) => pred.selected_option_id === winningOptionId
    );

    // Calculate winnings based on calculation type
    let winningsMap: Map<string, number> = new Map();

    if (prediction.bet_calculation_type === 'fixed_odds') {
      // Fixed odds: winnings = bet * odds
      const winningOption = prediction.options.find(opt => opt.id === winningOptionId);
      if (!winningOption) {
        throw new Error('Winning option not found');
      }
      const odds = parseFloat(winningOption.odds);
      
      for (const winner of winningBets) {
        const winnings = Math.floor(winner.points_wagered * odds);
        winningsMap.set(winner.id, winnings);
      }
    } else {
      // Pool ratio (Twitch-style): winnings = bet * (total_pool / winning_option_total)
      const totalPool = allPredictions.reduce(
        (sum, pred) => sum + (pred.points_wagered || 0),
        0
      );
      
      const winningOptionTotal = winningBets.reduce(
        (sum, pred) => sum + (pred.points_wagered || 0),
        0
      );
      
      const ratio = winningOptionTotal > 0 ? totalPool / winningOptionTotal : 1;
      
      for (const winner of winningBets) {
        const winnings = Math.floor(winner.points_wagered * ratio);
        winningsMap.set(winner.id, winnings);
      }
    }

    // Update prediction status and winning option
    const { data: updatedPrediction, error: updateError } = await supabase
      .from('predictions')
      .update({
        status: 'resulted',
        winning_option_id: winningOptionId
      })
      .eq('id', predictionId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update winners with calculated winnings
    for (const winner of winningBets) {
      const winnings = winningsMap.get(winner.id) || 0;
      
      // Update user prediction
      await supabase
        .from('user_predictions')
        .update({
          is_correct: true,
          points_earned: winnings
        })
        .eq('id', winner.id);

      // Add winnings to user's total points via transaction record
      await supabase.rpc('record_points_transaction', {
        p_user_id: winner.user_id,
        p_amount: winnings,
        p_source_type: 'prediction_win',
        p_source_id: predictionId,
        p_metadata: {
          selected_option_id: winner.selected_option_id,
          points_wagered: winner.points_wagered
        }
      });
    }

    // Mark losers (they lose their wagered amount, which was already deducted)
    const losingBets = allPredictions.filter(
      (pred) => pred.selected_option_id !== winningOptionId
    );

    for (const loser of losingBets) {
      await supabase
        .from('user_predictions')
        .update({
          is_correct: false,
          points_earned: 0
        })
        .eq('id', loser.id);
    }

    return {
      success: true,
      prediction: updatedPrediction as Prediction,
      affected_users: allPredictions.length
    };
  } catch (error) {
    console.error('[PredictionService] Error validating result:', error);
    throw error;
  }
};

/**
 * Delete a prediction (admin only)
 */
export const deletePrediction = async (predictionId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('predictions')
      .delete()
      .eq('id', predictionId);

    if (error) throw error;
  } catch (error) {
    console.error('[PredictionService] Error deleting prediction:', error);
    throw error;
  }
};

/**
 * Cancel a prediction with automatic refund of all bets (admin only)
 * Cannot cancel predictions that have been validated (status = 'resulted')
 */
export const cancelPredictionWithRefund = async (
  predictionId: string
): Promise<{ refunded_users: number; refunded_amount: number }> => {
  try {
    // Check if prediction can be cancelled (not resulted)
    const prediction = await getPredictionById(predictionId);
    if (!prediction) {
      throw new Error('Prediction not found');
    }
    
    if (prediction.status === 'resulted') {
      throw new Error('Cannot cancel a validated prediction');
    }
    
    if (prediction.status === 'cancelled') {
      throw new Error('Prediction is already cancelled');
    }
    
    // Get all user predictions for this prediction
    const { data: userPredictions, error: fetchError } = await supabase
      .from('user_predictions')
      .select('*')
      .eq('prediction_id', predictionId);
    
    if (fetchError) {
      console.error('[PredictionService] Error fetching user predictions:', fetchError);
      throw fetchError;
    }
    
    if (!userPredictions || userPredictions.length === 0) {
      return {
        refunded_users: 0,
        refunded_amount: 0
      };
    }
    
    // Refund each bet individually using record_points_transaction
    let totalRefunded = 0;
    let usersRefunded = 0;
    
    for (const userPrediction of userPredictions) {
      try {
        // Use record_points_transaction to properly update user balance
        const { error: refundError } = await supabase.rpc('record_points_transaction', {
          p_user_id: userPrediction.user_id,
          p_amount: userPrediction.points_wagered, // Positive amount for refund
          p_source_type: 'prediction_refund',
          p_source_id: predictionId,
          p_metadata: {
            selected_option_id: userPrediction.selected_option_id,
            original_bet: userPrediction.points_wagered,
            reason: 'prediction_cancelled',
            prediction_teams: {
              home_team: prediction.home_team,
              away_team: prediction.away_team,
              competition: prediction.competition
            }
          }
        });
        
        if (refundError) {
          console.error('[PredictionService] Error refunding bet for user:', userPrediction.user_id, refundError);
          // Continue with other refunds even if one fails
        } else {
          totalRefunded += userPrediction.points_wagered;
          usersRefunded += 1;
        }
      } catch (error) {
        console.error('[PredictionService] Error processing refund for user:', userPrediction.user_id, error);
        // Continue with other refunds
      }
    }
    
    const refundResult = {
      users_refunded: usersRefunded,
      total_refunded: totalRefunded
    };
    
    // Update prediction status to cancelled instead of deleting
    const { error: updateError } = await supabase
      .from('predictions')
      .update({ status: 'cancelled' })
      .eq('id', predictionId);
    
    if (updateError) {
      console.error('[PredictionService] Error updating prediction status:', updateError);
      throw updateError;
    }
    
    console.log('[PredictionService] Successfully cancelled prediction with refund:', {
      predictionId,
      refundedUsers: refundResult.users_refunded,
      refundedAmount: refundResult.total_refunded
    });
    
    return {
      refunded_users: refundResult.users_refunded,
      refunded_amount: refundResult.total_refunded
    };
  } catch (error) {
    console.error('[PredictionService] Error cancelling prediction with refund:', error);
    throw error;
  }
};

/**
 * Delete a prediction with automatic refund of all bets (admin only)
 * Cannot delete predictions that have been validated (status = 'resulted')
 */
export const deletePredictionWithRefund = async (
  predictionId: string
): Promise<{ refunded_users: number; refunded_amount: number }> => {
  try {
    // Check if prediction can be deleted (not resulted)
    const prediction = await getPredictionById(predictionId);
    if (!prediction) {
      throw new Error('Prediction not found');
    }
    
    if (prediction.status === 'resulted') {
      throw new Error('Cannot delete a validated prediction');
    }
    
    // Get all user predictions for this prediction
    const { data: userPredictions, error: fetchError } = await supabase
      .from('user_predictions')
      .select('*')
      .eq('prediction_id', predictionId);
    
    if (fetchError) {
      console.error('[PredictionService] Error fetching user predictions:', fetchError);
      throw fetchError;
    }
    
    if (!userPredictions || userPredictions.length === 0) {
      // Delete prediction even if no bets
      await deletePrediction(predictionId);
      return {
        refunded_users: 0,
        refunded_amount: 0
      };
    }
    
    // Refund each bet individually using record_points_transaction
    let totalRefunded = 0;
    let usersRefunded = 0;
    
    for (const userPrediction of userPredictions) {
      try {
        // Use record_points_transaction to properly update user balance
        const { error: refundError } = await supabase.rpc('record_points_transaction', {
          p_user_id: userPrediction.user_id,
          p_amount: userPrediction.points_wagered, // Positive amount for refund
          p_source_type: 'prediction_refund',
          p_source_id: predictionId,
          p_metadata: {
            selected_option_id: userPrediction.selected_option_id,
            original_bet: userPrediction.points_wagered,
            reason: 'prediction_deleted',
            prediction_teams: {
              home_team: prediction.home_team,
              away_team: prediction.away_team,
              competition: prediction.competition
            }
          }
        });
        
        if (refundError) {
          console.error('[PredictionService] Error refunding bet for user:', userPrediction.user_id, refundError);
          // Continue with other refunds even if one fails
        } else {
          totalRefunded += userPrediction.points_wagered;
          usersRefunded += 1;
        }
      } catch (error) {
        console.error('[PredictionService] Error processing refund for user:', userPrediction.user_id, error);
        // Continue with other refunds
      }
    }
    
    const refundResult = {
      users_refunded: usersRefunded,
      total_refunded: totalRefunded
    };
    
    // Delete prediction
    await deletePrediction(predictionId);
    
    console.log('[PredictionService] Successfully deleted prediction with refund:', {
      predictionId,
      refundedUsers: refundResult.users_refunded,
      refundedAmount: refundResult.total_refunded
    });
    
    return {
      refunded_users: refundResult.users_refunded,
      refunded_amount: refundResult.total_refunded
    };
  } catch (error) {
    console.error('[PredictionService] Error deleting prediction with refund:', error);
    throw error;
  }
};

/**
 * Get all user predictions for a specific prediction (admin view)
 * @param predictionId - Prediction UUID
 */
export const getUserPredictionsForPrediction = async (
  predictionId: string
): Promise<UserPrediction[]> => {
  try {
    const { data, error } = await supabase
      .from('user_predictions')
      .select('*')
      .eq('prediction_id', predictionId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []) as UserPrediction[];
  } catch (error) {
    console.error('[PredictionService] Error fetching user predictions for prediction:', error);
    throw error;
  }
};

/**
 * Change prediction status manually (admin only)
 */
export const changePredictionStatus = async (
  predictionId: string,
  status: 'open' | 'closed' | 'cancelled'
): Promise<Prediction> => {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .update({ status })
      .eq('id', predictionId)
      .select()
      .single();

    if (error) throw error;

    return data as Prediction;
  } catch (error) {
    console.error('[PredictionService] Error changing prediction status:', error);
    throw error;
  }
};

