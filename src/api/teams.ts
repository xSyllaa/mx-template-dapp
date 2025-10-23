/**
 * Teams API
 * Handles saved team management for war games
 */

import { apiClient } from './client';

interface TeamSlot {
  position: string;
  nftIdentifier: string;
  playerName?: string;
  playerStats?: any;
}

interface SavedTeam {
  id: string;
  userId: string;
  teamName: string;
  formation: string;
  slots: TeamSlot[];
  totalScore?: number;
  createdAt: string;
  updatedAt: string;
}

interface GetSavedTeamsResponse {
  success: boolean;
  data: {
    teams: SavedTeam[];
    total: number;
    hasMore: boolean;
  };
  message?: string;
}

interface GetTeamResponse {
  success: boolean;
  data: {
    team: SavedTeam;
  };
  message?: string;
}

interface CreateTeamResponse {
  success: boolean;
  data: {
    team: SavedTeam;
  };
  message: string;
}

interface UpdateTeamResponse {
  success: boolean;
  data: {
    team: SavedTeam;
  };
  message: string;
}

interface DeleteTeamResponse {
  success: boolean;
  message: string;
}

export const teamsAPI = {
  /**
   * Get all saved teams for current user
   */
  async getSaved(): Promise<GetSavedTeamsResponse> {
    return apiClient<GetSavedTeamsResponse>('/teams/saved');
  },

  /**
   * Get a specific saved team by ID
   * @param id - Team UUID
   */
  async getById(id: string): Promise<GetTeamResponse> {
    return apiClient<GetTeamResponse>(`/teams/saved/${id}`);
  },

  /**
   * Create a new saved team
   * @param teamName - Name for the team
   * @param formation - Formation string (e.g., "4-3-3")
   * @param slots - Array of team slots with NFT identifiers
   */
  async create(
    teamName: string,
    formation: string,
    slots: TeamSlot[]
  ): Promise<CreateTeamResponse> {
    return apiClient<CreateTeamResponse>('/teams/saved', {
      method: 'POST',
      body: JSON.stringify({ teamName, formation, slots }),
    });
  },

  /**
   * Update an existing saved team
   * @param teamId - Team UUID
   * @param data - Partial team data to update
   */
  async update(
    teamId: string,
    data: Partial<{
      teamName: string;
      formation: string;
      slots: TeamSlot[];
    }>
  ): Promise<UpdateTeamResponse> {
    return apiClient<UpdateTeamResponse>(`/teams/saved/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a saved team
   * @param teamId - Team UUID
   */
  async delete(teamId: string): Promise<DeleteTeamResponse> {
    return apiClient<DeleteTeamResponse>(`/teams/saved/${teamId}`, {
      method: 'DELETE',
    });
  },
};

