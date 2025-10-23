import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PredictionStats, PredictionOption, BetCalculationType } from '../types';

interface PredictionStatsDisplayProps {
  stats: PredictionStats | null;
  options: PredictionOption[];
  calculationType: BetCalculationType;
  loading?: boolean;
}

export const PredictionStatsDisplay = ({
  stats,
  options,
  calculationType,
  loading = false
}: PredictionStatsDisplayProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const showOdds = calculationType === 'fixed_odds';

  if (loading) {
    return (
      <div className="p-6 bg-[var(--mvx-bg-color-secondary)] rounded-xl border border-[var(--mvx-border-color-secondary)]">
        <div className="animate-pulse">
          <div className="h-4 bg-[var(--mvx-bg-accent-color)] rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-[var(--mvx-bg-accent-color)] rounded"></div>
            <div className="h-20 bg-[var(--mvx-bg-accent-color)] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats || stats.total_participants === 0) {
    return (
      <div className="p-4 bg-[var(--mvx-bg-color-secondary)] rounded-xl border border-[var(--mvx-border-color-secondary)]">
        <p className="text-center text-[var(--mvx-text-color-secondary)] text-sm">
          {t('predictions.stats.noBetsYet', { defaultValue: 'No bets placed yet. Be the first!' })}
        </p>
      </div>
    );
  }

  // Collapsed version (compact)
  if (!isExpanded) {
    return (
      <div className="p-4 bg-[var(--mvx-bg-color-secondary)] rounded-xl border border-[var(--mvx-border-color-secondary)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--mvx-text-color-primary)]">
              {t('predictions.stats.bettingPool', { defaultValue: 'Betting Pool' })}
            </span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[var(--mvx-text-accent-color)]">
              {stats?.total_pool?.toLocaleString() || '0'} pts
            </p>
            <p className="text-xs text-[var(--mvx-text-color-secondary)]">
              {stats?.total_participants || 0} {t('predictions.stats.participants', { defaultValue: 'participants' })}
            </p>
          </div>
        </div>

        {/* Compact Progress Bar */}
        <div className="mb-3">
          <div className="h-3 bg-[var(--mvx-bg-color-primary)] rounded-full overflow-hidden flex">
            {options.map((option, index) => {
              const optionStats = stats?.options?.find(s => s.option_id === option.id);
              const percentage = optionStats?.percentage || 0;
              
              // Colors for different options
              const colors = [
                'bg-blue-500',
                'bg-purple-500',
                'bg-green-500',
                'bg-orange-500'
              ];
              const color = colors[index % colors.length];

              return (
                <div
                  key={option.id}
                  className={`${color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                  title={`${option.label}: ${percentage.toFixed(1)}%`}
                />
              );
            })}
          </div>
        </div>

        {/* Option Labels */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {options.map((option, index) => {
            const optionStats = stats?.options?.find(s => s.option_id === option.id);
            const percentage = optionStats?.percentage || 0;
            
            const colors = [
              'text-blue-400',
              'text-purple-400',
              'text-green-400',
              'text-orange-400'
            ];
            const color = colors[index % colors.length];

            return (
              <div key={option.id} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${colors[index % colors.length].replace('text-', 'bg-')}`} />
                <span className="text-xs text-[var(--mvx-text-color-primary)] truncate">
                  {option.label}
                </span>
                <span className={`text-xs font-semibold ${color}`}>
                  {percentage.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full py-2 text-xs font-medium text-[var(--mvx-text-accent-color)] hover:text-[var(--mvx-text-color-primary)] transition-colors border-t border-[var(--mvx-border-color-secondary)] pt-3"
        >
          {t('predictions.stats.viewDetails', { defaultValue: 'View Details' })} ↓
        </button>
      </div>
    );
  }

  // Expanded version (detailed)
  return (
    <div className="p-4 bg-[var(--mvx-bg-color-secondary)] rounded-xl border border-[var(--mvx-border-color-secondary)] space-y-3">
      {/* Header with Bet Type Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--mvx-border-color-secondary)]">
        <div className="flex items-center gap-2">
          <h4 className="text-base font-semibold text-[var(--mvx-text-color-primary)]">
            {t('predictions.stats.bettingPool', { defaultValue: 'Betting Pool' })}
          </h4>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-[var(--mvx-text-accent-color)]">
            {stats?.total_pool?.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-[var(--mvx-text-color-secondary)]">
            {t('predictions.stats.totalWagered')}
          </p>
        </div>
      </div>

      {/* Options Stats */}
      <div className="space-y-3">
        {options.map((option) => {
          const optionStats = stats?.options?.find(
            (s) => s.option_id === option.id
          );

          if (!optionStats) {
            return (
              <div
                key={option.id}
                className="p-3 bg-[var(--mvx-bg-color-primary)] rounded-lg border border-[var(--mvx-border-color-secondary)] opacity-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[var(--mvx-text-color-primary)] text-sm">
                    {option.label}
                  </span>
                  <span className="text-sm text-[var(--mvx-text-color-secondary)]">
                    0%
                  </span>
                </div>
                <div className="h-2 bg-[var(--mvx-bg-color-secondary)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--mvx-text-accent-color)]" style={{ width: '0%' }} />
                </div>
                <p className="text-xs text-[var(--mvx-text-color-secondary)] mt-2">
                  {t('predictions.stats.noBets', { defaultValue: 'No bets' })}
                </p>
              </div>
            );
          }

          const percentage = optionStats.percentage;
          const accentColor = percentage > 50 ? 'var(--mvx-text-accent-color)' : '#888';

          return (
            <div
              key={option.id}
              className="p-3 bg-[var(--mvx-bg-color-primary)] rounded-lg border border-[var(--mvx-border-color-secondary)] hover:border-[var(--mvx-text-accent-color)]/50 transition-colors"
            >
              {/* Option Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[var(--mvx-text-color-primary)] text-sm">
                  {option.label}
                </span>
                <span className="text-base font-bold" style={{ color: accentColor }}>
                  {percentage.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-[var(--mvx-bg-color-secondary)] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: accentColor
                  }}
                />
              </div>

              {/* Stats Grid - 2 columns */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[var(--mvx-text-color-secondary)]">
                    {t('predictions.stats.totalWagered')}
                  </p>
                  <p className="text-[var(--mvx-text-color-primary)] font-semibold">
                    {optionStats.total_wagered.toLocaleString()} pts
                  </p>
                </div>
                {!showOdds && (
                  <div>
                    <p className="text-[var(--mvx-text-color-secondary)]">
                      Ratio
                    </p>
                    <p className="text-[var(--mvx-text-accent-color)] font-semibold">
                      {optionStats.ratio.toFixed(2)}x
                    </p>
                  </div>
                )}
                {showOdds && (
                  <div>
                    <p className="text-[var(--mvx-text-color-secondary)]">
                      Odds
                    </p>
                    <p className="text-[var(--mvx-text-accent-color)] font-semibold">
                      {option.odds}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[var(--mvx-text-color-secondary)]">
                    {t('predictions.stats.participants')}
                  </p>
                  <p className="text-[var(--mvx-text-accent-color)] font-semibold">
                    {optionStats.participant_count}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--mvx-text-color-secondary)]">
                    {t('predictions.stats.biggestBet')}
                  </p>
                  <p className="text-[var(--mvx-text-color-primary)] font-semibold">
                    {optionStats.biggest_bet.toLocaleString()} pts
                  </p>
                </div>
              </div>

              {/* Top Bettor */}
              {optionStats.top_bettor && (
                <div className="mt-2 pt-2 border-t border-[var(--mvx-border-color-secondary)]">
                  <p className="text-xs text-[var(--mvx-text-color-secondary)]">
                    {t('predictions.stats.topBettor')}:{' '}
                    <span className="text-[var(--mvx-text-accent-color)] font-semibold">
                      {optionStats.top_bettor}
                    </span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Participants */}
      <div className="pt-2 border-t border-[var(--mvx-border-color-secondary)] text-center">
        <p className="text-sm text-[var(--mvx-text-color-secondary)]">
          {t('predictions.stats.totalParticipants', { count: stats?.total_participants || 0 })}:{' '}
          <span className="text-[var(--mvx-text-color-primary)] font-semibold">
            {stats?.total_participants || 0}
          </span>
        </p>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setIsExpanded(false)}
        className="w-full py-2 text-xs font-medium text-[var(--mvx-text-accent-color)] hover:text-[var(--mvx-text-color-primary)] transition-colors border-t border-[var(--mvx-border-color-secondary)] pt-2"
      >
        {t('predictions.stats.hideDetails', { defaultValue: 'Hide Details' })} ↑
      </button>
    </div>
  );
};

