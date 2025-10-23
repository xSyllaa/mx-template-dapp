/**
 * War Games API
 * Handles war game creation, joining, and management
 */

import { apiClient } from './client';

type WarGameStatus = 'open' | 'in_progress' | 'completed';

interface WarGame {
  id: string;
  creatorId: string;
  creatorTeamId: string;
  opponentId?: string;
  opponentTeamId?: string;
  winnerId?: string;
  pointsStake: number;
  status: WarGameStatus;
  entryDeadline: string;
  createdAt: string;
  updatedAt: string;
}

interface GetAllWarGamesResponse {
  success: boolean;
  data: {
    warGames: WarGame[];
    total: number;
    hasMore: boolean;
  };
  message?: string;
}

interface GetWarGameResponse {
  success: boolean;
  data: {
    warGame: WarGame;
  };
  message?: string;
}

interface CreateWarGameResponse {
  success: boolean;
  data: {
    warGame: WarGame;
  };
  message: string;
}

interface JoinWarGameResponse {
  success: boolean;
  data: {
    warGame: WarGame;
  };
  message: string;
}

interface CancelWarGameResponse {
  success: boolean;
  data: {
    warGame: WarGame;
  };
  message: string;
}

interface WarGameStatsResponse {
  success: boolean;
  data: {
    active: number;
    historical: number;
    total: number;
  };
  message?: string;
}

export const warGamesAPI = {
  /**
   * Get all war games with optional filters
   * @param status - Filter by status (open, in_progress, completed)
   * @param limit - Number of results to return
   * @param offset - Pagination offset
   */
  async getAll(
    status?: WarGameStatus,
    limit = 50,
    offset = 0
  ): Promise<GetAllWarGamesResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    return apiClient<GetAllWarGamesResponse>(`/wargames?${params}`);
  },

  /**
   * Get a specific war game by ID
   * @param id - War game UUID
   */
  async getById(id: string): Promise<GetWarGameResponse> {
    return apiClient<GetWarGameResponse>(`/wargames/${id}`);
  },

  /**
   * Create a new war game
   * @param teamId - Team UUID to use for this war game
   * @param pointsStake - Amount of points to stake
   * @param entryDeadline - ISO date string for entry deadline
   */
  async create(
    teamId: string,
    pointsStake: number,
    entryDeadline: string
  ): Promise<CreateWarGameResponse> {
    return apiClient<CreateWarGameResponse>('/wargames', {
      method: 'POST',
      body: JSON.stringify({ teamId, pointsStake, entryDeadline }),
    });
  },

  /**
   * Join an existing war game
   * @param warGameId - War game UUID
   * @param teamId - Team UUID to use for joining
   */
  async join(warGameId: string, teamId: string): Promise<JoinWarGameResponse> {
    return apiClient<JoinWarGameResponse>(`/wargames/${warGameId}/join`, {
      method: 'POST',
      body: JSON.stringify({ teamId }),
    });
  },

  /**
   * Cancel a war game (creator only)
   * @param warGameId - War game UUID
   */
  async cancel(warGameId: string): Promise<CancelWarGameResponse> {
    return apiClient<CancelWarGameResponse>(`/wargames/${warGameId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get war games statistics
   * Returns counts of active and historical war games
   */
  async getStats(): Promise<WarGameStatsResponse> {
    return apiClient<WarGameStatsResponse>('/wargames/stats');
  },

  /**
   * Get war games history with pagination
   * @param status - Filter by status (open, in_progress, completed)
   * @param userId - Filter by user ID
   * @param limit - Number of results to return
   * @param offset - Pagination offset
   */
  async getHistory(
    status?: WarGameStatus,
    userId?: string,
    limit = 10,
    offset = 0
  ): Promise<GetAllWarGamesResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (userId) params.append('userId', userId);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    return apiClient<GetAllWarGamesResponse>(`/wargames/history?${params}`);
  },
};

