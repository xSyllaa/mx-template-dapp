import { supabase } from 'lib/supabase/client';
import type { SavedTeam, CreateTeamData, UpdateTeamData, SavedTeamSlot } from '../types';

/**
 * Service for managing saved War Game teams
 */
export class TeamService {
  /**
   * Get all teams for the current user
   */
  static async getUserTeams(userId: string): Promise<SavedTeam[]> {
    if (!userId) {
      throw new Error('User ID is required to fetch teams.');
    }

    const { data, error } = await supabase
      .from('war_game_teams')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user teams:', error);
      throw new Error('Failed to fetch teams');
    }

    const rows = (data || []) as any[];
    // Map snake_case from DB to camelCase expected by UI types
    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      teamName: row.team_name,
      formation: row.formation,
      slots: row.slots,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })) as SavedTeam[];
  }

  /**
   * Get a specific team by ID
   */
  static async getTeam(teamId: string): Promise<SavedTeam | null> {
    const { data, error } = await supabase
      .from('war_game_teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (error) {
      console.error('Error fetching team:', error);
      throw new Error('Failed to fetch team');
    }

    return data;
  }

  /**
   * Create a new team
   */
  static async createTeam(teamData: CreateTeamData, userId: string): Promise<SavedTeam> {
    if (!userId) {
      throw new Error('User ID is required to create a team.');
    }

    console.log('Creating team for user:', userId);
    console.log('Team data:', teamData);

    const { data, error } = await supabase
      .from('war_game_teams')
      .insert({
        user_id: userId,
        team_name: teamData.teamName,
        formation: teamData.formation,
        slots: teamData.slots
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating team:', error);
      
      // Check if it's a table not found error
      if (error.code === '42501' || error.message.includes('war_game_teams')) {
        throw new Error('Database table not found. Please run the migration script in Supabase dashboard.');
      }
      
      // Check if it's an authentication error
      if (error.code === 'PGRST301' || error.message.includes('JWT')) {
        throw new Error('Authentication error. Please refresh the page and try again.');
      }
      
      throw new Error(`Failed to create team: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an existing team
   */
  static async updateTeam(teamId: string, teamData: UpdateTeamData, userId: string): Promise<SavedTeam> {
    if (!userId) {
      throw new Error('User ID is required to update team.');
    }

    const updateData: any = {};
    
    if (teamData.teamName) updateData.team_name = teamData.teamName;
    if (teamData.formation) updateData.formation = teamData.formation;
    if (teamData.slots) updateData.slots = teamData.slots;

    const { data, error } = await supabase
      .from('war_game_teams')
      .update(updateData)
      .eq('id', teamId)
      .eq('user_id', userId) // Ensure user can only update their own teams
      .select()
      .single();

    if (error) {
      console.error('Error updating team:', error);
      throw new Error('Failed to update team');
    }

    return data;
  }

  /**
   * Delete a team
   */
  static async deleteTeam(teamId: string, userId: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required to delete team.');
    }

    const { error } = await supabase
      .from('war_game_teams')
      .delete()
      .eq('id', teamId)
      .eq('user_id', userId); // Ensure user can only delete their own teams

    if (error) {
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
