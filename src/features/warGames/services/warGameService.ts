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
  static async getAllUserVisibleWarGames(): Promise<WarGameWithDetails[]> {
    console.log('📊 Fetching ALL user-visible war games from database');
    
    try {
      const { data, error } = await supabase
        .from('war_games')
        .select(`
          *,
          creator:creator_id(username, avatar_url, wallet_address),
          opponent:opponent_id(username, avatar_url, wallet_address)
        `)
        .in('status', ['open', 'in_progress', 'completed'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all war games:', error);
        throw new Error('Failed to fetch all war games');
      }

      const allGames = (data || []).map(this.transformWarGame);
      
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

    console.log('🔍 DEBUG: Joining war game:', joinData.warGameId);
    console.log('🔍 DEBUG: User joining:', userId);
    console.log('🔍 DEBUG: Team ID:', joinData.teamId);

    try {
      // First, get the war game details to check creator and current state
      const { data: warGameData, error: fetchError } = await supabase
        .from('war_games')
        .select('id, creator_id, opponent_id, status, creator_username')
        .eq('id', joinData.warGameId)
        .single();

      if (fetchError) {
        console.error('🔍 DEBUG: Error fetching war game details:', fetchError);
        throw new Error('Failed to fetch war game details');
      }

      if (!warGameData) {
        throw new Error('War game not found');
      }

      console.log('🔍 DEBUG: War game details:', warGameData);
      console.log('🔍 DEBUG: Creator ID:', warGameData.creator_id);
      console.log('🔍 DEBUG: Current opponent ID:', warGameData.opponent_id);
      console.log('🔍 DEBUG: User joining ID:', userId);
      console.log('🔍 DEBUG: Are they the same?', warGameData.creator_id === userId);

      // Check if user is trying to join their own war game
      if (warGameData.creator_id === userId) {
        throw new Error('You cannot join your own war game');
      }

      // Check if war game already has an opponent
      if (warGameData.opponent_id !== null) {
        throw new Error('This war game already has an opponent');
      }

      // Check if war game is still open
      if (warGameData.status !== 'open') {
        throw new Error('This war game is no longer open');
      }

      console.log('🔍 DEBUG: Attempting to update war game...');

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
        console.error('🔍 DEBUG: Error joining war game:', error);
        console.error('🔍 DEBUG: Error details:', error.details);
        console.error('🔍 DEBUG: Error hint:', error.hint);
        
        if (error.code === 'PGRST116') {
          throw new Error('War game not found or already has an opponent');
        }
        
        throw new Error(`Failed to join war game: ${error.message}`);
      }

      if (!data) {
        throw new Error('War game not found or already has an opponent');
      }

      console.log('🔍 DEBUG: Successfully joined war game:', data);
      return this.transformWarGame(data);
    } catch (error) {
      console.error('🔍 DEBUG: Error in joinWarGame:', error);
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

