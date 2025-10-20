import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PredictionStatsDisplay } from 'features/predictions/components/PredictionStatsDisplay';
import { getPredictionWinnersPreview } from 'features/predictions/services/predictionWinnersService';
import type { Prediction, PredictionStats, PredictionOption } from 'features/predictions/types';
import type { WinnersCalculation } from 'features/predictions/services/predictionWinnersService';

interface ValidatePredictionModalProps {
  prediction: Prediction;
  stats: PredictionStats | null;
  onValidate: (winningOptionId: string) => Promise<void>;
  onClose: () => void;
  validating: boolean;
}

export const ValidatePredictionModal = ({
  prediction,
  stats,
  onValidate,
  onClose,
  validating
}: ValidatePredictionModalProps) => {
  const { t } = useTranslation();
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [winnersCalculation, setWinnersCalculation] = useState<WinnersCalculation | null>(null);
  const [loadingWinners, setLoadingWinners] = useState(false);

  const handleValidate = async () => {
    if (!selectedWinner) return;
    await onValidate(selectedWinner);
  };

  const handleWinnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWinner(e.target.value);
  };

  // Load winners calculation when winner is selected
  useEffect(() => {
    const loadWinnersCalculation = async () => {
      if (!selectedWinner) {
        setWinnersCalculation(null);
        return;
      }

      try {
        setLoadingWinners(true);
        const calculation = await getPredictionWinnersPreview(prediction.id, selectedWinner);
        setWinnersCalculation(calculation);
      } catch (error) {
        console.error('Error loading winners calculation:', error);
        setWinnersCalculation(null);
      } finally {
        setLoadingWinners(false);
      }
    };

    loadWinnersCalculation();
  }, [selectedWinner, prediction.id]);

  // Use the real winners calculation from the service
  const calculateWinnings = winnersCalculation;

  // Calculate summary for preview
  const getWinningsPreview = () => {
    if (!calculateWinnings) return null;

    return {
      totalWinners: calculateWinnings.totalWinners,
      totalGains: calculateWinnings.winningPool,
      averageGain: calculateWinnings.totalWinners > 0 
        ? Math.floor(calculateWinnings.winningPool / calculateWinnings.totalWinners) 
        : 0
    };
  };

  const winningsPreview = getWinningsPreview();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--mvx-bg-color-primary)] rounded-xl p-6 max-w-4xl w-full border border-[var(--mvx-border-color-secondary)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-[var(--mvx-text-color-primary)] mb-2">
            {t('predictions.admin.validateResult')}
          </h3>
          <p className="text-[var(--mvx-text-color-secondary)] text-lg">
            {prediction.home_team} vs {prediction.away_team}
          </p>
          <p className="text-[var(--mvx-text-color-secondary)] text-sm">
            {prediction.competition} • {new Date(prediction.start_date).toLocaleDateString()}
          </p>
        </div>

        {/* Stats Twitch-style */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-[var(--mvx-text-color-primary)] mb-3">
            Statistiques des Paris
          </h4>
          <PredictionStatsDisplay 
            stats={stats}
            options={prediction.options}
            calculationType={prediction.bet_calculation_type}
            loading={!stats}
          />
        </div>

        {/* Winner Selection */}
        <div className="mb-6">
          <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
            {t('predictions.admin.selectWinner')} *
          </label>
          <select
            value={selectedWinner}
            onChange={handleWinnerChange}
            className="w-full px-4 py-3 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
            disabled={validating}
          >
            <option value="">-- Sélectionner le gagnant --</option>
            {prediction.options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Winners List Preview */}
        {loadingWinners && (
          <div className="mb-6 p-4 bg-[var(--mvx-bg-accent-color)] rounded-lg border border-[var(--mvx-border-color-secondary)]">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--mvx-text-accent-color)]"></div>
              <span className="ml-2 text-[var(--mvx-text-color-secondary)]">Chargement des gagnants...</span>
            </div>
          </div>
        )}

        {calculateWinnings && !loadingWinners && calculateWinnings.totalWinners === 0 && (
          <div className="mb-6 p-6 bg-orange-500/10 border border-orange-500/30 rounded-lg text-center">
            <div className="text-4xl mb-3">😔</div>
            <h4 className="text-lg font-semibold text-[var(--mvx-text-color-primary)] mb-2">
              Aucun Gagnant
            </h4>
            <p className="text-[var(--mvx-text-color-secondary)]">
              Personne n'a parié sur cette option. Aucun gain ne sera distribué.
            </p>
          </div>
        )}

        {calculateWinnings && !loadingWinners && calculateWinnings.totalWinners > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-[var(--mvx-text-color-primary)]">
                📋 Liste des Gagnants
              </h4>
              <div className="text-sm text-[var(--mvx-text-color-secondary)]">
                {calculateWinnings.totalWinners} gagnant{calculateWinnings.totalWinners > 1 ? 's' : ''}
              </div>
            </div>
            
            {/* Summary Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-[var(--mvx-bg-accent-color)] rounded-lg">
              <div className="text-center">
                <p className="text-xs text-[var(--mvx-text-color-secondary)] mb-1">Type de Calcul</p>
                <p className="font-semibold text-[var(--mvx-text-color-primary)]">
                  {calculateWinnings.calculationType === 'fixed_odds' ? '🎯 Cotes Fixes' : '📊 Pool Ratio'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[var(--mvx-text-color-secondary)] mb-1">Ratio/Cote</p>
                <p className="font-semibold text-[var(--mvx-text-color-primary)]">
                  {calculateWinnings.calculationType === 'fixed_odds' 
                    ? `${calculateWinnings.odds}x` 
                    : `${calculateWinnings.ratio.toFixed(2)}x`}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[var(--mvx-text-color-secondary)] mb-1">Pool Gagnant</p>
                <p className="font-semibold text-[var(--mvx-text-color-primary)]">
                  {calculateWinnings.winningPool} pts
                </p>
              </div>
            </div>

            {/* Winners List with Scroll */}
            <div className="bg-[var(--mvx-bg-color-secondary)] rounded-lg border border-[var(--mvx-border-color-secondary)]">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-[var(--mvx-bg-color-secondary)] border-b border-[var(--mvx-border-color-secondary)]">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--mvx-text-color-primary)]">
                        Joueur
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--mvx-text-color-primary)]">
                        Mise
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--mvx-text-color-primary)]">
                        Gains
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--mvx-text-color-primary)]">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateWinnings.winners.map((winner, index) => (
                      <tr key={winner.user_id} className="border-b border-[var(--mvx-border-color-secondary)] last:border-b-0">
                        <td className="py-3 px-4 text-[var(--mvx-text-color-primary)]">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-[var(--mvx-text-accent-color)] text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            {winner.username}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-[var(--mvx-text-color-secondary)]">
                          {winner.points_wagered} pts
                        </td>
                        <td className="py-3 px-4 text-right text-[var(--mvx-text-color-secondary)]">
                          +{winner.calculated_winnings} pts
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-green-400">
                          {winner.total_after_win} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Total Summary */}
              <div className="border-t border-[var(--mvx-border-color-secondary)] p-4 bg-[var(--mvx-bg-accent-color)]">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[var(--mvx-text-color-primary)]">
                    Total Distribué
                  </span>
                  <span className="font-bold text-green-400 text-lg">
                    {calculateWinnings.winners.reduce((sum, w) => sum + w.calculated_winnings, 0)} pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Winnings Preview */}
        {winningsPreview && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <h5 className="text-green-400 font-semibold mb-2">
              📊 Prévisualisation des Gains
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-[var(--mvx-text-color-secondary)]">Gagnants:</span>
                <span className="text-[var(--mvx-text-color-primary)] font-semibold ml-2">
                  {winningsPreview.totalWinners} joueurs
                </span>
              </div>
              <div>
                <span className="text-[var(--mvx-text-color-secondary)]">Pool Total:</span>
                <span className="text-[var(--mvx-text-color-primary)] font-semibold ml-2">
                  {winningsPreview.totalGains.toLocaleString()} pts
                </span>
              </div>
              <div>
                <span className="text-[var(--mvx-text-color-secondary)]">Type:</span>
                <span className="text-[var(--mvx-text-color-primary)] font-semibold ml-2">
                  {prediction.bet_calculation_type === 'pool_ratio' ? 'Pool Ratio' : 'Cotes Fixes'}
                </span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-[var(--mvx-bg-color-secondary)] rounded">
              <p className="text-[var(--mvx-text-color-primary)] text-sm">
                <strong>⚠️ Attention:</strong> Les gains seront distribués automatiquement à tous les joueurs ayant parié sur cette option. Cette action est irréversible.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={validating}
            className="flex-1 py-3 px-4 bg-[var(--mvx-bg-color-secondary)] text-[var(--mvx-text-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg font-semibold hover:border-[var(--mvx-text-accent-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('predictions.admin.cancel')}
          </button>
          <button
            onClick={handleValidate}
            disabled={!selectedWinner || validating}
            className="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {validating ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                {t('common.loading')}
              </>
            ) : (
              <>
                ✅ Valider et Distribuer les Gains
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
