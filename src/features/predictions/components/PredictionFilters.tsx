import { useTranslation } from 'react-i18next';
import type { BetType, BetCalculationType, PredictionStatus } from '../types';

interface PredictionFiltersProps {
  // Filter values
  betTypes: BetType[];
  calculationType: BetCalculationType | 'all';
  competitions: string[];
  statuses: PredictionStatus[];
  // Available options
  availableCompetitions: string[];
  availableBetTypes: BetType[];
  // Actions
  toggleBetType: (betType: BetType) => void;
  setCalculationType: (type: BetCalculationType | 'all') => void;
  toggleCompetition: (competition: string) => void;
  toggleStatus: (status: PredictionStatus) => void;
  clearFilters: () => void;
  // State
  hasActiveFilters: boolean;
  totalResults: number;
}

export const PredictionFilters = ({
  betTypes,
  calculationType,
  competitions,
  statuses,
  availableCompetitions,
  availableBetTypes,
  toggleBetType,
  setCalculationType,
  toggleCompetition,
  toggleStatus,
  clearFilters,
  hasActiveFilters,
  totalResults
}: PredictionFiltersProps) => {
  const { t } = useTranslation();

  const betTypeLabels: Record<BetType, string> = {
    result: t('predictions.betTypes.result', { defaultValue: 'Match Result' }),
    over_under: t('predictions.betTypes.over_under', { defaultValue: 'Over/Under' }),
    scorer: t('predictions.betTypes.scorer', { defaultValue: 'First Scorer' }),
    both_teams_score: t('predictions.betTypes.both_teams_score', { defaultValue: 'Both Teams Score' })
  };

  const betTypeIcons: Record<BetType, string> = {
    result: '⚽',
    over_under: '🎯',
    scorer: '⭐',
    both_teams_score: '🔥'
  };

  const statusLabels: Record<PredictionStatus, string> = {
    open: t('predictions.status.open', { defaultValue: 'Open' }),
    closed: t('predictions.status.closed', { defaultValue: 'Closed' }),
    resulted: t('predictions.status.resulted', { defaultValue: 'Resulted' }),
    cancelled: t('predictions.status.cancelled', { defaultValue: 'Cancelled' })
  };

  return (
    <div className="bg-[var(--mvx-bg-color-secondary)] rounded-xl p-3 border border-[var(--mvx-border-color-secondary)] mb-4">
      {/* Header - Compact */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--mvx-text-color-primary)]">
          {t('predictions.filters.title', { defaultValue: 'Filters' })}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-[var(--mvx-text-accent-color)] hover:text-[var(--mvx-text-color-primary)] transition-colors"
          >
            {t('predictions.filters.clearAll', { defaultValue: 'Clear All' })}
          </button>
        )}
      </div>

      {/* Filters Grid - Compact */}
      <div className="space-y-3">
        {/* Calculation Type */}
        <div>
          <label className="text-xs font-medium text-[var(--mvx-text-color-secondary)] mb-1 block">
            {t('predictions.filters.calculation', { defaultValue: 'Calculation Type' })}
          </label>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setCalculationType('all')}
              className={`px-2 py-1 text-xs font-semibold rounded-full border transition-colors ${
                calculationType === 'all'
                  ? 'bg-[var(--mvx-text-accent-color)] text-white border-[var(--mvx-text-accent-color)]'
                  : 'bg-[var(--mvx-bg-color-primary)] text-[var(--mvx-text-color-primary)] border-[var(--mvx-border-color-secondary)] hover:border-[var(--mvx-text-accent-color)]/50'
              }`}
            >
              {t('common.all', { defaultValue: 'All' })}
            </button>
            <button
              onClick={() => setCalculationType('fixed_odds')}
              className={`px-2 py-1 text-xs font-semibold rounded-full border transition-colors ${
                calculationType === 'fixed_odds'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-[var(--mvx-bg-color-primary)] text-[var(--mvx-text-color-primary)] border-[var(--mvx-border-color-secondary)] hover:border-blue-500/30'
              }`}
            >
              🎯 {t('predictions.calculationTypes.fixedOdds', { defaultValue: 'Fixed Odds' })}
            </button>
            <button
              onClick={() => setCalculationType('pool_ratio')}
              className={`px-2 py-1 text-xs font-semibold rounded-full border transition-colors ${
                calculationType === 'pool_ratio'
                  ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                  : 'bg-[var(--mvx-bg-color-primary)] text-[var(--mvx-text-color-primary)] border-[var(--mvx-border-color-secondary)] hover:border-violet-500/30'
              }`}
            >
              📊 {t('predictions.calculationTypes.poolRatio', { defaultValue: 'Pool Ratio' })}
            </button>
          </div>
        </div>

        {/* Bet Type */}
        {availableBetTypes.length > 0 && (
          <div>
            <label className="text-xs font-medium text-[var(--mvx-text-color-secondary)] mb-1 block">
              {t('predictions.filters.betType', { defaultValue: 'Bet Type' })}
            </label>
            <div className="flex flex-wrap gap-1">
              {availableBetTypes.map(betType => (
                <button
                  key={betType}
                  onClick={() => toggleBetType(betType)}
                  className={`px-2 py-1 text-xs font-semibold rounded-full border transition-colors ${
                    betTypes.includes(betType)
                      ? 'bg-[var(--mvx-text-accent-color)] text-white border-[var(--mvx-text-accent-color)]'
                      : 'bg-[var(--mvx-bg-color-primary)] text-[var(--mvx-text-color-primary)] border-[var(--mvx-border-color-secondary)] hover:border-[var(--mvx-text-accent-color)]/50'
                  }`}
                >
                  {betTypeIcons[betType]} {betTypeLabels[betType]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Competitions */}
        {availableCompetitions.length > 1 && (
          <div>
            <label className="text-xs font-medium text-[var(--mvx-text-color-secondary)] mb-1 block">
              {t('predictions.filters.competition', { defaultValue: 'Competition' })}
            </label>
            <div className="flex flex-wrap gap-1">
              {availableCompetitions.map(competition => (
                <button
                  key={competition}
                  onClick={() => toggleCompetition(competition)}
                  className={`px-2 py-1 text-xs font-semibold rounded-full border transition-colors ${
                    competitions.includes(competition)
                      ? 'bg-[var(--mvx-text-accent-color)] text-white border-[var(--mvx-text-accent-color)]'
                      : 'bg-[var(--mvx-bg-color-primary)] text-[var(--mvx-text-color-primary)] border-[var(--mvx-border-color-secondary)] hover:border-[var(--mvx-text-accent-color)]/50'
                  }`}
                >
                  🏆 {competition}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div>
          <label className="text-xs font-medium text-[var(--mvx-text-color-secondary)] mb-1 block">
            {t('predictions.filters.status', { defaultValue: 'Status' })}
          </label>
          <div className="flex flex-wrap gap-1">
            {(['open', 'closed', 'resulted', 'cancelled'] as PredictionStatus[]).map(status => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`px-2 py-1 text-xs font-semibold rounded-full border transition-colors ${
                  statuses.includes(status)
                    ? 'bg-[var(--mvx-text-accent-color)] text-white border-[var(--mvx-text-accent-color)]'
                    : 'bg-[var(--mvx-bg-color-primary)] text-[var(--mvx-text-color-primary)] border-[var(--mvx-border-color-secondary)] hover:border-[var(--mvx-text-accent-color)]/50'
                }`}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count - Compact */}
      <div className="mt-3 pt-3 border-t border-[var(--mvx-border-color-secondary)]">
        <p className="text-xs text-[var(--mvx-text-color-secondary)] text-center">
          {t('predictions.filters.results', { count: totalResults, defaultValue: `${totalResults} result(s)` })}
        </p>
      </div>
    </div>
  );
};

