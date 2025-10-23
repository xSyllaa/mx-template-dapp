/**
 * Streaks API
 * Handles weekly streak management and claiming
 */

import { apiClient } from './client';

type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

interface WeekStreak {
  id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  daysCompleted: DayOfWeek[];
  consecutiveDays: number;
  totalPointsEarned: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GetCurrentStreakResponse {
  success: boolean;
  data: {
    canClaim: boolean;
    consecutiveDays: number;
    currentDay: string;
    nextReward: number;
    weekStreak: {
      id: string;
      user_id: string;
      week_start: string;
      week_end?: string;
      claims: {
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
        sunday: boolean;
      };
      total_points: string;
      bonus_tokens: string;
      completed: boolean;
      created_at: string;
      updated_at: string;
    };
  };
  message?: string;
}

interface ClaimStreakResponse {
  success: boolean;
  data: {
    pointsEarned: number;
    newStreak: number;
    nextReward: number;
    totalPoints: number;
  };
  message: string;
}

interface GetStreakHistoryResponse {
  success: boolean;
  data: {
    streaks: WeekStreak[];
    totalWeeks: number;
  };
  message?: string;
}

export const streaksAPI = {
  /**
   * Get current week's streak status
   */
  async getCurrent(): Promise<GetCurrentStreakResponse> {
    return apiClient<GetCurrentStreakResponse>('/streaks/current');
  },

  /**
   * Claim daily streak reward
   * @param dayOfWeek - Day of the week to claim
   */
  async claim(dayOfWeek: DayOfWeek): Promise<ClaimStreakResponse> {
    return apiClient<ClaimStreakResponse>('/streaks/claim', {
      method: 'POST',
      body: JSON.stringify({ dayOfWeek }),
    });
  },

  /**
   * Get streak history
   * @param weeks - Number of weeks of history to fetch
   */
  async getHistory(weeks = 4): Promise<GetStreakHistoryResponse> {
    return apiClient<GetStreakHistoryResponse>(
      `/streaks/history?weeks=${weeks}`
    );
  },
};

