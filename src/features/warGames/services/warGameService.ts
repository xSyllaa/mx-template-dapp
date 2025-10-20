import { supabase } from 'lib/supabase/client';
import type { 
  WarGame, 
  WarGameWithDetails, 
  CreateWarGameData, 
  JoinWarGameData,
  WarGameStatus 
} from '../types';

/**
 * Service for managing War Games (1v1 NFT team battles)
 */
export class WarGameService {
  /**
   * Get all open war games (available to join)
   */
  static async getOpenWarGames(): Promise<WarGameWithDetails[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_open_war_games');

      if (error) {
        console.error('Error fetching open war games:', error);
        throw new Error('Failed to fetch open war games');
      }

      // Transform to WarGameWithDetails format
      return (data || []).map((game: any) => ({
        id: game.id,
        creatorId: game.creator_id,
        creatorUsername: game.creator_username,
        creatorTeamId: '', // Not needed for list view
        opponentId: null,
        opponentTeamId: null,
        pointsStake: game.points_stake,
        entryDeadline: game.entry_deadline,
        status: 'open' as WarGameStatus,
        winnerId: null,
        creatorScore: null,
        opponentScore: null,
        createdAt: game.created_at,
        startedAt: null,
        completedAt: null,
        updatedAt: game.created_at
      }));
    } catch (error) {
      console.error('Error in getOpenWarGames:', error);
      throw error;
    }
  }

  /**
   * Get all war games for a specific user
   */
  static async getUserWarGames(userId: string): Promise<WarGameWithDetails[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('war_games')
        .select(`
          *,
          creator:creator_id(username, avatar_url),
          opponent:opponent_id(username, avatar_url)
        `)
        .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user war games:', error);
        throw new Error('Failed to fetch user war games');
      }

      return (data || []).map(this.transformWarGame);
    } catch (error) {
      console.error('Error in getUserWarGames:', error);
      throw error;
    }
  }

  /**
   * Get a specific war game by ID
   */
  static async getWarGame(warGameId: string): Promise<WarGameWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('war_games')
        .select(`
          *,
          creator:creator_id(username, avatar_url),
          opponent:opponent_id(username, avatar_url)
        `)
        .eq('id', warGameId)
        .single();

      if (error) {
        console.error('Error fetching war game:', error);
        throw new Error('Failed to fetch war game');
      }

      if (!data) {
        return null;
      }

      return this.transformWarGame(data);
    } catch (error) {
      console.error('Error in getWarGame:', error);
      throw error;
    }
  }

  /**
   * Create a new war game
   */
  static async createWarGame(
    warGameData: CreateWarGameData,
    userId: string
  ): Promise<WarGame> {
    if (!userId) {
      throw new Error('User ID is required to create a war game');
    }

    console.log('Creating war game for user:', userId);
    console.log('War game data:', warGameData);

    try {
      const { data, error } = await supabase
        .from('war_games')
        .insert({
          creator_id: userId,
          creator_team_id: warGameData.teamId,
          points_stake: warGameData.pointsStake,
          entry_deadline: warGameData.entryDeadline,
          status: 'open'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating war game:', error);
        
        if (error.code === '42501' || error.message.includes('war_games')) {
          throw new Error('Database table not found. Please run the migration script.');
        }
        
        if (error.code === 'PGRST301' || error.message.includes('JWT')) {
          throw new Error('Authentication error. Please refresh and try again.');
        }
        
        throw new Error(`Failed to create war game: ${error.message}`);
      }

      return this.transformWarGame(data);
    } catch (error) {
      console.error('Error in createWarGame:', error);
      throw error;
    }
  }

  /**
   * Join an existing war game as opponent
   */
  static async joinWarGame(
    joinData: JoinWarGameData,
    userId: string
  ): Promise<WarGame> {
    if (!userId) {
      throw new Error('User ID is required to join a war game');
    }

    console.log('Joining war game:', joinData.warGameId);
    console.log('User:', userId, 'Team:', joinData.teamId);

    try {
      const { data, error } = await supabase
        .from('war_games')
        .update({
          opponent_id: userId,
          opponent_team_id: joinData.teamId,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', joinData.warGameId)
        .eq('status', 'open')
        .is('opponent_id', null)
        .select()
        .single();

      if (error) {
        console.error('Error joining war game:', error);
        
        if (error.code === 'PGRST116') {
          throw new Error('War game not found or already has an opponent');
        }
        
        throw new Error(`Failed to join war game: ${error.message}`);
      }

      if (!data) {
        throw new Error('War game not found or already has an opponent');
      }

      return this.transformWarGame(data);
    } catch (error) {
      console.error('Error in joinWarGame:', error);
      throw error;
    }
  }

  /**
   * Cancel a war game (only if creator and no opponent)
   */
  static async cancelWarGame(warGameId: string, userId: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const { error } = await supabase
        .from('war_games')
        .update({ status: 'cancelled' })
        .eq('id', warGameId)
        .eq('creator_id', userId)
        .eq('status', 'open')
        .is('opponent_id', null);

      if (error) {
        console.error('Error cancelling war game:', error);
        throw new Error('Failed to cancel war game');
      }
    } catch (error) {
      console.error('Error in cancelWarGame:', error);
      throw error;
    }
  }

  /**
   * Transform database row to WarGame interface
   * Handles snake_case to camelCase conversion
   */
  private static transformWarGame(data: any): WarGameWithDetails {
    return {
      id: data.id,
      creatorId: data.creator_id,
      creatorTeamId: data.creator_team_id,
      opponentId: data.opponent_id,
      opponentTeamId: data.opponent_team_id,
      pointsStake: data.points_stake,
      entryDeadline: data.entry_deadline,
      status: data.status,
      winnerId: data.winner_id,
      creatorScore: data.creator_score,
      opponentScore: data.opponent_score,
      createdAt: data.created_at,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      updatedAt: data.updated_at,
      // User details if available
      creatorUsername: data.creator?.username,
      creatorAvatarUrl: data.creator?.avatar_url,
      opponentUsername: data.opponent?.username,
      opponentAvatarUrl: data.opponent?.avatar_url
    };
  }

  /**
   * Check if a war game is expired (past entry deadline)
   */
  static isExpired(warGame: WarGame): boolean {
    return new Date(warGame.entryDeadline) < new Date();
  }

  /**
   * Check if a user can join a war game
   */
  static canJoin(warGame: WarGame, userId: string): boolean {
    return (
      warGame.status === 'open' &&
      warGame.opponentId === null &&
      warGame.creatorId !== userId &&
      !this.isExpired(warGame)
    );
  }

  /**
   * Check if a user can cancel a war game
   */
  static canCancel(warGame: WarGame, userId: string): boolean {
    return (
      warGame.creatorId === userId &&
      warGame.status === 'open' &&
      warGame.opponentId === null
    );
  }
}

