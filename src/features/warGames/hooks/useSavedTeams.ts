import { useState, useEffect, useCallback } from 'react';
import { TeamService } from '../services/teamService';
import type { SavedTeam, CreateTeamData, UpdateTeamData } from '../types';

/**
 * Hook for managing saved teams
 */
export const useSavedTeams = (userId: string | null) => {
  const [teams, setTeams] = useState<SavedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch all user teams
   */
  const fetchTeams = useCallback(async () => {
    if (!userId) {
      setTeams([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userTeams = await TeamService.getUserTeams(userId);
      setTeams(userTeams);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch teams'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Create a new team
   */
  const createTeam = useCallback(async (teamData: CreateTeamData): Promise<SavedTeam> => {
    if (!userId) {
      throw new Error('User ID is required to create a team.');
    }

    try {
      const newTeam = await TeamService.createTeam(teamData, userId);
      setTeams(prev => [newTeam, ...prev]);
      return newTeam;
    } catch (err) {
      console.error('Failed to create team:', err);
      setError(err instanceof Error ? err : new Error('Failed to create team'));
      throw err;
    }
  }, [userId]);

  /**
   * Update an existing team
   */
  const updateTeam = useCallback(async (teamId: string, teamData: UpdateTeamData): Promise<SavedTeam> => {
    if (!userId) {
      throw new Error('User ID is required to update team.');
    }

    try {
      const updatedTeam = await TeamService.updateTeam(teamId, teamData, userId);
      setTeams(prev => prev.map(team => team.id === teamId ? updatedTeam : team));
      return updatedTeam;
    } catch (err) {
      console.error('Failed to update team:', err);
      setError(err instanceof Error ? err : new Error('Failed to update team'));
      throw err;
    }
  }, [userId]);

  /**
   * Delete a team
   */
  const deleteTeam = useCallback(async (teamId: string): Promise<void> => {
    if (!userId) {
      throw new Error('User ID is required to delete team.');
    }

    try {
      await TeamService.deleteTeam(teamId, userId);
      setTeams(prev => prev.filter(team => team.id !== teamId));
    } catch (err) {
      console.error('Failed to delete team:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete team'));
      throw err;
    }
  }, [userId]);

  /**
   * Load initial teams
   */
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    loading,
    error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam
  };
};
