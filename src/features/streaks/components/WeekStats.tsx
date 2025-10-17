import { useTranslation } from 'react-i18next';
import type { WeekStreakStats } from '../types';

interface WeekStatsProps {
  stats: WeekStreakStats | null;
}

const styles = {
  container: 'w-full max-w-4xl mx-auto mb-8',
  title: 'text-xl font-semibold mb-4 text-[var(--mvx-text-color-primary)]',
  grid: 'grid grid-cols-2 md:grid-cols-4 gap-4',
  statCard: 'bg-[var(--mvx-bg-color-secondary)] rounded-lg p-4 border border-[var(--mvx-border-color-secondary)]',
  statLabel: 'text-xs md:text-sm text-[var(--mvx-text-color-secondary)] mb-1',
  statValue: 'text-2xl md:text-3xl font-bold text-[var(--mvx-text-color-primary)]',
  statSubtext: 'text-xs text-[var(--mvx-text-color-secondary)] mt-1',
  progressBar: 'w-full bg-[var(--mvx-bg-accent-color)] rounded-full h-2 mt-2 overflow-hidden',
  progressFill: 'h-full bg-[var(--mvx-text-accent-color)] transition-all duration-500',
  skeleton: 'animate-pulse bg-[var(--mvx-bg-accent-color)] rounded'
} satisfies Record<string, string>;

export const WeekStats = ({ stats }: WeekStatsProps) => {
  const { t } = useTranslation();

  if (!stats) {
    return (
      <div className={styles.container}>
        <div className={`${styles.title} ${styles.skeleton} h-6 w-48 mb-4`} />
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.statCard}>
              <div className={`${styles.skeleton} h-4 w-20 mb-2`} />
              <div className={`${styles.skeleton} h-8 w-16`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { daysClaimed, totalPoints, consecutiveDays, completionRate } = stats;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{t('pages.streaks.stats.title')}</h3>

      <div className={styles.grid}>
        {/* Days Claimed */}
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            {t('pages.streaks.stats.daysClaimed')}
          </div>
          <div className={styles.statValue}>{daysClaimed}/7</div>
          <div className={styles.statSubtext}>
            {t('pages.streaks.stats.daysOfSeven', { count: daysClaimed })}
          </div>
        </div>

        {/* Total Points */}
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            {t('pages.streaks.stats.totalPoints')}
          </div>
          <div className={styles.statValue}>{totalPoints}</div>
          <div className={styles.statSubtext}>
            {t('pages.streaks.rewards.points', { points: totalPoints })}
          </div>
        </div>

        {/* Consecutive Days */}
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            {t('pages.streaks.stats.currentStreak')}
          </div>
          <div className={styles.statValue}>{consecutiveDays}</div>
          <div className={styles.statSubtext}>
            {t('pages.streaks.stats.consecutiveDays', { count: consecutiveDays })}
          </div>
        </div>

        {/* Completion Rate */}
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            {t('pages.streaks.stats.completionRate')}
          </div>
          <div className={styles.statValue}>
            {Math.round(completionRate)}%
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

