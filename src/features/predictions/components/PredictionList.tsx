import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePredictions } from '../hooks/usePredictions';
import { usePredictionFilters } from '../hooks/usePredictionFilters';
import { PredictionCard } from './PredictionCard';
import { PredictionFilters } from './PredictionFilters';
import { Loader } from 'components/Loader';

type Tab = 'active' | 'history';

export const PredictionList = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('active');

  // Fetch predictions based on active tab
  const {
    predictions: activePredictions,
    loading: activeLoading,
    error: activeError,
    refresh: refreshActive
  } = usePredictions('active');

  const {
    predictions: historyPredictions,
    loading: historyLoading,
    error: historyError,
    refresh: refreshHistory,
    loadMore,
    hasMore
  } = usePredictions('history', 10);

  // Determine which data to display
  const isActive = activeTab === 'active';
  const predictions = isActive ? activePredictions : historyPredictions;
  const loading = isActive ? activeLoading : historyLoading;
  const error = isActive ? activeError : historyError;

  // Apply filters
  const {
    filters,
    filteredPredictions,
    availableCompetitions,
    availableBetTypes,
    toggleBetType,
    setCalculationType,
    toggleCompetition,
    toggleStatus,
    clearFilters,
    hasActiveFilters
  } = usePredictionFilters(predictions);

  // Handle tab change
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  // Handle refresh
  const handleRefresh = () => {
    if (isActive) {
      refreshActive();
    } else {
      refreshHistory();
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    loadMore();
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[var(--mvx-border-color-secondary)]">
        <button
          onClick={() => handleTabChange('active')}
          className={`px-4 py-3 font-semibold transition-colors relative ${
            activeTab === 'active'
              ? 'text-[var(--mvx-text-accent-color)]'
              : 'text-[var(--mvx-text-color-secondary)] hover:text-[var(--mvx-text-color-primary)]'
          }`}
        >
          {t('predictions.active')}
          {activeTab === 'active' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--mvx-text-accent-color)]" />
          )}
        </button>
        <button
          onClick={() => handleTabChange('history')}
          className={`px-4 py-3 font-semibold transition-colors relative ${
            activeTab === 'history'
              ? 'text-[var(--mvx-text-accent-color)]'
              : 'text-[var(--mvx-text-color-secondary)] hover:text-[var(--mvx-text-color-primary)]'
          }`}
        >
          {t('predictions.history')}
          {activeTab === 'history' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--mvx-text-accent-color)]" />
          )}
        </button>
      </div>

      {/* Filters */}
      {!loading && !error && predictions.length > 0 && (
        <PredictionFilters
          betTypes={filters.betTypes}
          calculationType={filters.calculationType}
          competitions={filters.competitions}
          statuses={filters.statuses}
          availableCompetitions={availableCompetitions}
          availableBetTypes={availableBetTypes}
          toggleBetType={toggleBetType}
          setCalculationType={setCalculationType}
          toggleCompetition={toggleCompetition}
          toggleStatus={toggleStatus}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          totalResults={filteredPredictions.length}
        />
      )}

      {/* Loading State */}
      {loading && predictions.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <Loader />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-16">
          <p className="text-red-400 mb-4">{t('common.error')}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-[var(--mvx-text-accent-color)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && predictions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[var(--mvx-text-color-secondary)] text-lg">
            {isActive
              ? t('predictions.noActive')
              : t('predictions.noHistory')}
          </p>
        </div>
      )}

      {/* No Results After Filtering */}
      {!loading && !error && predictions.length > 0 && filteredPredictions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[var(--mvx-text-color-secondary)] text-lg mb-4">
            {t('predictions.filters.noResults', { defaultValue: 'No predictions match your filters' })}
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-[var(--mvx-text-accent-color)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            {t('predictions.filters.clearAll', { defaultValue: 'Clear All' })}
          </button>
        </div>
      )}

      {/* Predictions Grid */}
      {!loading && !error && filteredPredictions.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPredictions.map((prediction) => (
              <PredictionCard
                key={prediction.id}
                prediction={prediction}
                onSubmitSuccess={handleRefresh}
              />
            ))}
          </div>

          {/* Load More Button (for history) */}
          {activeTab === 'history' && hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={historyLoading}
                className="px-6 py-3 bg-[var(--mvx-bg-color-secondary)] text-[var(--mvx-text-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg font-semibold hover:border-[var(--mvx-text-accent-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {historyLoading ? t('common.loading') : t('predictions.loadMore')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

