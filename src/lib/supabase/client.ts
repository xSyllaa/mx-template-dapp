import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          wallet_address: string;
          username: string | null;
          role: 'user' | 'admin';
          total_points: number;
          current_streak: number;
          streak_last_claim: string | null;
          nft_count: number;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          username?: string | null;
          role?: 'user' | 'admin';
          total_points?: number;
          current_streak?: number;
          streak_last_claim?: string | null;
          nft_count?: number;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          username?: string | null;
          role?: 'user' | 'admin';
          total_points?: number;
          current_streak?: number;
          streak_last_claim?: string | null;
          nft_count?: number;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

