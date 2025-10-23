import React from 'react';
import { useDashboardStats, formatRank, getRankInfo } from 'features/leaderboard';

/**
 * Dashboard Stats Component
 * Displays user's complete dashboard statistics including all ranks with total users
 */
export const DashboardStats: React.FC = () => {
  const { stats, loading, error, refresh } = useDashboardStats();

  if (loading) {
    return (
      <div className="dashboard-stats loading">
        <div className="loading-spinner">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-stats error">
        <p>Erreur lors du chargement des statistiques</p>
        <button onClick={refresh}>Réessayer</button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-stats no-data">
        <p>Aucune donnée disponible</p>
        <button onClick={refresh}>Actualiser</button>
      </div>
    );
  }

  const globalRank = getRankInfo(stats, 'global');
  const weeklyRank = getRankInfo(stats, 'weekly');
  const monthlyRank = getRankInfo(stats, 'monthly');

  return (
    <div className="dashboard-stats">
      {/* User Info */}
      <div className="user-info">
        <h2 className="username">{stats.username || 'Utilisateur'}</h2>
        <p className="wallet-address">{stats.walletAddress}</p>
        <p className="total-points">{stats.totalPoints} points</p>
      </div>

      {/* Rankings */}
      <div className="rankings">
        <div className="rank-card global">
          <div className="rank-header">
            <h3>Classement Global</h3>
            <span className="rank-badge">Tout Temps</span>
          </div>
          <div className="rank-value">
            <span className="rank-number">{globalRank.formatted}</span>
            <span className="rank-details">
              {globalRank.rank > 0 && globalRank.total > 0 && (
                <span>sur {globalRank.total} joueurs</span>
              )}
            </span>
          </div>
        </div>

        <div className="rank-card weekly">
          <div className="rank-header">
            <h3>Cette Semaine</h3>
            <span className="rank-badge">7 jours</span>
          </div>
          <div className="rank-value">
            <span className="rank-number">{weeklyRank.formatted}</span>
            <span className="rank-details">
              {weeklyRank.rank > 0 && weeklyRank.total > 0 && (
                <span>sur {weeklyRank.total} joueurs</span>
              )}
            </span>
          </div>
        </div>

        <div className="rank-card monthly">
          <div className="rank-header">
            <h3>Ce Mois</h3>
            <span className="rank-badge">30 jours</span>
          </div>
          <div className="rank-value">
            <span className="rank-number">{monthlyRank.formatted}</span>
            <span className="rank-details">
              {monthlyRank.rank > 0 && monthlyRank.total > 0 && (
                <span>sur {monthlyRank.total} joueurs</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="actions">
        <button onClick={refresh} className="refresh-btn">
          Actualiser les données
        </button>
      </div>
    </div>
  );
};

/**
 * Compact Dashboard Stats Component
 * Smaller version for sidebar or header display
 */
export const CompactDashboardStats: React.FC = () => {
  const { stats, loading } = useDashboardStats();

  if (loading || !stats) {
    return (
      <div className="compact-dashboard-stats">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  const globalRank = getRankInfo(stats, 'global');
  const weeklyRank = getRankInfo(stats, 'weekly');

  return (
    <div className="compact-dashboard-stats">
      <div className="user-summary">
        <span className="username">{stats.username}</span>
        <span className="points">{stats.totalPoints} pts</span>
      </div>
      
      <div className="ranks-summary">
        <div className="rank-item">
          <span className="label">Global:</span>
          <span className="value">{globalRank.formatted}</span>
        </div>
        <div className="rank-item">
          <span className="label">Semaine:</span>
          <span className="value">{weeklyRank.formatted}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
