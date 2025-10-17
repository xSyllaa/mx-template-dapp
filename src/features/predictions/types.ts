// Prediction Types for GalacticX dApp

/**
 * Prediction option for users to choose from
 */
export interface PredictionOption {
  id: string;
  label: string;
  odds: string;
}

/**
 * Prediction lifecycle status
 * - open: Users can submit predictions
 * - closed: No more submissions (match started)
 * - resulted: Admin validated result
 * - cancelled: Event cancelled
 */
export type PredictionStatus = 'open' | 'closed' | 'resulted' | 'cancelled';

/**
 * Type of bet/prediction
 */
export type BetType = 'result' | 'over_under' | 'scorer' | 'both_teams_score';

/**
 * Calculation method for winnings
 * - fixed_odds: Uses predefined odds, winnings = bet * odds
 * - pool_ratio: Twitch-style, winnings = bet * (total_pool / winning_option_total)
 */
export type BetCalculationType = 'fixed_odds' | 'pool_ratio';

/**
 * Main prediction entity (matches)
 */
export interface Prediction {
  id: string;
  competition: string;
  home_team: string;
  away_team: string;
  bet_type: BetType;
  bet_calculation_type: BetCalculationType;
  options: PredictionOption[];
  status: PredictionStatus;
  start_date: string;
  close_date: string;
  winning_option_id: string | null;
  points_reward: number;
  min_bet_points: number;
  max_bet_points: number;
  created_at: string;
  updated_at?: string;
  created_by: string | null;
}

/**
 * User's submission for a prediction
 */
export interface UserPrediction {
  id: string;
  user_id: string;
  prediction_id: string;
  selected_option_id: string;
  points_wagered: number;
  points_earned: number;
  is_correct: boolean | null;
  created_at: string;
}

/**
 * Form data for creating a new prediction (admin)
 */
export interface CreatePredictionData {
  competition: string;
  home_team: string;
  away_team: string;
  bet_type: BetType;
  bet_calculation_type: BetCalculationType;
  options: PredictionOption[];
  start_date: string;
  close_date: string;
  points_reward: number;
  min_bet_points?: number;
  max_bet_points?: number;
}

/**
 * Form data for updating an existing prediction
 */
export interface UpdatePredictionData {
  competition?: string;
  home_team?: string;
  away_team?: string;
  bet_type?: BetType;
  bet_calculation_type?: BetCalculationType;
  options?: PredictionOption[];
  status?: PredictionStatus;
  start_date?: string;
  close_date?: string;
  winning_option_id?: string | null;
  points_reward?: number;
  min_bet_points?: number;
  max_bet_points?: number;
}

/**
 * Response when validating a prediction result
 */
export interface ValidateResultResponse {
  success: boolean;
  prediction: Prediction;
  affected_users: number;
}

/**
 * Prediction with user participation info
 */
export interface PredictionWithParticipation extends Prediction {
  user_prediction?: UserPrediction | null;
  has_participated: boolean;
}

/**
 * Statistics for a single prediction option
 */
export interface PredictionOptionStats {
  option_id: string;
  total_wagered: number;
  participant_count: number;
  percentage: number;
  ratio: number; // (total_pool / option_total)
  biggest_bet: number;
  top_bettor: string | null;
}

/**
 * Aggregated statistics for a prediction
 */
export interface PredictionStats {
  total_pool: number;
  total_participants: number;
  options: PredictionOptionStats[];
}

