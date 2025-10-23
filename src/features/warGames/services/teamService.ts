import { supabase } from 'lib/supabase/client';
import { teamsAPI } from 'api/teams';
import type { SavedTeam, CreateTeamData, UpdateTeamData, SavedTeamSlot } from '../types';

/**
 * Service for managing saved War Game teams
 */
export class TeamService {
  /**
   * Get all teams for the current user
   */
  static async getUserTeams(userId: string): Promise<SavedTeam[]> {
    try {
      const response = await teamsAPI.getSaved();
      
      // Check if response is successful and has data
      if (!response.success || !response.data) {
        throw new Error('Invalid teams response');
      }
      
      // Transform API response to SavedTeam format
      return response.data.teams.map((team: any) => ({
        id: team.id,
        userId: team.userId,
        teamName: team.teamName,
        formation: team.formation,
        slots: team.slots,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt
      })) as SavedTeam[];
    } catch (error) {
      console.error('Error fetching user teams:', error);
      throw new Error('Failed to fetch teams');
    }
  }

  /**
   * Get a specific team by ID
   */
  static async getTeam(teamId: string): Promise<SavedTeam | null> {
    try {
      const response = await teamsAPI.getById(teamId);
      
      // Check if response is successful and has data
      if (!response.success || !response.data) {
        return null;
      }
      
      // Transform API response to SavedTeam format
      return {
        id: response.data.team.id,
        userId: response.data.team.userId,
        teamName: response.data.team.teamName,
        formation: response.data.team.formation,
        slots: response.data.team.slots,
        createdAt: response.data.team.createdAt,
        updatedAt: response.data.team.updatedAt
      } as SavedTeam;
    } catch (error) {
      console.error('Error fetching team:', error);
      return null;
    }
  }

  /**
   * Create a new team
   */
  static async createTeam(teamData: CreateTeamData, userId: string): Promise<SavedTeam> {
    console.log('Creating team via API');
    console.log('Team data:', teamData);

    try {
      const response = await teamsAPI.create(
        teamData.teamName,
        teamData.formation,
        teamData.slots
      );

      // Check if response is successful and has data
      if (!response.success || !response.data) {
        throw new Error('Invalid create team response');
      }

      return {
        id: response.data.team.id,
        userId: response.data.team.userId,
        teamName: response.data.team.teamName,
        formation: response.data.team.formation,
        slots: response.data.team.slots,
        createdAt: response.data.team.createdAt,
        updatedAt: response.data.team.updatedAt
      } as SavedTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  /**
   * Update an existing team
   */
  static async updateTeam(teamId: string, teamData: UpdateTeamData, userId: string): Promise<SavedTeam> {
    try {
      const response = await teamsAPI.update(teamId, {
        teamName: teamData.teamName,
        formation: teamData.formation,
        slots: teamData.slots
      });

      // Check if response is successful and has data
      if (!response.success || !response.data) {
        throw new Error('Invalid update team response');
      }

      return {
        id: response.data.team.id,
        userId: response.data.team.userId,
        teamName: response.data.team.teamName,
        formation: response.data.team.formation,
        slots: response.data.team.slots,
        createdAt: response.data.team.createdAt,
        updatedAt: response.data.team.updatedAt
      } as SavedTeam;
    } catch (error) {
      console.error('Error updating team:', error);
      throw new Error('Failed to update team');
    }
  }

  /**
   * Delete a team
   */
  static async deleteTeam(teamId: string, userId: string): Promise<void> {
    try {
      await teamsAPI.delete(teamId);
    } catch (error) {
      console.error('Error deleting team:', error);
      throw new Error('Failed to delete team');
    }
  }

  /**
   * Convert team slots to saved team slots
   */
  static convertSlotsToSavedSlots(slots: any[]): SavedTeamSlot[] {
    return slots
      .filter(slot => slot.nft !== null)
      .map(slot => ({
        slotId: slot.position.id,
        nftIdentifier: slot.nft.identifier,
        position: slot.position.position
      }));
  }

  /**
   * Load team slots from saved team
   */
  static loadSlotsFromSavedTeam(savedTeam: SavedTeam, nfts: any[]): any[] {
    // This would need to be implemented based on your team structure
    // For now, return empty array
    return [];
  }

  /**
   * Find NFT by identifier in the NFTs array
   */
  static findNFTByIdentifier(nfts: any[], identifier: string): any | null {
    return nfts.find(nft => nft.identifier === identifier) || null;
  }

  /**
   * Load team into slots
   */
  static loadTeamIntoSlots(savedTeam: SavedTeam, nfts: any[], slots: any[]): any[] {
    const updatedSlots = [...slots];
    
    savedTeam.slots.forEach(savedSlot => {
      const nft = this.findNFTByIdentifier(nfts, savedSlot.nftIdentifier);
      if (nft) {
        const slotIndex = updatedSlots.findIndex(slot => slot.position.id === savedSlot.slotId);
        if (slotIndex !== -1) {
          updatedSlots[slotIndex] = {
            ...updatedSlots[slotIndex],
            nft: nft
          };
        }
      }
    });
    
    return updatedSlots;
  }

  /**
   * Get team details for war game history display
   */
  static async getTeamDetails(teamId: string): Promise<{
    teamName: string;
    formation: string;
    playerCount: number;
    players: Array<{
      position: string;
      nftIdentifier: string;
      playerName?: string;
    }>;
  } | null> {
    const team = await this.getTeam(teamId);
    if (!team) return null;

    const players = team.slots
      .filter(slot => slot.nftIdentifier)
      .map(slot => ({
        position: slot.position,
        nftIdentifier: slot.nftIdentifier,
        playerName: slot.nftIdentifier.split('-').pop() || 'Unknown'
      }));

    return {
      teamName: team.teamName,
      formation: team.formation,
      playerCount: players.length,
      players
    };
  }
}
