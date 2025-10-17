import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSupabaseAuth } from 'hooks/useSupabaseAuth';
import {
  LeaderboardTabs,
  LeaderboardTable,
  UserRankCard
} from 'features/leaderboard/components';
import { useLeaderboard, useUserRank } from 'features/leaderboard/hooks';
import {
  getCurrentWeekNumber,
  getCurrentMonth,
  getCurrentYear
} from 'features/leaderboard';
import type { LeaderboardType } from 'features/leaderboard/types';

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
  const { supabaseUserId } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<LeaderboardType>('all_time');

  // Get current period info (memoized to prevent re-calculations)
  const periodInfo = useMemo(() => ({
    currentWeek: getCurrentWeekNumber(),
    currentMonth: getCurrentMonth(),
    currentYear: getCurrentYear()
  }), []);

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

  // Debug logs (only log when values actually change)
  console.log('🏆 [Leaderboard] Render:', {
    activeTab,
    supabaseUserId: supabaseUserId ? 'authenticated' : 'null',
    filtersType: filters.type
  });

  // Fetch leaderboard and user rank (temporarily disable real-time to debug)
  const { entries, loading, error, refresh } = useLeaderboard(filters, false);
  const {
    rank: userRank,
    loading: rankLoading,
    refresh: refreshRank
  } = useUserRank(supabaseUserId, filters, false);

  // Debug logs for hooks (reduced frequency)
  console.log('🏆 [Leaderboard] Hooks state:', {
    entriesCount: entries.length,
    loading,
    hasError: !!error,
    rankLoading,
    hasUserRank: !!userRank
  });

  const handleRefresh = useCallback(() => {
    refresh();
    refreshRank();
  }, [refresh, refreshRank]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>🏆 {t('leaderboard.title')}</h1>
        <p className={styles.subtitle}>{t('leaderboard.subtitle')}</p>
      </div>

          {/* Tabs */}
          <LeaderboardTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Error State */}
      {error && (
        <div className={styles.error}>
          <p className={styles.errorText}>{t('common.error')}</p>
          <button onClick={handleRefresh} className={styles.refreshButton}>
            {t('common.retry')}
          </button>
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

