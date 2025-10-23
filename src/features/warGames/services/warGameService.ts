import { supabase } from 'lib/supabase/client';
import { warGamesAPI } from 'api/wargames';
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
   * @deprecated Use getAllUserVisibleWarGames instead for better control
   */
  static async getOpenWarGames(): Promise<WarGameWithDetails[]> {
    console.log('📋 Fetching OPEN war games via RPC function');
    
    try {
      const { data, error } = await supabase
        .rpc('get_open_war_games');

      if (error) {
        console.error('Error fetching open war games:', error);
        throw new Error('Failed to fetch open war games');
      }

      const openGames = (data || []).map((game: any) => ({
        id: game.id,
        creatorId: game.creator_id,
        creatorUsername: game.creator_username,
        creatorAddress: game.creator_address,
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

      console.log('📋 Open war games found:', openGames.length);
      return openGames;
    } catch (error) {
      console.error('Error in getOpenWarGames:', error);
      throw error;
    }
  }

  /**
   * Get all war games for display (open, in_progress, completed)
   * Returns all war games without user filtering
   */
  static async getAllUserVisibleWarGames(limit?: number): Promise<WarGameWithDetails[]> {
    console.log('📊 Fetching ALL user-visible war games from API');
    
    try {
      // Use provided limit or default to 100 if not specified
      const actualLimit = limit || 100;
      const response = await warGamesAPI.getAll(undefined, actualLimit, 0);
      
      // Check if response is successful and has data
      if (!response.success || !response.data) {
        throw new Error('Invalid war games response');
      }
      
      const allGames = response.data.warGames.map((game: any) => this.transformWarGame(game));
      
      console.log('📊 Total war games retrieved:', allGames.length);
      console.log('📊 Status breakdown:', {
        open: allGames.filter(g => g.status === 'open' && g.opponentId === null).length,
        waiting_second_player: allGames.filter(g => g.status === 'open' && g.opponentId === null).length,
        in_progress: allGames.filter(g => g.status === 'in_progress').length,
        completed: allGames.filter(g => g.status === 'completed').length,
      });

      return allGames;
    } catch (error) {
      console.error('Error in getAllUserVisibleWarGames:', error);
      throw error;
    }
  }

  /**
   * Filter war games that are open and available to join
   */
  static filterOpenWarGames(warGames: WarGameWithDetails[]): WarGameWithDetails[] {
    const now = new Date();
    return warGames.filter(game => 
      game.status === 'open' && 
      game.opponentId === null && 
      new Date(game.entryDeadline) > now
    );
  }

  /**
   * Filter war games that are completed
   */
  static filterCompletedWarGames(warGames: WarGameWithDetails[], userId?: string): WarGameWithDetails[] {
    const completed = warGames.filter(game => game.status === 'completed');
    
    // If userId provided, filter to only games where user participated
    if (userId) {
      return completed.filter(game => 
        game.creatorId === userId || game.opponentId === userId
      );
    }
    
    return completed;
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
          creator:creator_id(username, avatar_url, wallet_address),
          opponent:opponent_id(username, avatar_url, wallet_address)
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
   * Get all war games for a specific user (all statuses)
   */
  static async getAllWarGames(userId: string): Promise<WarGameWithDetails[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('📊 Fetching ALL war games for user:', userId);

    try {
      const { data, error } = await supabase
        .from('war_games')
        .select(`
          *,
          creator:creator_id(username, avatar_url, wallet_address),
          opponent:opponent_id(username, avatar_url, wallet_address)
        `)
        .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all war games:', error);
        throw new Error('Failed to fetch all war games');
      }

      const warGames = (data || []).map(this.transformWarGame);
      
      console.log('📊 Total war games retrieved:', warGames.length);
      console.log('📊 Status breakdown:', {
        open: warGames.filter(g => g.status === 'open').length,
        in_progress: warGames.filter(g => g.status === 'in_progress').length,
        completed: warGames.filter(g => g.status === 'completed').length,
        cancelled: warGames.filter(g => g.status === 'cancelled').length,
      });

      return warGames;
    } catch (error) {
      console.error('Error in getAllWarGames:', error);
      throw error;
    }
  }

  /**
   * Get completed war games for a specific user
   */
  static async getCompletedWarGames(userId: string): Promise<WarGameWithDetails[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('🏆 Fetching COMPLETED war games for user:', userId);

    try {
      const { data, error } = await supabase
        .from('war_games')
        .select(`
          *,
          creator:creator_id(username, avatar_url, wallet_address),
          opponent:opponent_id(username, avatar_url, wallet_address)
        `)
        .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching completed war games:', error);
        throw new Error('Failed to fetch completed war games');
      }

      const completedGames = (data || []).map(this.transformWarGame);
      console.log('🏆 Completed war games found:', completedGames.length);

      return completedGames;
    } catch (error) {
      console.error('Error in getCompletedWarGames:', error);
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
    console.log('Creating war game via API');
    console.log('War game data:', warGameData);

    try {
      const response = await warGamesAPI.create(
        warGameData.teamId,
        warGameData.pointsStake,
        warGameData.entryDeadline
      );

      return this.transformWarGame(response.warGame);
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
    console.log('🔍 Joining war game via API:', joinData.warGameId);
    console.log('🔍 Team ID:', joinData.teamId);

    try {
      const response = await warGamesAPI.join(joinData.warGameId, joinData.teamId);
      console.log('🔍 Successfully joined war game');
      return this.transformWarGame(response.warGame);
    } catch (error) {
      console.error('🔍 Error in joinWarGame:', error);
      throw error;
    }
  }

  /**
   * Cancel a war game (only if creator and no opponent)
   */
  static async cancelWarGame(warGameId: string, userId: string): Promise<void> {
    try {
      await warGamesAPI.cancel(warGameId);
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
      creatorAddress: data.creator?.wallet_address,
      opponentUsername: data.opponent?.username,
      opponentAvatarUrl: data.opponent?.avatar_url,
      opponentAddress: data.opponent?.wallet_address
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

