import { useState, FormEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGetAccount } from 'lib';
import { useAuth } from 'contexts/AuthContext';
import { useToast } from 'hooks/useToast';
import { ToastContainer } from 'components/Toast';
import type { BetType, BetCalculationType, PredictionOption } from 'features/predictions/types';
import { predictionService } from 'features/predictions';
import { BetTypeSelector } from 'features/predictions/components';

export const CreatePrediction = () => {
  const { t } = useTranslation('predictions');

  // Helper function to convert calculation type to translation key
  const getCalculationKey = (type: BetCalculationType) => {
    return type === 'pool_ratio' ? 'poolRatio' : 'fixedOdds';
  };
  const navigate = useNavigate();
  const { address } = useGetAccount();
  const { supabaseUserId, loading: authLoading } = useAuth();
  const { toasts, toast, removeToast } = useToast();

  // Debug auth status
  useEffect(() => {
    console.log('[CreatePrediction] Auth Status:', {
      address,
      supabaseUserId,
      authLoading
    });
  }, [address, supabaseUserId, authLoading]);

  // Form state
  const [competition, setCompetition] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [betType, setBetType] = useState<BetType>('result');
  const [betCalculationType, setBetCalculationType] = useState<BetCalculationType>('pool_ratio');
  const [extendedBetType, setExtendedBetType] = useState<string>('');
  const [options, setOptions] = useState<PredictionOption[]>([
    { id: '1', label: '', odds: '' },
    { id: 'X', label: '', odds: '' }
  ]);
  const [startDate, setStartDate] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [pointsReward, setPointsReward] = useState('10');
  const [minBetPoints, setMinBetPoints] = useState('10');
  const [maxBetPoints, setMaxBetPoints] = useState('1000');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert extended bet type to legacy bet type for backward compatibility
  const getLegacyBetType = (extendedType: string): BetType => {
    // For now, we'll map based on common patterns
    // In the future, this could be more sophisticated
    if (extendedType.startsWith('1x2') || extendedType.includes('result')) return 'result';
    if (extendedType.includes('over') || extendedType.includes('under') || extendedType.includes('goals')) return 'over_under';
    if (extendedType.includes('scorer') || extendedType.includes('goalscorer')) return 'scorer';
    if (extendedType.includes('btts') || extendedType.includes('both-teams')) return 'both_teams_score';
    return 'result'; // Default fallback
  };

  // Add option
  const handleAddOption = () => {
    const newId = String(options.length + 1);
    setOptions([...options, { id: newId, label: '', odds: '' }]);
  };

  // Remove option
  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return; // Minimum 2 options
    setOptions(options.filter((_, i) => i !== index));
  };

  // Update option
  const handleUpdateOption = (
    index: number,
    field: 'label' | 'odds',
    value: string
  ) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!competition.trim()) {
      setError(t('admin.validation.required') + ' (Competition)');
      return false;
    }
    if (!homeTeam.trim() || !awayTeam.trim()) {
      setError(t('admin.validation.required') + ' (Teams)');
      return false;
    }
    if (!extendedBetType.trim()) {
      setError(t('admin.validation.required') + ' (Bet Type)');
      return false;
    }
    if (options.length < 2) {
      setError(t('admin.validation.minOptions'));
      return false;
    }
    if (betCalculationType === 'fixed_odds') {
      if (options.some((opt) => !opt.label.trim() || !opt.odds.trim())) {
        setError('All options must have a label and odds');
        return false;
      }
    } else {
      if (options.some((opt) => !opt.label.trim())) {
        setError('All options must have a label');
        return false;
      }
    }
    if (!startDate || !closeDate) {
      setError(t('admin.validation.required') + ' (Dates)');
      return false;
    }
    if (new Date(closeDate) > new Date(startDate)) {
      setError(t('admin.validation.invalidDates'));
      return false;
    }
    if (!pointsReward || Number(pointsReward) <= 0) {
      setError('Points reward must be greater than 0');
      return false;
    }
    if (!minBetPoints || Number(minBetPoints) <= 0) {
      setError('Minimum bet must be greater than 0');
      return false;
    }
    if (!maxBetPoints || Number(maxBetPoints) <= 0) {
      setError('Maximum bet must be greater than 0');
      return false;
    }
    if (Number(maxBetPoints) < Number(minBetPoints)) {
      setError('Maximum bet must be greater than or equal to minimum bet');
      return false;
    }
    return true;
  };

  // Handle submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    if (!supabaseUserId) {
      console.error('[CreatePrediction] No supabaseUserId:', {
        supabaseUserId,
        address,
        authLoading
      });
      const errorMsg = 'User not authenticated. Please refresh the page and try again.';
      setError(errorMsg);
      return;
    }

    try {
      setSubmitting(true);

      await predictionService.createPrediction(
        {
          competition: competition.trim(),
          home_team: homeTeam.trim(),
          away_team: awayTeam.trim(),
          bet_type: getLegacyBetType(extendedBetType),
          bet_calculation_type: betCalculationType,
          extended_bet_type: extendedBetType,
          options: options.map((opt) => ({
            id: opt.id,
            label: opt.label.trim(),
            odds: opt.odds.trim()
          })),
          start_date: new Date(startDate).toISOString(),
          close_date: new Date(closeDate).toISOString(),
          points_reward: Number(pointsReward),
          min_bet_points: Number(minBetPoints),
          max_bet_points: Number(maxBetPoints)
        },
        supabaseUserId
      );

      // Show success toast
      toast.success(
        t('toasts.admin.predictionCreated'),
        t('toasts.admin.predictionCreatedMessage', {
          homeTeam,
          awayTeam,
          competition
        }),
        3000
      );

      // Navigate after a short delay to show toast
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    } catch (err) {
      console.error('Error creating prediction:', err);
      const errorMsg = t('admin.errors.createFailed');
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-[var(--mvx-text-color-secondary)]">
            {t('common.loading')}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin')}
          className="text-[var(--mvx-text-accent-color)] hover:underline mb-4 inline-flex items-center gap-2"
        >
          ← {t('common.back', { defaultValue: 'Back' })}
        </button>
        <h1 className="text-4xl font-bold text-[var(--mvx-text-color-primary)] mb-2">
          {t('admin.createPrediction')}
        </h1>
        <p className="text-[var(--mvx-text-color-secondary)]">
          {t('admin.createPredictionDescription')}
        </p>
        
        {/* Auth Status Debug */}
        <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400">
          Auth: {address ? '✅ Wallet' : '❌ Wallet'} | {supabaseUserId ? '✅ Supabase' : '❌ Supabase'}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Competition */}
        <div>
          <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
            {t('admin.competition')} *
          </label>
          <input
            type="text"
            value={competition}
            onChange={(e) => setCompetition(e.target.value)}
            placeholder="e.g. Premier League, La Liga"
            className="w-full px-4 py-3 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
          />
        </div>

        {/* Teams */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
              {t('admin.homeTeam')} *
            </label>
            <input
              type="text"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              placeholder="e.g. Manchester United"
              className="w-full px-4 py-3 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
            />
          </div>
          <div>
            <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
              {t('admin.awayTeam')} *
            </label>
            <input
              type="text"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              placeholder="e.g. Liverpool"
              className="w-full px-4 py-3 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
            />
          </div>
        </div>

        {/* Bet Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
              {t('admin.betType')} *
            </label>
            <BetTypeSelector
              value={extendedBetType}
              onChange={setExtendedBetType}
              placeholder="Search and select a bet type..."
              className="w-full"
            />
            {extendedBetType && (
              <p className="text-sm text-[var(--mvx-text-color-secondary)] mt-1">
                Selected: {extendedBetType}
              </p>
            )}
          </div>
          
          {/* Bet Calculation Type */}
          <div>
            <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
              Type de Calcul des Gains *
            </label>
            <select
              value={betCalculationType}
              onChange={(e) => setBetCalculationType(e.target.value as BetCalculationType)}
              className="w-full px-4 py-3 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
            >
              <option value="pool_ratio">{t('admin.calculationTypes.poolRatio')}</option>
              <option value="fixed_odds">{t('admin.calculationTypes.fixedOdds')}</option>
            </select>
            <p className="text-sm text-[var(--mvx-text-color-secondary)] mt-1">
              {t(`admin.calculationHelp.${getCalculationKey(betCalculationType)}`)}
            </p>
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
            {t('admin.options')} * (min 2)
          </label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) =>
                    handleUpdateOption(index, 'label', e.target.value)
                  }
                  placeholder={t('admin.optionLabel')}
                  className="flex-1 px-4 py-3 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
                />
                {betCalculationType === 'fixed_odds' && (
                  <input
                    type="text"
                    value={option.odds}
                    onChange={(e) =>
                      handleUpdateOption(index, 'odds', e.target.value)
                    }
                    placeholder={t('admin.optionOdds')}
                    className="w-24 px-4 py-3 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
                  />
                )}
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    {t('admin.removeOption')}
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              onClick={handleAddOption}
              className="px-4 py-2 bg-[var(--mvx-text-accent-color)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              + {t('admin.addOption')}
            </button>
            <div className="text-sm text-[var(--mvx-text-color-secondary)]">
              {t(`admin.calculationHelp.${getCalculationKey(betCalculationType)}`)}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
              {t('admin.startDate')} *
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
            />
            <p className="text-sm text-[var(--mvx-text-color-secondary)] mt-1">
              {t('admin.startDateHelp')}
            </p>
          </div>
          <div>
            <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
              {t('admin.closeDate')} *
            </label>
            <input
              type="datetime-local"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
            />
            <p className="text-sm text-[var(--mvx-text-color-secondary)] mt-1">
              {t('admin.closeDateHelp')}
            </p>
          </div>
        </div>

        {/* Points Reward */}
        <div>
          <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
            {t('admin.pointsReward')} *
          </label>
          <input
            type="number"
            min="1"
            value={pointsReward}
            onChange={(e) => setPointsReward(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
          />
          <p className="text-sm text-[var(--mvx-text-color-secondary)] mt-1">
            Base reward (legacy field - now uses betting pool system)
          </p>
        </div>

        {/* Betting Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
              Minimum Bet (points) *
            </label>
            <input
              type="number"
              min="1"
              value={minBetPoints}
              onChange={(e) => setMinBetPoints(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
            />
            <p className="text-sm text-[var(--mvx-text-color-secondary)] mt-1">
              Default: 10 points
            </p>
          </div>
          <div>
            <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
              Maximum Bet (points) *
            </label>
            <input
              type="number"
              min="1"
              value={maxBetPoints}
              onChange={(e) => setMaxBetPoints(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
            />
            <p className="text-sm text-[var(--mvx-text-color-secondary)] mt-1">
              Default: 1000 points
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="flex-1 py-3 px-4 bg-[var(--mvx-bg-color-secondary)] text-[var(--mvx-text-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg font-semibold hover:border-[var(--mvx-text-accent-color)] transition-colors"
          >
            {t('admin.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 px-4 bg-[var(--mvx-text-accent-color)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('common.loading') : t('admin.create')}
          </button>
        </div>
      </form>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

