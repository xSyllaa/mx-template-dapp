import { useTranslation } from 'react-i18next';
import { PredictionStatsDisplay } from 'features/predictions/components/PredictionStatsDisplay';
import type { Prediction } from 'features/predictions/types';

interface PredictionDetailModalProps {
  prediction: Prediction;
  stats?: any;
  onClose: () => void;
}

export const PredictionDetailModal = ({
  prediction,
  stats,
  onClose
}: PredictionDetailModalProps) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'closed':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'resulted':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--mvx-bg-color-primary)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--mvx-border-color-secondary)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--mvx-border-color-secondary)]">
          <div>
            <h3 className="text-2xl font-bold text-[var(--mvx-text-color-primary)]">
              {prediction.home_team} vs {prediction.away_team}
            </h3>
            <p className="text-[var(--mvx-text-color-secondary)] mt-1">
              {prediction.competition}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--mvx-bg-accent-color)] rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-[var(--mvx-text-color-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--mvx-text-color-secondary)] mb-2">
                {t('toasts.admin.predictions.status')}
              </label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(prediction.status)}`}>
                {prediction.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--mvx-text-color-secondary)] mb-2">
                {t('toasts.admin.predictions.betType')}
              </label>
              <p className="text-[var(--mvx-text-color-primary)]">{prediction.bet_type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--mvx-text-color-secondary)] mb-2">
                {t('toasts.admin.predictions.startDate')}
              </label>
              <p className="text-[var(--mvx-text-color-primary)]">{formatDate(prediction.start_date)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--mvx-text-color-secondary)] mb-2">
                {t('toasts.admin.predictions.closeDate')}
              </label>
              <p className="text-[var(--mvx-text-color-primary)]">{formatDate(prediction.close_date)}</p>
            </div>
          </div>

          {/* Betting Options */}
          <div>
            <label className="block text-sm font-medium text-[var(--mvx-text-color-secondary)] mb-3">
              {t('toasts.admin.predictions.bettingOptions')}
            </label>
            <div className="space-y-2">
              {prediction.options.map((option) => (
                <div key={option.id} className="flex items-center justify-between p-3 bg-[var(--mvx-bg-color-secondary)] rounded-lg">
                  <span className="text-[var(--mvx-text-color-primary)]">{option.label}</span>
                  {prediction.winning_option_id === option.id && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      {t('toasts.admin.predictions.winner')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Statistics - Using the same component as ValidatePredictionModal */}
          <div>
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
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-[var(--mvx-border-color-secondary)]">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[var(--mvx-bg-color-secondary)] text-[var(--mvx-text-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg hover:bg-[var(--mvx-bg-accent-color)] transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
