import { supabase } from 'lib/supabase/client';
import type { TeamOfWeek, CreateTeamOfWeekData } from '../types';

export class TeamOfWeekService {
  /**
   * Récupère la Team of the Week active
   */
  static async getActiveTeamOfWeek(): Promise<TeamOfWeek | null> {
    try {
      const { data, error } = await supabase
        .from('team_of_week')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No active team found
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching active team of week:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les Teams of the Week (pour l'admin)
   */
  static async getAllTeamsOfWeek(): Promise<TeamOfWeek[]> {
    try {
      const { data, error } = await supabase
        .from('team_of_week')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching all teams of week:', error);
      throw error;
    }
  }

  /**
   * Crée une nouvelle Team of the Week
   */
  static async createTeamOfWeek(
    teamData: CreateTeamOfWeekData,
    userId: string
  ): Promise<TeamOfWeek> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('team_of_week')
        .insert({
          ...teamData,
          created_by: userId,
          is_active: true // La nouvelle équipe devient automatiquement active
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating team of week:', error);
      throw error;
    }
  }

  /**
   * Met à jour une Team of the Week existante
   */
  static async updateTeamOfWeek(
    teamId: string,
    updates: Partial<CreateTeamOfWeekData>
  ): Promise<TeamOfWeek> {
    try {
      const { data, error } = await supabase
        .from('team_of_week')
        .update(updates)
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating team of week:', error);
      throw error;
    }
  }

  /**
   * Active/désactive une Team of the Week
   */
  static async toggleTeamActive(teamId: string, isActive: boolean): Promise<TeamOfWeek> {
    try {
      const { data, error } = await supabase
        .from('team_of_week')
        .update({ is_active: isActive })
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error toggling team active status:', error);
      throw error;
    }
  }

  /**
   * Supprime une Team of the Week
   */
  static async deleteTeamOfWeek(teamId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('team_of_week')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting team of week:', error);
      throw error;
    }
  }

  /**
   * Vérifie si une Team of the Week existe déjà pour une période donnée
   */
  static async checkWeekExists(weekStartDate: string, weekEndDate: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('team_of_week')
        .select('id')
        .or(`and(week_start_date.eq.${weekStartDate},week_end_date.eq.${weekEndDate})`)
        .limit(1);

      if (error) {
        console.error('Error checking if week exists:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking if week exists:', error);
      return false;
    }
  }
}
