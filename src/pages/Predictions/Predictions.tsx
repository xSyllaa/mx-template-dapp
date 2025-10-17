import { useTranslation } from 'react-i18next';
import { PredictionList } from 'features/predictions';

export const Predictions = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
          ⚽ {t('predictions.title')}
        </h1>
        <p className="text-lg text-[var(--mvx-text-color-secondary)]">
          {t('predictions.subtitle')}
        </p>
      </div>

      {/* Predictions List */}
      <PredictionList />
    </div>
  );
};

