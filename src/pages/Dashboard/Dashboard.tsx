import { useNavigate } from 'react-router-dom';

import { useGetAccount } from 'lib';
import { StatsCard } from 'components/shared/StatsCard';
import { Button } from 'components/Button';

// prettier-ignore
const styles = {
  container: 'container max-w-7xl mx-auto',
  
  header: 'header mb-8',
  welcomeTitle: 'welcome-title text-3xl md:text-4xl font-bold text-primary mb-2',
  welcomeSubtitle: 'welcome-subtitle text-lg text-secondary',
  
  statsGrid: 'stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12',
  
  quickActionsSection: 'quick-actions-section mb-12',
  sectionTitle: 'section-title text-2xl font-bold text-primary mb-6',
  
  quickActionsGrid: 'quick-actions-grid grid grid-cols-1 md:grid-cols-3 gap-6',
  quickActionCard: 'quick-action-card bg-secondary rounded-2xl p-6 border border-[var(--mvx-border-color-secondary)] hover:-translate-y-1 transition-all duration-300 cursor-pointer',
  quickActionIcon: 'quick-action-icon text-4xl mb-3',
  quickActionTitle: 'quick-action-title text-xl font-bold text-primary mb-2',
  quickActionDescription: 'quick-action-description text-sm text-secondary mb-4',
  
  activitySection: 'activity-section',
  activityPlaceholder: 'activity-placeholder bg-secondary rounded-2xl p-8 border border-[var(--mvx-border-color-secondary)] text-center',
  activityPlaceholderText: 'text-secondary'
} satisfies Record<string, string>;

export const Dashboard = () => {
  const navigate = useNavigate();
  const { address } = useGetAccount();
  
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
      title: 'Predictions actives',
      description: 'Consulte et participe aux predictions en cours',
      action: () => navigate('/predictions')
    },
    {
      icon: '🔥',
      title: 'Claim Daily Reward',
      description: 'Réclame ta récompense quotidienne',
      action: () => navigate('/streaks')
    },
    {
      icon: '⚔️',
      title: 'Créer un War Game',
      description: 'Challenge d\'autres joueurs avec tes NFTs',
      action: () => navigate('/war-games')
    }
  ];

  return (
    <div className={styles.container}>
      {/* Welcome Header */}
      <div className={styles.header}>
        <h1 className={styles.welcomeTitle}>
          Bienvenue, {userData.username} 👋
        </h1>
        <p className={styles.welcomeSubtitle}>
          Voici ton tableau de bord GalacticX
        </p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <StatsCard
          icon="⭐"
          label="Total Points"
          value={userData.totalPoints.toLocaleString()}
          change={{ value: '+120 aujourd\'hui', positive: true }}
          variant="gold"
        />
        
        <StatsCard
          icon="🔥"
          label="Current Streak"
          value={`${userData.currentStreak} jours`}
          change={{ value: '+1 jour', positive: true }}
          variant="accent"
        />
        
        <StatsCard
          icon="🖼️"
          label="Mes NFTs"
          value={userData.nftCount}
          variant="default"
        />
        
        <StatsCard
          icon="🏆"
          label="Classement Global"
          value={`#${userData.globalRank}`}
          change={{ value: '+5 positions', positive: true }}
          variant="default"
        />
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActionsSection}>
        <h2 className={styles.sectionTitle}>Actions Rapides</h2>
        
        <div className={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <div
              key={action.title}
              className={styles.quickActionCard}
              onClick={action.action}
            >
              <div className={styles.quickActionIcon}>{action.icon}</div>
              <h3 className={styles.quickActionTitle}>{action.title}</h3>
              <p className={styles.quickActionDescription}>{action.description}</p>
              <Button variant="secondary">Accéder</Button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.activitySection}>
        <h2 className={styles.sectionTitle}>Activité Récente</h2>
        
        <div className={styles.activityPlaceholder}>
          <p className={styles.activityPlaceholderText}>
            📊 Aucune activité récente pour le moment
          </p>
        </div>
      </div>
    </div>
  );
};
