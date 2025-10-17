import { useTranslation } from 'react-i18next';
import type { LeaderboardEntry as LeaderboardEntryType } from '../types';

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType;
  isCurrentUser?: boolean;
}

const styles = {
  container:
    'flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-[var(--mvx-bg-accent-color)]',
  currentUser: 'bg-[var(--mvx-bg-accent-color)] border-l-4 border-[var(--mvx-text-accent-color)]',
  rank: 'min-w-[3rem] text-center font-bold text-2xl',
  rankTop3: 'text-[var(--mvx-text-accent-color)]',
  rankOther: 'text-[var(--mvx-text-color-secondary)]',
  avatar: 'w-12 h-12 rounded-full bg-[var(--mvx-bg-color-secondary)] flex items-center justify-center text-xl font-bold text-[var(--mvx-text-accent-color)]',
  avatarImg: 'w-12 h-12 rounded-full object-cover',
  info: 'flex-1',
  username: 'font-semibold text-[var(--mvx-text-color-primary)]',
  anonymous: 'text-[var(--mvx-text-color-secondary)] italic',
  points: 'text-right',
  pointsValue: 'text-xl font-bold text-[var(--mvx-text-accent-color)]',
  pointsLabel: 'text-xs text-[var(--mvx-text-color-secondary)] uppercase'
} satisfies Record<string, string>;

export const LeaderboardEntry = ({
  entry,
  isCurrentUser = false
}: LeaderboardEntryProps) => {
  const { t } = useTranslation();

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getUserInitials = (username: string | null): string => {
    if (!username) return '?';
    return username
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`${styles.container} ${isCurrentUser ? styles.currentUser : ''}`}
    >
      {/* Rank */}
      <div
        className={`${styles.rank} ${
          entry.rank <= 3 ? styles.rankTop3 : styles.rankOther
        }`}
      >
        {getRankDisplay(entry.rank)}
      </div>

      {/* Avatar */}
      <div>
        {entry.avatar_url ? (
          <img
            src={entry.avatar_url}
            alt={entry.username || t('leaderboard.anonymousUser')}
            className={styles.avatarImg}
          />
        ) : (
          <div className={styles.avatar}>
            {getUserInitials(entry.username)}
          </div>
        )}
      </div>

      {/* User Info */}
      <div className={styles.info}>
        <div
          className={
            entry.username ? styles.username : styles.anonymous
          }
        >
          {entry.username ? `@${entry.username}` : t('leaderboard.anonymousUser')}
        </div>
        {isCurrentUser && (
          <div className="text-xs text-[var(--mvx-text-accent-color)]">
            {t('leaderboard.you')}
          </div>
        )}
      </div>

      {/* Points */}
      <div className={styles.points}>
        <div className={styles.pointsValue}>
          {entry.points.toLocaleString()}
        </div>
        <div className={styles.pointsLabel}>{t('common.points')}</div>
      </div>
    </div>
  );
};

