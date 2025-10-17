import { useTranslation } from 'react-i18next';
import type { DayClaimState } from '../types';
import { ClaimStatus } from '../types';

interface WeekCalendarProps {
  daysState: DayClaimState[];
}

const styles = {
  container: 'w-full max-w-4xl mx-auto',
  title: 'text-xl font-semibold mb-4 text-[var(--mvx-text-color-primary)]',
  grid: 'grid grid-cols-7 gap-2 md:gap-4',
  dayCard: 'flex flex-col items-center justify-center p-3 md:p-4 rounded-lg transition-all duration-300',
  dayCardClaimed: 'bg-green-500/20 border-2 border-green-500',
  dayCardAvailable: 'bg-[var(--mvx-text-accent-color)] border-2 border-[var(--mvx-text-accent-color)] animate-pulse',
  dayCardMissed: 'bg-red-500/20 border-2 border-red-500/50',
  dayCardLocked: 'bg-[var(--mvx-bg-color-secondary)] border-2 border-[var(--mvx-border-color-secondary)]',
  dayName: 'text-xs md:text-sm font-medium mb-2 text-[var(--mvx-text-color-secondary)]',
  dayIcon: 'text-2xl md:text-3xl mb-2',
  dayIconClaimed: 'text-2xl md:text-3xl mb-2 text-white',
  dayIconAvailable: 'text-2xl md:text-3xl mb-2 text-white',
  dayIconMissed: 'text-2xl md:text-3xl mb-2 text-white',
  dayIconLocked: 'text-2xl md:text-3xl mb-2 text-[var(--mvx-text-color-secondary)]',
  dayPoints: 'text-xs md:text-sm font-bold text-white'
} satisfies Record<string, string>;

const getStatusIcon = (status: ClaimStatus): string => {
  switch (status) {
    case ClaimStatus.CLAIMED:
      return '✅';
    case ClaimStatus.AVAILABLE:
      return '🔥';
    case ClaimStatus.MISSED:
      return '❌';
    case ClaimStatus.LOCKED:
      return '🔒';
    default:
      return '⚪';
  }
};

const getDayCardClass = (status: ClaimStatus): string => {
  switch (status) {
    case ClaimStatus.CLAIMED:
      return `${styles.dayCard} ${styles.dayCardClaimed}`;
    case ClaimStatus.AVAILABLE:
      return `${styles.dayCard} ${styles.dayCardAvailable}`;
    case ClaimStatus.MISSED:
      return `${styles.dayCard} ${styles.dayCardMissed}`;
    case ClaimStatus.LOCKED:
      return `${styles.dayCard} ${styles.dayCardLocked}`;
    default:
      return styles.dayCard;
  }
};

const getDayIconClass = (status: ClaimStatus): string => {
  switch (status) {
    case ClaimStatus.CLAIMED:
      return styles.dayIconClaimed;
    case ClaimStatus.AVAILABLE:
      return styles.dayIconAvailable;
    case ClaimStatus.MISSED:
      return styles.dayIconMissed;
    case ClaimStatus.LOCKED:
      return styles.dayIconLocked;
    default:
      return styles.dayIcon;
  }
};

export const WeekCalendar = ({ daysState }: WeekCalendarProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{t('pages.streaks.weekCalendar.title')}</h3>
      
      <div className={styles.grid}>
        {daysState.map((dayState) => (
          <div
            key={dayState.day}
            className={getDayCardClass(dayState.status)}
          >
            <div className={styles.dayName}>
              {t(`pages.streaks.weekCalendar.${dayState.day}`)}
            </div>
            
            <div className={getDayIconClass(dayState.status)}>
              {getStatusIcon(dayState.status)}
            </div>
            
            {dayState.points > 0 && (
              <div className={styles.dayPoints}>
                {dayState.claimed
                  ? `+${dayState.points}`
                  : `${dayState.points}pts`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

