/**
 * Custom hook for fetching and managing dashboard statistics
 * Centralizes all user stats to avoid duplicate API calls
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useGetAccount } from 'lib';
import { useAuth } from 'contexts/AuthContext';
import { useMyNFTs } from 'features/myNFTs/hooks/useMyNFTs';
import { useWeeklyStreak } from 'features/streaks/hooks/useWeeklyStreak';
import { getUserRank } from 'features/leaderboard/services/leaderboardService';
import { supabase } from 'lib/supabase/client';
import type { LeaderboardFilters } from 'features/leaderboard/types';

const DEBUG = import.meta.env.DEV;

// ============================================================
// CACHE CONFIGURATION
// ============================================================

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CachedDashboardData {
  totalPoints: number;
  globalRank: number | null;
  weeklyRank: number | null;
  monthlyRank: number | null;
  username: string | null;
  walletAddress: string | null;
  timestamp: number;
}

// Cache stored outside component to persist between renders
const dashboardCache = new Map<string, CachedDashboardData>();

export interface DashboardStats {
  // NFT Stats
  nftCount: number;
  hasNFTs: boolean;
  
  // Points & Rank
  totalPoints: number;
  globalRank: number | null;
  weeklyRank: number | null;
  monthlyRank: number | null;
  
  // Streak Stats
  currentStreak: number;
  streakCompleted: boolean;
  canClaimToday: boolean;
  
  // User Info
  username: string | null;
  walletAddress: string | null;
}

interface UseDashboardStatsReturn {
  stats: DashboardStats;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const DEFAULT_STATS: DashboardStats = {
  nftCount: 0,
  hasNFTs: false,
  totalPoints: 0,
  globalRank: null,
  weeklyRank: null,
  monthlyRank: null,
  currentStreak: 0,
  streakCompleted: false,
  canClaimToday: false,
  username: null,
  walletAddress: null
};

/**
 * Hook to fetch and manage all dashboard statistics
 * Optimized to minimize API calls and avoid duplication
 */
export const useDashboardStats = (): UseDashboardStatsReturn => {
  const { address } = useGetAccount();
  const { isAuthenticated, supabaseUserId } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Ref to prevent multiple simultaneous fetches
  const isFetchingRef = useRef(false);
  const lastFetchedUserIdRef = useRef<string | null>(null);

  // ============================================================
  // USE EXISTING HOOKS (avoiding duplication)
  // ============================================================
  
  // NFT data from useMyNFTs hook
  const { 
    nftCount, 
    hasNFTs,
    loading: nftsLoading 
  } = useMyNFTs();

  // Streak data from useWeeklyStreak hook
  const {
    stats: streakStats,
    canClaimToday,
    loading: streakLoading
  } = useWeeklyStreak();

  // ============================================================
  // FETCH USER PROFILE & RANKS (without NFT/Streak dependencies)
  // ============================================================

  const fetchUserStats = useCallback(async () => {
    if (!address || !isAuthenticated || !supabaseUserId) {
      setStats(DEFAULT_STATS);
      setLoading(false);
      return;
    }

    // Check cache first
    const cached = dashboardCache.get(supabaseUserId);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      if (DEBUG) console.log('💾 [useDashboardStats] Using cached data (age: ' + 
        Math.round((now - cached.timestamp) / 1000) + 's)');
      
      setStats(prev => ({
        ...prev,
        totalPoints: cached.totalPoints,
        globalRank: cached.globalRank,
        weeklyRank: cached.weeklyRank,
        monthlyRank: cached.monthlyRank,
        username: cached.username,
        walletAddress: cached.walletAddress
      }));
      setLoading(false);
      return;
    }

    // Prevent duplicate fetches
    if (isFetchingRef.current && lastFetchedUserIdRef.current === supabaseUserId) {
      if (DEBUG) console.log('🚫 [useDashboardStats] Fetch already in progress, skipping...');
      return;
    }

    try {
      isFetchingRef.current = true;
      lastFetchedUserIdRef.current = supabaseUserId;
      setLoading(true);
      setError(null);

      if (DEBUG) console.log('📊 [useDashboardStats] Fetching user stats from API for:', supabaseUserId);

      // Fetch user profile (username, total_points) from Supabase
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('username, total_points, wallet_address')
        .eq('id', supabaseUserId)
        .maybeSingle();

      if (profileError) {
        console.error('[useDashboardStats] Error fetching user profile:', profileError);
        throw profileError;
      }

      // Fetch user ranks (all-time, weekly, monthly)
      const allTimeFilters: LeaderboardFilters = { type: 'all_time' };
      const weeklyFilters: LeaderboardFilters = { 
        type: 'weekly',
        week: getCurrentWeekNumber(),
        year: new Date().getFullYear()
      };
      const monthlyFilters: LeaderboardFilters = { 
        type: 'monthly',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      };

      const [allTimeRank, weeklyRank, monthlyRank] = await Promise.all([
        getUserRank(supabaseUserId, allTimeFilters).catch(() => null),
        getUserRank(supabaseUserId, weeklyFilters).catch(() => null),
        getUserRank(supabaseUserId, monthlyFilters).catch(() => null)
      ]);

      const fetchedData = {
        totalPoints: userProfile?.total_points || 0,
        globalRank: allTimeRank?.rank || null,
        weeklyRank: weeklyRank?.rank || null,
        monthlyRank: monthlyRank?.rank || null,
        username: userProfile?.username || null,
        walletAddress: address
      };

      if (DEBUG) {
        console.log('✅ [useDashboardStats] Stats fetched successfully:', fetchedData);
      }

      // Cache the fetched data
      dashboardCache.set(supabaseUserId, {
        ...fetchedData,
        timestamp: Date.now()
      });

      // Store base stats (will be combined with NFT/Streak data later)
      setStats(prev => ({
        ...prev,
        ...fetchedData
      }));

    } catch (err) {
      console.error('[useDashboardStats] Error fetching stats:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [address, isAuthenticated, supabaseUserId]);

  // ============================================================
  // AUTO-FETCH ON MOUNT & AUTH CHANGE
  // ============================================================

  useEffect(() => {
    // Only fetch when user is authenticated
    if (isAuthenticated && supabaseUserId) {
      fetchUserStats();
    }
  }, [isAuthenticated, supabaseUserId, fetchUserStats]);

  // ============================================================
  // UPDATE STATS WHEN NFT/STREAK DATA CHANGES
  // ============================================================

  useEffect(() => {
    // Update NFT stats without refetching everything
    setStats(prev => ({
      ...prev,
      nftCount,
      hasNFTs
    }));
  }, [nftCount, hasNFTs]);

  useEffect(() => {
    // Update Streak stats without refetching everything
    setStats(prev => ({
      ...prev,
      currentStreak: streakStats?.consecutiveDays || 0,
      streakCompleted: streakStats?.isCompleted || false,
      canClaimToday
    }));
  }, [streakStats?.consecutiveDays, streakStats?.isCompleted, canClaimToday]);

  // ============================================================
  // REAL-TIME UPDATES
  // ============================================================

  useEffect(() => {
    if (!isAuthenticated || !supabaseUserId) return;

    // Subscribe to points_transactions changes
    const pointsChannel = supabase
      .channel('dashboard-points-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'points_transactions',
          filter: `user_id=eq.${supabaseUserId}`
        },
        () => {
          // Clear cache and refresh stats when user gains/loses points
          dashboardCache.delete(supabaseUserId);
          lastFetchedUserIdRef.current = null;
          fetchUserStats();
        }
      )
      .subscribe();

    // Subscribe to user profile changes
    const userChannel = supabase
      .channel('dashboard-user-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${supabaseUserId}`
        },
        () => {
          // Clear cache and refresh stats when user profile changes
          dashboardCache.delete(supabaseUserId);
          lastFetchedUserIdRef.current = null;
          fetchUserStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pointsChannel);
      supabase.removeChannel(userChannel);
    };
  }, [isAuthenticated, supabaseUserId, fetchUserStats]);

  // ============================================================
  // MANUAL REFRESH
  // ============================================================

  const refresh = useCallback(async () => {
    if (supabaseUserId) {
      // Clear cache for this user to force refresh
      dashboardCache.delete(supabaseUserId);
      if (DEBUG) console.log('🔄 [useDashboardStats] Cache cleared, forcing refresh');
    }
    lastFetchedUserIdRef.current = null; // Reset to allow refresh
    await fetchUserStats();
  }, [fetchUserStats, supabaseUserId]);

  // Combine loading states
  const isLoading = loading || nftsLoading || streakLoading;

  return {
    stats,
    loading: isLoading,
    error,
    refresh
  };
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get current week number (Monday to Sunday, matching PostgreSQL)
 */
const getCurrentWeekNumber = (): number => {
  const now = new Date();
  const year = now.getFullYear();
  
  // Get January 1st of current year
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const jan1DayOfWeek = jan1.getUTCDay();
  
  // Calculate the first Monday of the year
  const firstMonday = new Date(Date.UTC(year, 0, 1));
  if (jan1DayOfWeek === 0) {
    firstMonday.setUTCDate(2); // Sunday -> Monday is next day
  } else if (jan1DayOfWeek === 1) {
    firstMonday.setUTCDate(1); // Already Monday
  } else {
    firstMonday.setUTCDate(1 + (8 - jan1DayOfWeek)); // Tuesday-Saturday -> next Monday
  }
  
  // Calculate week number based on Monday start
  const diff = now.getTime() - firstMonday.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNumber = Math.floor(diff / oneWeek) + 1;
  
  return Math.max(1, weekNumber);
};

