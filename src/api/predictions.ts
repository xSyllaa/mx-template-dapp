/**
 * Predictions API
 * Handles betting predictions and user predictions
 */

import { apiClient } from './client';

type PredictionStatus = 'open' | 'closed' | 'resulted';
type UserPredictionStatus = 'active' | 'completed';

interface Prediction {
  id: string;
  competition: string;
  home_team: string;
  away_team: string;
  bet_type: string;
  options: any[];
  start_date: string;
  close_date: string;
  status: PredictionStatus;
  points_reward: number;
  min_bet_points: number;
  max_bet_points: number;
  winning_option_id?: string;
  created_at: string;
  updated_at: string;
}

interface UserPrediction {
  id: string;
  user_id: string;
  prediction_id: string;
  selected_option_id: string;
  points_wagered: number;
  points_earned: number;
  is_correct: boolean | null;
  created_at: string;
}

interface GetAllResponse {
  success: boolean;
  data: {
    predictions: Prediction[];
    total: number;
    hasMore: boolean;
  };
  message?: string;
}

interface GetByIdResponse {
  success: boolean;
  data: {
    prediction: Prediction;
  };
  message?: string;
}

interface PlaceBetResponse {
  success: boolean;
  data: {
    betId: string;
    pointsWagered: number;
    selectedOption: string;
    potentialWinnings: number;
    remainingPoints: number;
  };
  message: string;
}

interface GetUserPredictionsResponse {
  success: boolean;
  data: {
    predictions: any[];
    total: number;
    hasMore: boolean;
  };
  message?: string;
}

interface PredictionStatsResponse {
  success: boolean;
  data: {
    active: number;
    historical: number;
    total: number;
  };
  message?: string;
}

export const predictionsAPI = {
  /**
   * Get all predictions with optional status filter
   * @param status - Filter by status (open, closed, resulted)
   */
  async getAll(status?: PredictionStatus): Promise<GetAllResponse> {
    const query = status ? `?status=${status}` : '';
    const endpoint = `/predictions${query}`;
    
    // 🔍 DEBUG: Log API call
    console.log('🔍 [PredictionsAPI] Calling endpoint:', endpoint);
    
    const response = await apiClient<GetAllResponse>(endpoint);
    
    // 🔍 DEBUG: Log raw response
    console.log('🔍 [PredictionsAPI] Raw response from server:', response);
    
    return response;
  },

  /**
   * Get a specific prediction by ID
   * @param id - Prediction UUID
   */
  async getById(id: string): Promise<GetByIdResponse> {
    return apiClient<GetByIdResponse>(`/predictions/${id}`);
  },

  /**
   * Place a bet on a prediction
   * @param predictionId - Prediction UUID
   * @param selectedOptionId - Selected option ID
   * @param pointsWagered - Amount of points to wager
   */
  async placeBet(
    predictionId: string,
    selectedOptionId: string,
    pointsWagered: number
  ): Promise<PlaceBetResponse> {
    return apiClient<PlaceBetResponse>(`/predictions/${predictionId}/bet`, {
      method: 'POST',
      body: JSON.stringify({ selectedOptionId, pointsWagered }),
    });
  },

  /**
   * Get user's predictions with optional status filter
   * @param status - Filter by status (active, completed)
   * @param limit - Number of results to return
   * @param offset - Pagination offset
   */
  async getUserPredictions(
    status?: UserPredictionStatus,
    limit = 50,
    offset = 0
  ): Promise<GetUserPredictionsResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    return apiClient<GetUserPredictionsResponse>(
      `/predictions/user/predictions?${params}`
    );
  },

  /**
   * Get predictions history with pagination
   * @param status - Filter by status (open, closed, resulted)
   * @param limit - Number of results to return
   * @param offset - Pagination offset
   */
  async getHistory(
    status?: PredictionStatus,
    limit = 10,
    offset = 0
  ): Promise<GetAllResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    return apiClient<GetAllResponse>(`/predictions/history?${params}`);
  },

  /**
   * Get predictions statistics
   * Returns counts of active and historical predictions
   */
  async getStats(): Promise<PredictionStatsResponse> {
    return apiClient<PredictionStatsResponse>('/predictions/stats');
  },
};

