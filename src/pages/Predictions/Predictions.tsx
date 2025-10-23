import { useTranslation } from 'react-i18next';
import { PredictionList, PredictionStats } from 'features/predictions';
import { usePredictions } from 'features/predictions/hooks';
import { Button } from 'components/Button';

export const Predictions = () => {
  const { t } = useTranslation();
  
  // Fetch active and history predictions to get counts
  const { predictions: activePredictions, loading: activeLoading } = usePredictions('active');
  const { predictions: historyPredictions, loading: historyLoading } = usePredictions('history', 10);
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
              ⚽ {t('predictions.title')}
            </h1>
            <p className="text-lg text-[var(--mvx-text-color-secondary)]">
              {t('predictions.subtitle')}
            </p>
          </div>
          
          {/* Refresh Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="small"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <span>🔄</span>
              {t('common.refresh')}
            </Button>
          </div>
        </div>
      </div>

      {/* Prediction Stats */}
      <PredictionStats
        activeCount={activePredictions.length}
        historyCount={historyPredictions.length}
        loading={activeLoading || historyLoading}
      />

      {/* Predictions List */}
      <PredictionList />
    </div>
  );
};

