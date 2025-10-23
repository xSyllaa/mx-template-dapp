import { useTranslation } from 'react-i18next';
import type { BetCalculationType, PredictionStatus } from '../types';

interface PredictionFiltersProps {
  // Filter values
  betTypes: string[]; // Changed to string[] to support extended_bet_type
  calculationType: BetCalculationType | 'all';
  competitions: string[];
  statuses: PredictionStatus[];
  // Available options
  availableCompetitions: string[];
  availableBetTypes: string[]; // Changed to string[] to support extended_bet_type
  // Actions
  toggleBetType: (betType: string) => void;
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

  // Helper function to get bet type display info
  const getBetTypeInfo = (betType: string) => {
    // Map extended bet types to display names and icons
    const betTypeMap: Record<string, { label: string; icon: string }> = {
      // Match Result Bets
      '1x2': { label: '1X2 (Full-Time Result)', icon: '⚽' },
      'double-chance': { label: 'Double Chance', icon: '🔄' },
      'draw-no-bet': { label: 'Draw No Bet', icon: '❌' },
      'win-to-nil': { label: 'To Win to Nil', icon: '🛡️' },
      'clean-sheet': { label: 'Clean Sheet', icon: '🧤' },
      
      // Goals Markets
      'over-under-goals': { label: 'Over/Under Total Goals', icon: '🎯' },
      'both-teams-score': { label: 'Both Teams to Score', icon: '🔥' },
      'correct-score': { label: 'Correct Score', icon: '🎯' },
      'team-total-goals': { label: 'Team Total Goals', icon: '⚽' },
      'first-team-score': { label: 'First Team to Score', icon: '🥇' },
      'last-team-score': { label: 'Last Team to Score', icon: '🏁' },
      'no-goalscorer': { label: 'No Goalscorer', icon: '❌' },
      'exact-total-goals': { label: 'Exact Total Goals', icon: '🎯' },
      'multi-goal-range': { label: 'Multi-Goal Range', icon: '📊' },
      'goal-interval': { label: 'Goal Interval', icon: '⏰' },
      'odd-even-goals': { label: 'Odd or Even Goals', icon: '🔢' },
      
      // Time-Based Bets
      'half-time-full-time': { label: 'Half-Time/Full-Time', icon: '⏱️' },
      'half-time-result': { label: 'Half-Time Result', icon: '⏰' },
      'second-half-result': { label: 'Second Half Result', icon: '🔄' },
      'first-half-goals': { label: 'First Half Goals', icon: '🥇' },
      'second-half-goals': { label: 'Second Half Goals', icon: '🥈' },
      'first-goal-timing': { label: 'First Goal Timing', icon: '⏰' },
      'goal-minute-intervals': { label: 'Goal Minute Intervals', icon: '📅' },
      
      // Player Bets
      'first-goalscorer': { label: 'First Goalscorer', icon: '⭐' },
      'anytime-goalscorer': { label: 'Anytime Goalscorer', icon: '🎯' },
      'last-goalscorer': { label: 'Last Goalscorer', icon: '🏁' },
      'score-2-or-more': { label: 'To Score 2+ Goals', icon: '⚽⚽' },
      'hat-trick': { label: 'To Score a Hat-trick', icon: '🎩' },
      'player-booked': { label: 'Player to Be Booked', icon: '🟨' },
      'player-assist': { label: 'Player to Assist', icon: '🎯' },
      'player-shots': { label: 'Player Shots', icon: '🎯' },
      'player-stats': { label: 'Player Stats', icon: '📊' },
      'first-substituted': { label: 'First Substituted', icon: '🔄' },
      
      // Cards & Bookings
      'total-cards': { label: 'Total Cards', icon: '🟨' },
      'team-cards': { label: 'Team Total Cards', icon: '🟨' },
      'first-card': { label: 'First Team to Receive Card', icon: '🥇' },
      'first-player-carded': { label: 'First Player Carded', icon: '🟨' },
      'red-card': { label: 'Red Card in Match', icon: '🟥' },
      'booking-points': { label: 'Total Booking Points', icon: '📊' },
      'player-booking-specials': { label: 'Player Booking Specials', icon: '🎯' },
      
      // Corners
      'total-corners': { label: 'Total Corners', icon: '📐' },
      'team-corners': { label: 'Team Total Corners', icon: '📐' },
      'first-corner': { label: 'First Team to Win Corner', icon: '🥇' },
      'most-corners': { label: 'Most Corners', icon: '📊' },
      'corner-race': { label: 'Corner Race', icon: '🏃' },
      'corner-intervals': { label: 'Corner Time Intervals', icon: '⏰' },
      'odd-even-corners': { label: 'Odd or Even Corners', icon: '🔢' },
      
      // Combination Bets
      'result-btts': { label: 'Result + BTTS', icon: '⚽🔥' },
      'win-over-goals': { label: 'Win + Over Goals', icon: '🏆🎯' },
      'scorecast': { label: 'Scorecast', icon: '⭐🎯' },
      'wincast': { label: 'Wincast', icon: '⭐🏆' },
      'bet-builder': { label: 'Bet Builder', icon: '🔧' },
      'same-game-multi': { label: 'Same Game Multi', icon: '🎯' },
      'accumulators': { label: 'Accumulators', icon: '📈' },
      
      // Specials
      'penalty-awarded': { label: 'Penalty Awarded', icon: '⚽' },
      'penalty-missed': { label: 'Penalty Missed', icon: '❌' },
      'own-goal': { label: 'Own Goal', icon: '😅' },
      'woodwork-hit': { label: 'Woodwork Hit', icon: '🪵' },
      'var-intervention': { label: 'VAR Intervention', icon: '📺' },
      'penalty-save': { label: 'Penalty Save', icon: '🧤' },
      'shirt-number': { label: 'Shirt Number', icon: '👕' },
      'manager-booking': { label: 'Manager Booking', icon: '👨‍💼' },
      
      // Outright Bets
      'league-winner': { label: 'League Winner', icon: '🏆' },
      'top-4-finish': { label: 'Top 4 Finish', icon: '🥇' },
      'relegation': { label: 'Relegation', icon: '⬇️' },
      'golden-boot': { label: 'Golden Boot', icon: '🥾' },
      'player-tournament': { label: 'Player of Tournament', icon: '⭐' },
      'reach-final': { label: 'To Reach Final', icon: '🏆' },
      'group-winner': { label: 'Group Winner', icon: '🥇' },
      'elimination-stage': { label: 'Stage of Elimination', icon: '🚪' },
      'top-assisting': { label: 'Top Assisting', icon: '🎯' },
      
      // Advanced Markets
      'team-offsides': { label: 'Team Offsides', icon: '🚫' },
      'team-fouls': { label: 'Team Fouls', icon: '⚠️' },
      'expected-goals': { label: 'Expected Goals', icon: '📊' },
      'set-piece-first': { label: 'First Set Piece', icon: '⚽' },
      'extra-time': { label: 'Extra Time', icon: '⏰' },
      'golden-goal': { label: 'Golden Goal', icon: '🥇' },
      'to-qualify': { label: 'To Qualify', icon: '✅' },
      'penalties-decided': { label: 'Penalties Decided', icon: '⚽' },
      
      // Legacy fallbacks
      'result': { label: 'Match Result', icon: '⚽' },
      'over_under': { label: 'Over/Under', icon: '🎯' },
      'scorer': { label: 'First Scorer', icon: '⭐' },
      'both_teams_score': { label: 'Both Teams Score', icon: '🔥' }
    };
    
    return betTypeMap[betType] || { label: betType, icon: '🎯' };
  };

  const statusLabels: Record<PredictionStatus, string> = {
    open: t('predictions.status.open', { defaultValue: 'Open' }),
    closed: t('predictions.status.closed', { defaultValue: 'Closed' }),
    resulted: t('predictions.status.resulted', { defaultValue: 'Resulted' }),
    cancelled: t('predictions.status.cancelled', { defaultValue: 'Cancelled' })
  };

  // Create filter sections with their content
  const filterSections = [
    {
      key: 'calculation',
      label: t('predictions.filters.calculation', { defaultValue: 'Calculation Type' }),
      content: (
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
      )
    },
    ...(availableBetTypes.length > 0 ? [{
      key: 'betType',
      label: t('predictions.filters.betType', { defaultValue: 'Bet Type' }),
      content: (
        <div className="flex flex-wrap gap-1">
          {availableBetTypes.map(betType => {
            const betTypeInfo = getBetTypeInfo(betType);
            return (
              <button
                key={betType}
                onClick={() => toggleBetType(betType)}
                className={`px-2 py-1 text-xs font-semibold rounded-full border transition-colors ${
                  betTypes.includes(betType)
                    ? 'bg-[var(--mvx-text-accent-color)] text-white border-[var(--mvx-text-accent-color)]'
                    : 'bg-[var(--mvx-bg-color-primary)] text-[var(--mvx-text-color-primary)] border-[var(--mvx-border-color-secondary)] hover:border-[var(--mvx-text-accent-color)]/50'
                }`}
                title={betTypeInfo.label}
              >
                {betTypeInfo.icon} {betTypeInfo.label}
              </button>
            );
          })}
        </div>
      )
    }] : []),
    ...(availableCompetitions.length > 1 ? [{
      key: 'competition',
      label: t('predictions.filters.competition', { defaultValue: 'Competition' }),
      content: (
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
      )
    }] : []),
    {
      key: 'status',
      label: t('predictions.filters.status', { defaultValue: 'Status' }),
      content: (
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
      )
    }
  ];

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

      {/* Flexible Filters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {filterSections.map((section) => (
          <div key={section.key} className="min-w-0">
            <label className="text-xs font-medium text-[var(--mvx-text-color-secondary)] mb-1 block">
              {section.label}
            </label>
            {section.content}
          </div>
        ))}
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

