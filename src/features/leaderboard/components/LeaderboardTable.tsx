import { useTranslation } from 'react-i18next';
import { LeaderboardEntry } from './LeaderboardEntry';
import type { LeaderboardEntry as LeaderboardEntryType } from '../types';

interface LeaderboardTableProps {
  entries: LeaderboardEntryType[];
  currentUserId: string | null;
  loading: boolean;
}

const styles = {
  container: 'space-y-2',
  podium: 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-8',
  podiumCard:
    'p-6 rounded-lg bg-gradient-to-br text-center relative overflow-hidden',
  podiumFirst:
    'from-yellow-500/20 to-yellow-600/20 md:col-span-3 md:order-1',
  podiumSecond: 'from-gray-400/20 to-gray-500/20 md:order-2',
  podiumThird: 'from-orange-600/20 to-orange-700/20 md:order-3',
  podiumCrown: 'text-6xl mb-2',
  podiumRank: 'text-sm text-[var(--mvx-text-color-secondary)] uppercase mb-2',
  podiumUsername: 'text-xl font-bold text-[var(--mvx-text-color-primary)] mb-1',
  podiumPoints: 'text-3xl font-bold text-[var(--mvx-text-accent-color)]',
  list: 'space-y-2 mt-8',
  listHeader: 'text-lg font-semibold text-[var(--mvx-text-color-primary)] mb-4',
  loading: 'text-center py-12',
  loadingText: 'text-[var(--mvx-text-color-secondary)]',
  empty: 'text-center py-12',
  emptyText: 'text-[var(--mvx-text-color-secondary)]'
} satisfies Record<string, string>;

export const LeaderboardTable = ({
  entries,
  currentUserId,
  loading
}: LeaderboardTableProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="animate-spin text-4xl mb-4">⚽</div>
        <p className={styles.loadingText}>{t('common.loading')}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>
          {t('leaderboard.noData')}
        </p>
      </div>
    );
  }

  const topThree = entries.slice(0, 3);
  const restOfList = entries.slice(3);

  return (
    <div className={styles.container}>
      {/* Podium - Top 3 */}
      {topThree.length > 0 && (
        <div className={styles.podium}>
          {topThree.map((entry, index) => {
            const cardStyle =
              index === 0
                ? styles.podiumFirst
                : index === 1
                  ? styles.podiumSecond
                  : styles.podiumThird;
            const crown = index === 0 ? '👑' : index === 1 ? '🥈' : '🥉';

            return (
              <div key={entry.user_id} className={`${styles.podiumCard} ${cardStyle}`}>
                <div className={styles.podiumCrown}>{crown}</div>
                <div className={styles.podiumRank}>
                  {t('leaderboard.rankPosition', { rank: entry.rank })}
                </div>
                <div className={styles.podiumUsername}>
                  {entry.username || t('leaderboard.anonymousUser')}
                </div>
                <div className={styles.podiumPoints}>
                  {entry.points.toLocaleString()}
                  <span className="text-sm ml-2 text-[var(--mvx-text-color-secondary)]">
                    {t('common.points')}
                  </span>
                </div>
                {entry.user_id === currentUserId && (
                  <div className="absolute top-2 right-2 bg-[var(--mvx-text-accent-color)] text-white text-xs px-2 py-1 rounded">
                    {t('leaderboard.you')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rest of the list */}
      {restOfList.length > 0 && (
        <div className={styles.list}>
          <h3 className={styles.listHeader}>
            {t('leaderboard.rankings')}
          </h3>
          {restOfList.map((entry) => (
            <LeaderboardEntry
              key={entry.user_id}
              entry={entry}
              isCurrentUser={entry.user_id === currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

