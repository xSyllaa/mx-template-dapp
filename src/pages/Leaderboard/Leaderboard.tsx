import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'contexts/AuthContext';
import { RefreshButton } from 'components/RefreshButton';
import {
  LeaderboardTabs,
  LeaderboardTable,
  UserRankCard
} from 'features/leaderboard/components';
import { useCachedLeaderboard, useUserRank } from 'features/leaderboard/hooks';
import { Button } from 'components/Button';
import {
  getCurrentWeekNumber,
  getCurrentMonth,
  getCurrentYear,
  getLeaderboardDateRange,
  formatDateToUTC
} from 'features/leaderboard';
import type { LeaderboardType } from 'features/leaderboard/types';

// Enable debug logs in development only
const DEBUG = import.meta.env.DEV;

// prettier-ignore
const styles = {
  container: 'container max-w-7xl mx-auto px-4 py-8',
  header: 'mb-8',
  title: 'text-4xl md:text-5xl font-bold text-[var(--mvx-text-color-primary)] mb-4',
  subtitle: 'text-lg text-[var(--mvx-text-color-secondary)]',
  content: 'mb-20',
  refreshButton: 'mt-4 px-4 py-2 bg-[var(--mvx-text-accent-color)] text-white rounded-lg hover:opacity-80 transition-opacity',
  error: 'text-center py-12',
  errorText: 'text-red-500 mb-4'
} satisfies Record<string, string>;

export const Leaderboard = () => {
  const { t } = useTranslation();
  const { supabaseUserId } = useAuth();

  const [activeTab, setActiveTab] = useState<LeaderboardType>('all_time');

  // Get current period info (memoized to prevent re-calculations)
  const periodInfo = useMemo(() => ({
    currentWeek: getCurrentWeekNumber(),
    currentMonth: getCurrentMonth(),
    currentYear: getCurrentYear()
  }), []);

  // Get date range for current active tab (memoized)
  const dateRange = useMemo(() => {
    if (activeTab === 'weekly') {
      return getLeaderboardDateRange('weekly', periodInfo.currentWeek, undefined, periodInfo.currentYear);
    } else if (activeTab === 'monthly') {
      return getLeaderboardDateRange('monthly', undefined, periodInfo.currentMonth, periodInfo.currentYear);
    } else {
      return getLeaderboardDateRange('all_time');
    }
  }, [activeTab, periodInfo]);

  // Format dates for display
  const formattedDates = useMemo(() => {
    const startDate = formatDateToUTC(dateRange.start);
    const endDate = formatDateToUTC(dateRange.end);
    
    if (activeTab === 'weekly') {
      return t('leaderboard.periodDates.weekly', {
        week: periodInfo.currentWeek,
        year: periodInfo.currentYear,
        start: startDate,
        end: endDate
      });
    } else if (activeTab === 'monthly') {
      const monthNames = [
        t('common.months.january'), t('common.months.february'), t('common.months.march'), 
        t('common.months.april'), t('common.months.may'), t('common.months.june'),
        t('common.months.july'), t('common.months.august'), t('common.months.september'),
        t('common.months.october'), t('common.months.november'), t('common.months.december')
      ];
      return t('leaderboard.periodDates.monthly', {
        month: monthNames[periodInfo.currentMonth - 1],
        year: periodInfo.currentYear,
        start: startDate,
        end: endDate
      });
    } else {
      return t('leaderboard.periodDates.allTime', {
        start: startDate,
        end: endDate
      });
    }
  }, [activeTab, dateRange, periodInfo, t]);

  // Build filters based on active tab (memoized to prevent re-renders)
  const filters = useMemo(() => {
    if (activeTab === 'weekly') {
      return { type: 'weekly' as const, week: periodInfo.currentWeek, year: periodInfo.currentYear };
    } else if (activeTab === 'monthly') {
      return { type: 'monthly' as const, month: periodInfo.currentMonth, year: periodInfo.currentYear };
    } else {
      return { type: 'all_time' as const };
    }
  }, [activeTab, periodInfo]);

  // Memoized tab change handler to prevent re-renders
  const handleTabChange = useCallback((newTab: LeaderboardType) => {
    setActiveTab(newTab);
  }, []);

  // Fetch leaderboard and user rank (real-time enabled)
  const { leaderboard: entries, loading, error, refetch: refresh } = useCachedLeaderboard(activeTab as 'all_time' | 'weekly' | 'monthly');
  const {
    rank: userRank,
    loading: rankLoading,
    refresh: refreshRank
  } = useUserRank(supabaseUserId, filters, true);

  // Get refetch functions for all tabs at component level
  const { refetch: refetchAllTime } = useCachedLeaderboard('all_time');
  const { refetch: refetchWeekly } = useCachedLeaderboard('weekly');
  const { refetch: refetchMonthly } = useCachedLeaderboard('monthly');

  // Refresh function for the refresh button component
  const handleRefreshAll = useCallback(async () => {
    console.log('🔄 [Refresh] All leaderboards');

    // Refresh current tab and user rank
    await Promise.all([
      refresh(), // Current tab
      refreshRank(), // User rank
    ]);

    // Refresh other tabs in background (no await to not block UI)
    setTimeout(async () => {
      try {
        await Promise.all([
          refetchAllTime(),
          refetchWeekly(),
          refetchMonthly()
        ]);
      } catch (error) {
        console.error('Error refreshing other leaderboards:', error);
      }
    }, 100);
  }, [refresh, refreshRank, refetchAllTime, refetchWeekly, refetchMonthly]);

  // Logs handled centrally in useLeaderboard

  const handleRefresh = useCallback(() => {
    refresh();
    refreshRank();
  }, [refresh, refreshRank]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={styles.title}>🏆 {t('leaderboard.title')}</h1>
            <p className={styles.subtitle}>{t('leaderboard.subtitle')}</p>
          </div>

          {/* Refresh All Button */}
          <div className="flex items-center gap-3">
            <RefreshButton
              onRefresh={handleRefreshAll}
              cooldownMs={30000}
              minLoadingMs={1000}
              normalText="Tout actualiser"
              loadingText="Actualisation..."
              successText="Actualisé"
              showToasts={false}
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-[var(--mvx-bg-color-secondary)] rounded-lg border border-[var(--mvx-border-color-secondary)]">
          <p className="text-sm text-[var(--mvx-text-color-secondary)]">
            📅 {formattedDates}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <LeaderboardTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Error State */}
      {error && (
        <div className={styles.error}>
          <p className={styles.errorText}>{t('common.error')}</p>
          <div className="flex gap-3 mt-4">
            <button onClick={handleRefresh} className={styles.refreshButton}>
              {t('common.retry')}
            </button>
            <RefreshButton
              onRefresh={handleRefreshAll}
              cooldownMs={30000}
              minLoadingMs={1000}
              normalText="Tout actualiser"
              loadingText="Actualisation..."
              successText="Actualisé"
              showToasts={false}
            />
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {!error && (
        <div className={styles.content}>
          <LeaderboardTable
            entries={entries}
            currentUserId={supabaseUserId}
            loading={loading}
          />
        </div>
      )}

      {/* User Rank Card (sticky at bottom) */}
      {supabaseUserId && <UserRankCard rank={userRank} loading={rankLoading} />}
    </div>
  );
};

