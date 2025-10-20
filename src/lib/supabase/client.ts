import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

/**
 * Fonction pour obtenir le JWT custom depuis localStorage
 */
export const getCustomJWT = (): string | null => {
  try {
    const token = localStorage.getItem('supabase.auth.token');
    const expiresAt = localStorage.getItem('supabase.auth.expires_at');
    
    console.log('[Supabase Client] JWT Debug:', {
      hasToken: !!token,
      tokenLength: token?.length,
      expiresAt,
      isExpired: expiresAt ? Date.now() > parseInt(expiresAt) : 'no_expires_at'
    });
    
    if (token && expiresAt) {
      const isExpired = Date.now() > parseInt(expiresAt);
      if (!isExpired) {
        console.log('[Supabase Client] JWT valide retourné');
        return token;
      } else {
        console.log('[Supabase Client] JWT expiré');
      }
    } else {
      console.log('[Supabase Client] Pas de JWT ou expires_at');
    }
  } catch (error) {
    console.error('[Supabase Client] Error getting JWT:', error);
  }
  return null;
};

// Client Supabase initial
const baseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Fonction pour mettre à jour les headers avec le JWT
export const refreshSupabaseClient = () => {
  const jwt = getCustomJWT();
  console.log('[Supabase Client] Setting JWT headers:', jwt ? 'Present' : 'Missing');

  try {
    const rest = (baseClient as any).rest;
    if (rest && rest.headers) {
      if (jwt) {
        rest.headers['Authorization'] = `Bearer ${jwt}`;
      } else {
        // Fallback to anon when no JWT
        rest.headers['Authorization'] = `Bearer ${supabaseAnonKey}`;
      }
      console.log('[Supabase Client] REST Authorization header configured');
    }
  } catch (e) {
    console.warn('[Supabase Client] Could not set REST headers', e);
  }

  return baseClient;
};

// Exporter le client
export const supabase = baseClient;

/**
 * Fonction pour configurer le Realtime avec JWT
 */
export const configureRealtimeAuth = (jwt: string | null) => {
  if (jwt) {
    // Configurer l'accessToken comme fonction (requis par Supabase Realtime)
    (baseClient as any).realtime.accessToken = () => jwt;
    try {
      (baseClient as any).realtime.setAuth(jwt);
    } catch (error) {
      // setAuth peut ne pas être disponible dans toutes les versions
      console.warn('[Supabase Client] setAuth not available:', error);
    }
  } else {
    (baseClient as any).realtime.accessToken = () => supabaseAnonKey;
  }
};

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
      team_of_week: {
        Row: {
          id: string;
          week_start_date: string;
          week_end_date: string;
          title: string;
          description: string | null;
          players: any; // JSONB
          total_holders: number;
          created_by: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          week_start_date: string;
          week_end_date: string;
          title: string;
          description?: string | null;
          players: any; // JSONB
          total_holders?: number;
          created_by: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          week_start_date?: string;
          week_end_date?: string;
          title?: string;
          description?: string | null;
          players?: any; // JSONB
          total_holders?: number;
          created_by?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

