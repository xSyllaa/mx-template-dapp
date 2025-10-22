/**
 * Cached Team of the Week Hook
 *
 * Provides team of the week data with 5-minute cache and manual refresh
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TeamOfWeekService } from '../services/teamOfWeekService';
import type { TeamOfWeek } from '../types';

export const useCachedTeamOfWeek = () => {
  const [teams, setTeams] = useState<TeamOfWeek[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamOfWeek | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { data, isLoading, error: queryError, refetch, isRefetching } = useQuery({
    queryKey: ['teamOfWeek'],
    queryFn: async () => {
      setLoading(true);
      setError(null);
      setIsInitialLoad(true);

      try {
        const allTeams = await TeamOfWeekService.getAllTeamsOfWeek();
        setTeams(allTeams);

        // Sélectionner la semaine courante par défaut
        const currentWeek = getCurrentWeek();
        const currentTeam = allTeams.find(team =>
          isTeamInCurrentWeek(team, currentWeek.year, currentWeek.weekNumber)
        );

        setSelectedTeam(currentTeam || (allTeams.length > 0 ? allTeams[0] : null));
        setIsInitialLoad(false);
        return allTeams;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
        setError(errorMessage);
        setIsInitialLoad(false);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const getCurrentWeek = () => {
    const today = new Date();
    const year = today.getFullYear();

    // Calculer le numéro de semaine ISO
    const target = new Date(today.valueOf());
    const dayNr = (today.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);

    return { year, weekNumber };
  };

  const isTeamInCurrentWeek = (team: TeamOfWeek, year: number, weekNumber: number) => {
    const teamStart = new Date(team.week_start_date);
    const teamEnd = new Date(team.week_end_date);

    const currentWeekStart = getWeekStartDate(year, weekNumber);
    const currentWeekEnd = getWeekEndDate(year, weekNumber);

    return teamStart <= currentWeekEnd && teamEnd >= currentWeekStart;
  };

  const getWeekStartDate = (year: number, weekNumber: number) => {
    const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
  };

  const getWeekEndDate = (year: number, weekNumber: number) => {
    const start = getWeekStartDate(year, weekNumber);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  };

  return {
    teams,
    selectedTeam,
    setSelectedTeam,
    loading: isLoading || isInitialLoad,
    error: error || queryError?.message,
    refetch,
    isRefetching,
    lastUpdated: data ? new Date() : null,
    isInitialLoad,
  };
};
