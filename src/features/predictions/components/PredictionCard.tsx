import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAccount } from 'lib';
import { useAuth } from 'contexts/AuthContext';
import { useToast } from 'hooks/useToast';
import type { Prediction } from '../types';
import { useUserPrediction } from '../hooks/useUserPrediction';
import { useUserPoints } from '../hooks/useUserPoints';
import { usePredictionStats } from '../hooks/usePredictionStats';
import { ParticipationBadge } from './ParticipationBadge';
import { BetAmountInput } from './BetAmountInput';
import { PredictionStatsDisplay } from './PredictionStatsDisplay';
import { BetTypeBadge } from './BetTypeBadge';
import { CalculationTypeBadge } from './CalculationTypeBadge';

interface PredictionCardProps {
  prediction: Prediction;
  onSubmitSuccess?: () => void;
}

export const PredictionCard = ({
  prediction,
  onSubmitSuccess
}: PredictionCardProps) => {
  const { t } = useTranslation();
  const { address } = useGetAccount();
  const { supabaseUserId } = useAuth();
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(prediction.min_bet_points);

  // Get user's existing prediction (use Supabase UUID, not wallet address)
  const { userPrediction, hasParticipated, submitting, submit } =
    useUserPrediction(prediction.id, supabaseUserId || null);

  // Get user's point balance
  const { points: userPoints, loading: pointsLoading } = useUserPoints(
    supabaseUserId || null
  );

  // Get prediction stats
  const { stats, loading: statsLoading } = usePredictionStats(prediction.id);

  // Format dates
  const startDate = new Date(prediction.start_date);
  const closeDate = new Date(prediction.close_date);
  const isOpen = prediction.status === 'open';
  const isResulted = prediction.status === 'resulted';


  // Handle option selection
  const handleSelectOption = (optionId: string) => {
    if (hasParticipated || !isOpen) return;
    setSelectedOption(optionId);
  };

  // Handle submission
  const handleSubmit = async () => {
    if (!selectedOption || !supabaseUserId) {
      console.warn('[PredictionCard] Cannot submit:', {
        selectedOption,
        supabaseUserId,
        address
      });
      toast.error(t('toasts.predictions.error'), t('toasts.predictions.errorMessage'));
      return;
    }

    // Validate bet amount
    if (betAmount < prediction.min_bet_points) {
      toast.error(t('toasts.predictions.invalidAmount'), t('toasts.predictions.minBetMessage', { min: prediction.min_bet_points }));
      return;
    }

    if (betAmount > prediction.max_bet_points) {
      toast.error(t('toasts.predictions.invalidAmount'), t('toasts.predictions.maxBetMessage', { max: prediction.max_bet_points }));
      return;
    }

    if (betAmount > userPoints) {
      toast.error(t('toasts.predictions.insufficientPoints'), t('toasts.predictions.insufficientPointsMessage'));
      return;
    }

    try {
      await submit(selectedOption, betAmount);
      setSelectedOption(null);
      setBetAmount(prediction.min_bet_points);
      
      // Show success toast
      const selectedOptionLabel = prediction.options.find(opt => opt.id === selectedOption)?.label;
      toast.success(
        t('toasts.predictions.betPlaced'),
        t('toasts.predictions.betPlacedMessage', {
          homeTeam: prediction.home_team,
          awayTeam: prediction.away_team,
          option: selectedOptionLabel,
          amount: betAmount
        })
      );
      
      onSubmitSuccess?.();
    } catch (error) {
      console.error('Error submitting prediction:', error);
      toast.error(t('toasts.predictions.betFailed'), t('toasts.predictions.betFailedMessage'));
    }
  };

  // Check if submit button should be disabled
  const canSubmit = 
    selectedOption && 
    address && 
    supabaseUserId && 
    betAmount >= prediction.min_bet_points &&
    betAmount <= prediction.max_bet_points &&
    betAmount <= userPoints &&
    !submitting;

  // Get error message for disabled submit button
  const getSubmitError = (): string | null => {
    if (!selectedOption) return null;
    if (!address || !supabaseUserId) return 'Connectez votre portefeuille';
    if (betAmount < prediction.min_bet_points) return `Mise min: ${prediction.min_bet_points} pts`;
    if (betAmount > prediction.max_bet_points) return `Mise max: ${prediction.max_bet_points} pts`;
    if (betAmount > userPoints) return 'Points insuffisants';
    return null;
  };

  // Get the selected/correct option for display
  const getOptionClass = (optionId: string) => {
    const baseClass =
      'flex items-center justify-between p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer w-full';

    // If prediction is resulted, highlight winning option
    if (isResulted && prediction.winning_option_id === optionId) {
      return `${baseClass} bg-green-500/20 border-green-500 text-[var(--mvx-text-color-primary)]`;
    }

    // If user participated, show their selection
    if (hasParticipated && userPrediction?.selected_option_id === optionId) {
      const isCorrect = userPrediction.is_correct;
      if (isCorrect === true) {
        return `${baseClass} bg-green-500/10 border-green-500/50 text-[var(--mvx-text-color-primary)]`;
      } else if (isCorrect === false) {
        return `${baseClass} bg-red-500/10 border-red-500/50 text-[var(--mvx-text-color-primary)]`;
      }
      return `${baseClass} bg-blue-500/10 border-blue-500/50 text-[var(--mvx-text-color-primary)]`;
    }

    // If currently selected (before submission)
    if (selectedOption === optionId && isOpen) {
      return `${baseClass} bg-[var(--mvx-text-accent-color)]/20 border-[var(--mvx-text-accent-color)] text-[var(--mvx-text-color-primary)]`;
    }

    // Default state
    if (isOpen && !hasParticipated) {
      return `${baseClass} bg-[var(--mvx-bg-color-secondary)] border-[var(--mvx-border-color-secondary)] text-[var(--mvx-text-color-primary)] hover:border-[var(--mvx-text-accent-color)]/50`;
    }

    // Disabled state
    return `${baseClass} bg-[var(--mvx-bg-color-secondary)] border-[var(--mvx-border-color-secondary)] text-[var(--mvx-text-color-secondary)] opacity-60 cursor-not-allowed`;
  };

  // Get border color based on status
  const getBorderColor = () => {
    if (prediction.status === 'closed') {
      return 'border-orange-500/50'; // Orange border for closed predictions
    }
    return 'border-[var(--mvx-border-color-secondary)]'; // Default border
  };

  return (
    <div className={`bg-[var(--mvx-bg-color-secondary)] rounded-xl p-4 sm:p-6 border ${getBorderColor()}`}>
      {/* Header avec badges de type de bet */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div className="flex flex-wrap gap-2">
          <CalculationTypeBadge 
            calculationType={prediction.bet_calculation_type} 
            size="lg"
          />
          <BetTypeBadge 
            betType={prediction.bet_type}
            size="lg"
          />
          {/* Status badge for closed predictions */}
          {prediction.status === 'closed' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
              🔒 Fermé
            </span>
          )}
        </div>
        <ParticipationBadge hasParticipated={hasParticipated} />
      </div>

      {/* Infos match (équipes, compétition) */}
      <div className="mb-4">
        <p className="text-sm text-[var(--mvx-text-color-secondary)] mb-1">
          🏆 {prediction.competition}
        </p>
        <h3 className="text-xl sm:text-2xl font-bold text-[var(--mvx-text-color-primary)]">
          {prediction.home_team} <span className="text-[var(--mvx-text-accent-color)]">vs</span> {prediction.away_team}
        </h3>
      </div>

      {/* Dates + Récompense (grid horizontal compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-sm">
        <div className="bg-[var(--mvx-bg-color-primary)] p-3 rounded-lg">
          <p className="text-[var(--mvx-text-color-secondary)] text-xs mb-1">
            {t('predictions.startDate')}
          </p>
          <p className="text-[var(--mvx-text-color-primary)] font-medium">
            {startDate.toLocaleString('fr-FR', { 
              day: 'numeric', 
              month: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
        <div className="bg-[var(--mvx-bg-color-primary)] p-3 rounded-lg">
          <p className="text-[var(--mvx-text-color-secondary)] text-xs mb-1">
            {t('predictions.closeDate')}
          </p>
          <p className="text-[var(--mvx-text-color-primary)] font-medium">
            {closeDate.toLocaleString('fr-FR', { 
              day: 'numeric', 
              month: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
        <div className="bg-[var(--mvx-bg-accent-color)] p-3 rounded-lg">
          <p className="text-[var(--mvx-text-color-secondary)] text-xs mb-1">
            💰 {t('predictions.pointsReward')}
          </p>
          <p className="text-[var(--mvx-text-color-primary)] font-semibold">
            {prediction.points_reward} {t('common.points')}
          </p>
        </div>
      </div>

      {/* Options de paris (boutons sélectionnables) */}
      <div className="space-y-2 mb-4">
        {prediction.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelectOption(option.id)}
            disabled={hasParticipated || !isOpen}
            className={getOptionClass(option.id)}
          >
            <span className="font-medium">{option.label}</span>
            <span className="text-sm font-bold opacity-90">{option.odds}</span>
          </button>
        ))}
      </div>

      {/* Prediction Stats Display (collapsed par défaut) */}
      {isOpen && (
        <div className="mb-4">
          <PredictionStatsDisplay 
            stats={stats}
            options={prediction.options}
            calculationType={prediction.bet_calculation_type}
            loading={statsLoading}
          />
        </div>
      )}

      {/* Bet Amount Input */}
      {isOpen && !hasParticipated && selectedOption && (
        <div className="mb-4">
          <BetAmountInput
            minBet={prediction.min_bet_points}
            maxBet={prediction.max_bet_points}
            userPoints={userPoints}
            value={betAmount}
            onChange={setBetAmount}
            disabled={submitting || pointsLoading}
          />
        </div>
      )}

      {/* Result Display */}
      {isResulted && prediction.winning_option_id && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-[var(--mvx-text-color-primary)] font-semibold mb-1">
            {t('predictions.result')}:
          </p>
          <p className="text-[var(--mvx-text-color-primary)]">
            {
              prediction.options.find(
                (opt) => opt.id === prediction.winning_option_id
              )?.label
            }
          </p>
          {hasParticipated && userPrediction && userPrediction.is_correct !== null && (
            <p
              className={`mt-2 font-semibold ${
                userPrediction.is_correct
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              {userPrediction.is_correct
                ? `✓ ${t('predictions.correct')} (+${userPrediction.points_earned} ${t('common.points')})`
                : `✗ ${t('predictions.incorrect')}`}
            </p>
          )}
        </div>
      )}

      {/* Submit Button */}
      {isOpen && !hasParticipated && selectedOption && (
        <div className="relative">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            title={getSubmitError() || undefined}
            className="w-full py-3 px-4 bg-[var(--mvx-text-accent-color)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? t('common.loading')
              : t('predictions.submitPrediction')}
          </button>
          {getSubmitError() && !canSubmit && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm text-center">{getSubmitError()}</p>
            </div>
          )}
        </div>
      )}

      {/* Debug Info (temporary) */}
      {isOpen && !hasParticipated && selectedOption && (
        <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
          Debug: {address ? '✅ Wallet' : '❌ Wallet'} | {supabaseUserId ? '✅ Supabase' : '❌ Supabase'}
        </div>
      )}

      {/* Status Badge */}
      {!isOpen && (
        <div className="text-center py-2">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              prediction.status === 'closed'
                ? 'bg-orange-500/20 text-[var(--mvx-text-color-primary)]'
                : prediction.status === 'cancelled'
                  ? 'bg-red-500/20 text-[var(--mvx-text-color-primary)]'
                  : 'bg-gray-500/20 text-[var(--mvx-text-color-secondary)]'
            }`}
          >
            {t(`predictions.status.${prediction.status}`)}
          </span>
        </div>
      )}
    </div>
  );
};

