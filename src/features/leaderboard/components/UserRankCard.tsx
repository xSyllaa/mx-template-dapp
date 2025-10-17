import { useTranslation } from 'react-i18next';
import type { UserRankInfo } from '../types';

interface UserRankCardProps {
  rank: UserRankInfo | null;
  loading: boolean;
}

const styles = {
  container:
    'sticky bottom-4 bg-[var(--mvx-bg-color-secondary)] border-2 border-[var(--mvx-text-accent-color)] rounded-lg p-4 shadow-lg',
  content: 'flex items-center justify-between gap-4',
  left: 'flex items-center gap-4',
  icon: 'text-4xl',
  info: 'flex flex-col',
  title: 'text-sm text-[var(--mvx-text-color-secondary)] uppercase',
  rank: 'text-2xl font-bold text-[var(--mvx-text-accent-color)]',
  right: 'text-right',
  points: 'text-2xl font-bold text-[var(--mvx-text-color-primary)]',
  pointsLabel: 'text-xs text-[var(--mvx-text-color-secondary)] uppercase',
  loading: 'text-center py-4 text-[var(--mvx-text-color-secondary)]',
  noRank: 'text-center py-4',
  noRankText: 'text-[var(--mvx-text-color-secondary)]',
  noRankCta: 'mt-2 text-[var(--mvx-text-accent-color)] font-semibold'
} satisfies Record<string, string>;

export const UserRankCard = ({ rank, loading }: UserRankCardProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className="animate-pulse">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (!rank) {
    return (
      <div className={styles.container}>
        <div className={styles.noRank}>
          <p className={styles.noRankText}>
            {t('leaderboard.notRanked')}
          </p>
          <p className={styles.noRankCta}>
            {t('leaderboard.startEarning')}
          </p>
        </div>
      </div>
    );
  }

  const getRankEmoji = (rankNum: number) => {
    if (rankNum === 1) return '🥇';
    if (rankNum === 2) return '🥈';
    if (rankNum === 3) return '🥉';
    if (rankNum <= 10) return '🔥';
    if (rankNum <= 50) return '⭐';
    return '📊';
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Left - Rank */}
        <div className={styles.left}>
          <div className={styles.icon}>{getRankEmoji(rank.rank)}</div>
          <div className={styles.info}>
            <div className={styles.title}>{t('leaderboard.yourRank')}</div>
            <div className={styles.rank}>
              #{rank.rank}
              <span className="text-sm text-[var(--mvx-text-color-secondary)] ml-2">
                / {rank.total_users}
              </span>
            </div>
          </div>
        </div>

        {/* Right - Points */}
        <div className={styles.right}>
          <div className={styles.points}>{rank.points.toLocaleString()}</div>
          <div className={styles.pointsLabel}>{t('common.points')}</div>
        </div>
      </div>
    </div>
  );
};

