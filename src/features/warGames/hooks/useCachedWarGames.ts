/**
 * Cached War Games Hook
 *
 * Provides war games data with 5-minute cache and manual refresh
 */
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WarGameService } from '../services/warGameService';
import { useAuth } from 'contexts';
import type { WarGameWithDetails } from '../types';

export const useCachedWarGames = () => {
  const { supabaseUserId } = useAuth();

  const [allWarGames, setAllWarGames] = useState<WarGameWithDetails[]>([]);
  const [loadingWarGames, setLoadingWarGames] = useState(false);
  const [warGamesError, setWarGamesError] = useState<string | null>(null);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['warGames', supabaseUserId],
    queryFn: async () => {
      if (!supabaseUserId) {
        throw new Error('User not authenticated');
      }

      setLoadingWarGames(true);
      setWarGamesError(null);

      try {
        const games = await WarGameService.getAllUserVisibleWarGames();
        setAllWarGames(games);
        return games;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
        setWarGamesError(errorMessage);
        throw err;
      } finally {
        setLoadingWarGames(false);
      }
    },
    enabled: !!supabaseUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    allWarGames,
    loadingWarGames: isLoading,
    warGamesError: error?.message || warGamesError,
    refetch,
    isRefetching,
    lastUpdated: data ? new Date() : null,
  };
};
