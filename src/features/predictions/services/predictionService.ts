import { supabase } from 'lib/supabase/client';
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
 * Get all active predictions (status = 'open')
 */
export const getActivePredictions = async (): Promise<Prediction[]> => {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('status', 'open')
      .order('start_date', { ascending: true });

    if (error) throw error;

    return (data || []) as Prediction[];
  } catch (error) {
    console.error('[PredictionService] Error fetching active predictions:', error);
    throw error;
  }
};

/**
 * Get recent prediction history (resulted/closed in last 24 hours)
 * @param limit - Number of predictions to fetch (default: 10)
 * @param offset - Pagination offset (default: 0)
 */
export const getRecentHistory = async (
  limit = 10,
  offset = 0
): Promise<Prediction[]> => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .in('status', ['resulted', 'closed', 'cancelled'])
      .gte('updated_at', twentyFourHoursAgo.toISOString())
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (data || []) as Prediction[];
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
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('id', predictionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw error;
    }

    return data as Prediction;
  } catch (error) {
    console.error('[PredictionService] Error fetching prediction:', error);
    throw error;
  }
};

/**
 * Submit a user's prediction
 * @param userId - User's UUID
 * @param predictionId - Prediction UUID
 * @param selectedOptionId - Selected option ID
 */
export const submitPrediction = async (
  userId: string,
  predictionId: string,
  selectedOptionId: string
): Promise<UserPrediction> => {
  try {
    const { data, error } = await supabase
      .from('user_predictions')
      .insert({
        user_id: userId,
        prediction_id: predictionId,
        selected_option_id: selectedOptionId,
        points_earned: 0,
        is_correct: null
      })
      .select()
      .single();

    if (error) throw error;

    return data as UserPrediction;
  } catch (error) {
    console.error('[PredictionService] Error submitting prediction:', error);
    throw error;
  }
};

/**
 * Get user's prediction for a specific match
 * @param userId - User's UUID
 * @param predictionId - Prediction UUID
 */
export const getUserPrediction = async (
  userId: string,
  predictionId: string
): Promise<UserPrediction | null> => {
  try {
    const { data, error } = await supabase
      .from('user_predictions')
      .select('*')
      .eq('user_id', userId)
      .eq('prediction_id', predictionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found - user hasn't participated
        return null;
      }
      throw error;
    }

    return data as UserPrediction;
  } catch (error) {
    console.error('[PredictionService] Error fetching user prediction:', error);
    throw error;
  }
};

/**
 * Get all user predictions for multiple predictions at once
 * @param userId - User's UUID
 * @param predictionIds - Array of prediction UUIDs
 */
export const getUserPredictions = async (
  userId: string,
  predictionIds: string[]
): Promise<UserPrediction[]> => {
  try {
    if (predictionIds.length === 0) return [];

    const { data, error } = await supabase
      .from('user_predictions')
      .select('*')
      .eq('user_id', userId)
      .in('prediction_id', predictionIds);

    if (error) throw error;

    return (data || []) as UserPrediction[];
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
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;

    return (data || []) as Prediction[];
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
    const { data: newPrediction, error } = await supabase
      .from('predictions')
      .insert({
        ...data,
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
 * Sets the winning option and updates all user predictions
 * @param predictionId - Prediction UUID
 * @param winningOptionId - ID of the winning option
 */
export const validateResult = async (
  predictionId: string,
  winningOptionId: string
): Promise<ValidateResultResponse> => {
  try {
    // Get the prediction to check points_reward
    const prediction = await getPredictionById(predictionId);
    if (!prediction) {
      throw new Error('Prediction not found');
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

    // Update user predictions: mark correct predictions and award points
    const { error: userPredictionsError } = await supabase
      .from('user_predictions')
      .update({
        is_correct: true,
        points_earned: prediction.points_reward
      })
      .eq('prediction_id', predictionId)
      .eq('selected_option_id', winningOptionId);

    if (userPredictionsError) throw userPredictionsError;

    // Mark incorrect predictions
    const { error: incorrectError } = await supabase
      .from('user_predictions')
      .update({
        is_correct: false,
        points_earned: 0
      })
      .eq('prediction_id', predictionId)
      .neq('selected_option_id', winningOptionId);

    if (incorrectError) throw incorrectError;

    // Get count of users who predicted correctly
    const { count } = await supabase
      .from('user_predictions')
      .select('*', { count: 'exact', head: true })
      .eq('prediction_id', predictionId)
      .eq('selected_option_id', winningOptionId);

    // Update user total points for winners using RPC function
    const { data: winners } = await supabase
      .from('user_predictions')
      .select('user_id')
      .eq('prediction_id', predictionId)
      .eq('selected_option_id', winningOptionId);

    if (winners && winners.length > 0) {
      // Update each winner's total points
      for (const winner of winners) {
        await supabase.rpc('update_user_total_points', {
          p_user_id: winner.user_id,
          p_points_to_add: prediction.points_reward
        });
      }
    }

    return {
      success: true,
      prediction: updatedPrediction as Prediction,
      affected_users: count || 0
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

