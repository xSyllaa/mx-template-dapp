import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LeaderboardType } from '../types';

interface LeaderboardTabsProps {
  activeTab: LeaderboardType;
  onTabChange: (tab: LeaderboardType) => void;
}

const styles = {
  container: 'flex gap-2 mb-6 border-b border-[var(--mvx-border-color-secondary)]',
  tab: 'px-6 py-3 font-semibold transition-all duration-200 border-b-2 cursor-pointer',
  activeTab:
    'border-[var(--mvx-text-accent-color)] text-[var(--mvx-text-accent-color)]',
  inactiveTab:
    'border-transparent text-[var(--mvx-text-color-secondary)] hover:text-[var(--mvx-text-color-primary)] hover:border-[var(--mvx-text-color-secondary)]'
} satisfies Record<string, string>;

export const LeaderboardTabs = ({
  activeTab,
  onTabChange
}: LeaderboardTabsProps) => {
  const { t } = useTranslation();

  const tabs: Array<{ id: LeaderboardType; label: string }> = [
    { id: 'all_time', label: t('leaderboard.tabs.allTime') },
    { id: 'weekly', label: t('leaderboard.tabs.weekly') },
    { id: 'monthly', label: t('leaderboard.tabs.monthly') }
  ];

  return (
    <div className={styles.container}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`${styles.tab} ${
            activeTab === tab.id ? styles.activeTab : styles.inactiveTab
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

