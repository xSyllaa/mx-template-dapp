import { useTranslation } from 'react-i18next';
import { useGetAccount } from 'lib';
import { useSupabaseAuth } from 'hooks/useSupabaseAuth';
import {
  WeekStats,
  WeekCalendar,
  ClaimButton,
  useWeeklyStreak
} from 'features/streaks';

// prettier-ignore
const styles = {
  container: 'container max-w-7xl mx-auto px-4 py-8',
  header: 'header mb-8 text-center',
  title: 'title text-4xl md:text-5xl font-bold text-[var(--mvx-text-color-primary)] mb-4',
  subtitle: 'subtitle text-lg text-[var(--mvx-text-color-secondary)]',
  content: 'space-y-8',
  authWarning: 'bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 text-center mb-8',
  authWarningText: 'text-white font-semibold',
  notConnected: 'text-center py-16',
  notConnectedTitle: 'text-2xl font-bold text-[var(--mvx-text-color-primary)] mb-4',
  notConnectedSubtitle: 'text-[var(--mvx-text-color-secondary)]',
  error: 'bg-red-500/20 border border-red-500 rounded-lg p-4 text-center',
  errorText: 'text-white',
  infoSection: 'bg-[var(--mvx-bg-color-secondary)] rounded-lg p-6 border border-[var(--mvx-border-color-secondary)] mt-8',
  infoTitle: 'text-lg font-semibold text-[var(--mvx-text-color-primary)] mb-4',
  infoList: 'space-y-2',
  infoItem: 'flex items-start gap-2 text-sm text-[var(--mvx-text-color-secondary)]',
  infoBullet: 'text-[var(--mvx-text-accent-color)] mt-1'
} satisfies Record<string, string>;

export const Streaks = () => {
  const { t } = useTranslation();
  const { address } = useGetAccount();
  const { isAuthenticated, loading: authLoading, error: authError } = useSupabaseAuth();
  
  const {
    weekStreak,
    loading,
    error,
    claimDay,
    stats,
    daysState,
    canClaimToday,
    todaysClaim
  } = useWeeklyStreak();

  // Show loading while authentication is in progress
  if (authLoading || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>🔥 {t('pages.streaks.title')}</h1>
          <p className={styles.subtitle}>{t('pages.streaks.subtitle')}</p>
        </div>
        <div className="text-center py-16">
          <p className="text-[var(--mvx-text-color-secondary)]">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Not connected to wallet
  if (!address) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>🔥 {t('pages.streaks.title')}</h1>
          <p className={styles.subtitle}>{t('pages.streaks.subtitle')}</p>
        </div>

        <div className={styles.notConnected}>
          <h2 className={styles.notConnectedTitle}>
            {t('pages.myNFTs.notConnected.title')}
          </h2>
          <p className={styles.notConnectedSubtitle}>
            {t('pages.myNFTs.notConnected.subtitle')}
          </p>
        </div>
      </div>
    );
  }

  // Show authentication warning if not authenticated
  const showAuthWarning = !isAuthenticated && address;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🔥 {t('pages.streaks.title')}</h1>
        <p className={styles.subtitle}>{t('pages.streaks.subtitle')}</p>
      </div>

      {/* Authentication Warning */}
      {showAuthWarning && (
        <div className={styles.authWarning}>
          <p className={styles.authWarningText}>
            {t('header.supabaseAuth.retry')}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.error}>
          <p className={styles.errorText}>{error.message}</p>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.content}>
        {/* Weekly Stats */}
        <WeekStats stats={stats} />

        {/* Week Calendar */}
        <WeekCalendar daysState={daysState} />

        {/* Claim Button */}
        <ClaimButton
          todaysClaim={todaysClaim}
          canClaimToday={canClaimToday}
          onClaim={claimDay}
          disabled={!isAuthenticated || loading}
        />

        {/* How it works */}
        <div className={styles.infoSection}>
          <h3 className={styles.infoTitle}>
            {t('pages.streaks.info.howItWorks')}
          </h3>
          <ul className={styles.infoList}>
            <li className={styles.infoItem}>
              <span className={styles.infoBullet}>•</span>
              <span>{t('pages.streaks.info.rule1')}</span>
            </li>
            <li className={styles.infoItem}>
              <span className={styles.infoBullet}>•</span>
              <span>{t('pages.streaks.info.rule2')}</span>
            </li>
            <li className={styles.infoItem}>
              <span className={styles.infoBullet}>•</span>
              <span>{t('pages.streaks.info.rule3')}</span>
            </li>
            <li className={styles.infoItem}>
              <span className={styles.infoBullet}>•</span>
              <span>{t('pages.streaks.info.rule4')}</span>
            </li>
            <li className={styles.infoItem}>
              <span className={styles.infoBullet}>•</span>
              <span>{t('pages.streaks.info.rule5')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

