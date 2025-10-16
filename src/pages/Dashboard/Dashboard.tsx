import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useGetAccount } from 'lib';
import { StatsCard } from 'components/shared/StatsCard';
import { Button } from 'components/Button';

// prettier-ignore
const styles = {
  container: 'container max-w-7xl mx-auto px-4 sm:px-6',
  
  header: 'header mb-6 sm:mb-8',
  welcomeTitle: 'welcome-title text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2',
  welcomeSubtitle: 'welcome-subtitle text-base sm:text-lg text-secondary',
  
  statsGrid: 'stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12',
  
  quickActionsSection: 'quick-actions-section mb-8 sm:mb-12',
  sectionTitle: 'section-title text-xl sm:text-2xl font-bold text-primary mb-4 sm:mb-6',
  
  quickActionsGrid: 'quick-actions-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6',
  quickActionCard: 'quick-action-card bg-secondary rounded-2xl p-4 sm:p-6 border border-[var(--mvx-border-color-secondary)] hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer',
  quickActionIcon: 'quick-action-icon text-3xl sm:text-4xl mb-2 sm:mb-3',
  quickActionTitle: 'quick-action-title text-lg sm:text-xl font-bold text-primary mb-2',
  quickActionDescription: 'quick-action-description text-xs sm:text-sm text-secondary mb-4',
  
  activitySection: 'activity-section',
  activityPlaceholder: 'activity-placeholder bg-secondary rounded-2xl p-6 sm:p-8 border border-[var(--mvx-border-color-secondary)] text-center',
  activityPlaceholderText: 'text-secondary text-sm sm:text-base'
} satisfies Record<string, string>;

export const Dashboard = () => {
  const navigate = useNavigate();
  const { address } = useGetAccount();
  const { t } = useTranslation();
  
  // TODO: Replace with actual data from API/context
  const userData = {
    username: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Guest',
    totalPoints: 1250,
    currentStreak: 5,
    nftCount: 8,
    globalRank: 142
  };

  const quickActions = [
    {
      icon: '⚽',
      titleKey: 'dashboard.quickActions.activePredictions.title',
      descriptionKey: 'dashboard.quickActions.activePredictions.description',
      action: () => navigate('/predictions')
    },
    {
      icon: '🔥',
      titleKey: 'dashboard.quickActions.dailyReward.title',
      descriptionKey: 'dashboard.quickActions.dailyReward.description',
      action: () => navigate('/streaks')
    },
    {
      icon: '⚔️',
      titleKey: 'dashboard.quickActions.createWarGame.title',
      descriptionKey: 'dashboard.quickActions.createWarGame.description',
      action: () => navigate('/war-games')
    }
  ];

  return (
    <div className={styles.container}>
      {/* Welcome Header */}
      <div className={styles.header}>
        <h1 className={styles.welcomeTitle}>
          {t('dashboard.welcome', { username: userData.username })} 👋
        </h1>
        <p className={styles.welcomeSubtitle}>
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <StatsCard
          icon="⭐"
          label={t('dashboard.stats.totalPoints')}
          value={userData.totalPoints.toLocaleString()}
          change={{ value: t('dashboard.stats.todayChange', { value: '120' }), positive: true }}
          variant="gold"
        />
        
        <StatsCard
          icon="🔥"
          label={t('dashboard.stats.currentStreak')}
          value={`${userData.currentStreak} ${t('dashboard.stats.days')}`}
          change={{ value: t('dashboard.stats.dayChange', { value: '1' }), positive: true }}
          variant="accent"
        />
        
        <StatsCard
          icon="🖼️"
          label={t('dashboard.stats.myNFTs')}
          value={userData.nftCount}
          variant="default"
        />
        
        <StatsCard
          icon="🏆"
          label={t('dashboard.stats.globalRank')}
          value={`#${userData.globalRank}`}
          change={{ value: t('dashboard.stats.positionChange', { value: '5' }), positive: true }}
          variant="default"
        />
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActionsSection}>
        <h2 className={styles.sectionTitle}>{t('dashboard.quickActions.title')}</h2>
        
        <div className={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <div
              key={action.titleKey}
              className={styles.quickActionCard}
              onClick={action.action}
            >
              <div className={styles.quickActionIcon}>{action.icon}</div>
              <h3 className={styles.quickActionTitle}>{t(action.titleKey)}</h3>
              <p className={styles.quickActionDescription}>{t(action.descriptionKey)}</p>
              <Button variant="secondary">{t('dashboard.quickActions.activePredictions.action')}</Button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.activitySection}>
        <h2 className={styles.sectionTitle}>{t('dashboard.recentActivity.title')}</h2>
        
        <div className={styles.activityPlaceholder}>
          <p className={styles.activityPlaceholderText}>
            📊 {t('dashboard.recentActivity.noActivity')}
          </p>
        </div>
      </div>
    </div>
  );
};
