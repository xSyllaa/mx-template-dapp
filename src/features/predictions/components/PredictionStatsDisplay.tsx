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
      <div className="p-6 bg-[var(--mvx-bg-color-secondary)] rounded-xl border border-[var(--mvx-border-color-secondary)]">
        <p className="text-center text-[var(--mvx-text-color-secondary)]">
          {t('predictions.stats.noBetsYet', { defaultValue: 'No bets placed yet. Be the first!' })}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[var(--mvx-bg-color-secondary)] rounded-xl border border-[var(--mvx-border-color-secondary)] space-y-4">
      {/* Header with Bet Type Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--mvx-border-color-secondary)]">
        <div className="flex items-center gap-3">
          <h4 className="text-lg font-semibold text-[var(--mvx-text-color-primary)]">
            {t('predictions.stats.bettingPool', { defaultValue: 'Betting Pool' })}
          </h4>
          {/* Bet Type Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            showOdds 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
              : 'bg-green-500/20 text-green-400 border border-green-500/30'
          }`}>
            {showOdds 
              ? `🎯 ${t('predictions.stats.betType.fixedOdds')}` 
              : `📊 ${t('predictions.stats.betType.poolRatio')}`
            }
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[var(--mvx-text-accent-color)]">
            {stats.total_pool.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--mvx-text-color-secondary)]">
            {t('predictions.stats.totalWagered')}
          </p>
        </div>
      </div>

      {/* Options Stats */}
      <div className="space-y-4">
        {options.map((option) => {
          const optionStats = stats.options.find(
            (s) => s.option_id === option.id
          );

          if (!optionStats) {
            return (
              <div
                key={option.id}
                className="p-4 bg-[var(--mvx-bg-color-primary)] rounded-lg border border-[var(--mvx-border-color-secondary)] opacity-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[var(--mvx-text-color-primary)]">
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
              className="p-4 bg-[var(--mvx-bg-color-primary)] rounded-lg border border-[var(--mvx-border-color-secondary)] hover:border-[var(--mvx-text-accent-color)]/50 transition-colors"
            >
              {/* Option Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[var(--mvx-text-color-primary)]">
                  {option.label}
                </span>
                <span className="text-lg font-bold" style={{ color: accentColor }}>
                  {percentage.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-[var(--mvx-bg-color-secondary)] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: accentColor
                  }}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[var(--mvx-text-color-secondary)] text-xs">
                    {t('predictions.stats.totalWagered')}
                  </p>
                  <p className="text-[var(--mvx-text-color-primary)] font-semibold">
                    {optionStats.total_wagered.toLocaleString()} pts
                  </p>
                </div>
                {!showOdds && (
                  <div>
                    <p className="text-[var(--mvx-text-color-secondary)] text-xs">
                      📊 {t('predictions.stats.betType.poolRatio')}
                    </p>
                    <p className="text-[var(--mvx-text-accent-color)] font-semibold">
                      {optionStats.ratio.toFixed(2)}x
                    </p>
                  </div>
                )}
                {showOdds && (
                  <div>
                    <p className="text-[var(--mvx-text-color-secondary)] text-xs">
                      🎯 {t('predictions.stats.betType.fixedOdds')}
                    </p>
                    <p className="text-[var(--mvx-text-accent-color)] font-semibold">
                      {option.odds}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[var(--mvx-text-color-secondary)] text-xs">
                    {t('predictions.stats.participants')}
                  </p>
                  <p className="text-[var(--mvx-text-accent-color)] font-semibold">
                    {optionStats.participant_count}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--mvx-text-color-secondary)] text-xs">
                    {t('predictions.stats.biggestBet')}
                  </p>
                  <p className="text-[var(--mvx-text-color-primary)] font-semibold">
                    {optionStats.biggest_bet.toLocaleString()} pts
                  </p>
                </div>
              </div>

              {/* Top Bettor */}
              {optionStats.top_bettor && (
                <div className="mt-3 pt-3 border-t border-[var(--mvx-border-color-secondary)]">
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
      <div className="pt-3 border-t border-[var(--mvx-border-color-secondary)] text-center">
        <p className="text-sm text-[var(--mvx-text-color-secondary)]">
          {t('predictions.stats.totalParticipants', { count: stats.total_participants })}:{' '}
          <span className="text-[var(--mvx-text-color-primary)] font-semibold">
            {stats.total_participants}
          </span>
        </p>
      </div>
    </div>
  );
};

