import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { predictionService } from 'features/predictions';
import { getRecentHistory } from 'features/predictions/services/predictionService';
import type { Prediction } from 'features/predictions/types';
import { Loader } from 'components/Loader';
import { useToast } from 'hooks/useToast';
import { ToastContainer } from 'components/Toast';
import { useAdminPredictionStats } from 'features/predictions/hooks/useAdminPredictionStats';
import { ValidatePredictionModal, ActionMenu, PredictionDetailModal } from './components';
import { RefreshButton } from 'components/RefreshButton';

// PredictionsTable Component
interface PredictionsTableProps {
  predictions: Prediction[];
  getStatsForPrediction: (id: string) => any;
  getTopOption: (prediction: Prediction) => { label: string; percentage: number };
  getStatusColor: (status: string) => string;
  handleOpenValidate: (prediction: Prediction) => void;
  handleOpenCancel: (id: string) => void;
  handleChangeStatus: (id: string, status: 'open' | 'closed' | 'cancelled') => void;
  handleViewDetails: (prediction: Prediction) => void;
  isHistorical: boolean;
  t: (key: string, options?: any) => string;
}

const PredictionsTable = ({
  predictions,
  getStatsForPrediction,
  getTopOption,
  getStatusColor,
  handleOpenValidate,
  handleOpenCancel,
  handleChangeStatus,
  handleViewDetails,
  isHistorical,
  t
}: PredictionsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--mvx-border-color-secondary)]">
            <th className="text-left py-3 px-4 text-[var(--mvx-text-color-primary)] font-semibold">
              {t('toasts.admin.tableHeaders.match')}
            </th>
            <th className="text-left py-3 px-4 text-[var(--mvx-text-color-primary)] font-semibold">
              {t('toasts.admin.tableHeaders.participants')}
            </th>
            <th className="text-left py-3 px-4 text-[var(--mvx-text-color-primary)] font-semibold">
              {t('toasts.admin.tableHeaders.poolTotal')}
            </th>
            <th className="text-left py-3 px-4 text-[var(--mvx-text-color-primary)] font-semibold">
              {t('toasts.admin.tableHeaders.topOption')}
            </th>
            <th className="text-left py-3 px-4 text-[var(--mvx-text-color-primary)] font-semibold">
              {t('toasts.admin.tableHeaders.status')}
            </th>
            <th className="text-left py-3 px-4 text-[var(--mvx-text-color-primary)] font-semibold">
              {t('toasts.admin.tableHeaders.startDate')}
            </th>
            <th className="text-right py-3 px-4 text-[var(--mvx-text-color-primary)] font-semibold">
              {t('toasts.admin.tableHeaders.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((prediction) => (
            <tr
              key={prediction.id}
              className="border-b border-[var(--mvx-border-color-secondary)] hover:bg-[var(--mvx-bg-accent-color)] transition-colors"
            >
              <td className="py-4 px-4 text-[var(--mvx-text-color-primary)]">
                {prediction.home_team} vs {prediction.away_team}
              </td>
              <td className="py-4 px-4 text-[var(--mvx-text-color-secondary)]">
                {(() => {
                  const predictionStats = getStatsForPrediction(prediction.id);
                  const count = predictionStats?.total_participants || 0;
                  if (count === 0) return t('toasts.admin.participants.none');
                  return count === 1 
                    ? t('toasts.admin.participants.one', { count }) 
                    : t('toasts.admin.participants.other', { count });
                })()}
              </td>
              <td className="py-4 px-4 text-[var(--mvx-text-color-secondary)]">
                {(() => {
                  const predictionStats = getStatsForPrediction(prediction.id);
                  const total = predictionStats?.total_pool || 0;
                  return total > 0 ? `${total.toLocaleString()} pts` : '0 pts';
                })()}
              </td>
              <td className="py-4 px-4 text-[var(--mvx-text-color-secondary)]">
                {(() => {
                  const topOption = getTopOption(prediction);
                  return (
                    <span>
                      {topOption.label}
                      {topOption.percentage > 0 && (
                        <span className="text-xs opacity-75 ml-1">
                          ({topOption.percentage}%)
                        </span>
                      )}
                    </span>
                  );
                })()}
              </td>
              <td className="py-4 px-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    prediction.status
                  )}`}
                >
                  {prediction.status}
                </span>
              </td>
              <td className="py-4 px-4 text-[var(--mvx-text-color-secondary)]">
                {new Date(prediction.start_date).toLocaleDateString()}
              </td>
              <td className="py-4 px-4">
                <div className="flex justify-end">
                  <ActionMenu
                    prediction={prediction}
                    isHistorical={isHistorical}
                    onViewDetails={handleViewDetails}
                    onValidate={handleOpenValidate}
                    onClose={(id) => handleChangeStatus(id, 'closed')}
                    onCancel={handleOpenCancel}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const ManagePredictions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();
  const { stats, fetchStats, getStatsForPrediction, loading: statsLoading } = useAdminPredictionStats();

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [historicalPredictions, setHistoricalPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate modal state
  const [validateModalOpen, setValidateModalOpen] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(
    null
  );
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [validating, setValidating] = useState(false);

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPredictionForDetail, setSelectedPredictionForDetail] = useState<Prediction | null>(null);

  // Section state
  const [showResultedSection, setShowResultedSection] = useState(true);
  const [showOtherSection, setShowOtherSection] = useState(true);

  // Fetch predictions
  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all predictions and historical predictions in parallel
      const [allPredictions, historyData] = await Promise.all([
        predictionService.getAllPredictions(),
        getRecentHistory(50, 0) // Get up to 50 historical predictions
      ]);
      
      // 🔍 DEBUG: Log all predictions retrieved
      console.log('🔍 [ManagePredictions] All predictions retrieved:', allPredictions);
      console.log('🔍 [ManagePredictions] Historical predictions retrieved:', historyData);
      console.log('🔍 [ManagePredictions] Total predictions count:', allPredictions.length);
      console.log('🔍 [ManagePredictions] Historical predictions count:', historyData.length);
      
      // Log each prediction with its status
      allPredictions.forEach((prediction: Prediction, index: number) => {
        console.log(`🔍 [ManagePredictions] Prediction ${index + 1}:`, {
          id: prediction.id,
          match: `${prediction.home_team} vs ${prediction.away_team}`,
          status: prediction.status,
          start_date: prediction.start_date,
          close_date: prediction.close_date,
          created_at: prediction.created_at
        });
      });
      
      setPredictions(allPredictions);
      setHistoricalPredictions(historyData);
      
      // Fetch stats for all predictions (including historical ones)
      const allPredictionIds = [...allPredictions.map((p: Prediction) => p.id), ...historyData.map((p: Prediction) => p.id)];
      await fetchStats(allPredictionIds);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError(t('toasts.admin.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  // Open validate modal
  const handleOpenValidate = (prediction: Prediction) => {
    setSelectedPrediction(prediction);
    setSelectedWinner('');
    setValidateModalOpen(true);
  };

  // Open detail modal
  const handleViewDetails = (prediction: Prediction) => {
    setSelectedPredictionForDetail(prediction);
    setDetailModalOpen(true);
  };

  // Validate result
  const handleValidateResult = async (winningOptionId: string) => {
    if (!selectedPrediction) return;

    try {
      setValidating(true);
      await predictionService.validateResult(
        selectedPrediction.id,
        winningOptionId
      );
      
      toast.success(
        t('toasts.admin.resultValidated'),
        t('toasts.admin.resultValidatedMessage'),
        4000
      );
      
      setValidateModalOpen(false);
      fetchPredictions(); // Refresh list
    } catch (err) {
      console.error('Error validating result:', err);
      toast.error(
        t('toasts.admin.validationError'),
        t('toasts.admin.validationErrorMessage'),
        4000
      );
    } finally {
      setValidating(false);
    }
  };

  // Open cancel modal
  const handleOpenCancel = (predictionId: string) => {
    setCancellingId(predictionId);
    setCancelModalOpen(true);
  };

  // Cancel prediction with refund
  const handleCancel = async () => {
    if (!cancellingId) return;

    try {
      setCancelling(true);
      const result = await predictionService.cancelPredictionWithRefund(cancellingId);
      
      toast.success(
        t('toasts.admin.predictionCancelled'),
        t('toasts.admin.refunded', { count: result.refunded_users, amount: result.refunded_amount }),
        4000
      );
      
      setCancelModalOpen(false);
      fetchPredictions(); // Refresh list
    } catch (err) {
      console.error('Error cancelling prediction:', err);
      toast.error(
        t('toasts.admin.cancellationError'),
        t('toasts.admin.cancellationErrorMessage'),
        4000
      );
    } finally {
      setCancelling(false);
      setCancellingId(null);
    }
  };

  // Change status
  const handleChangeStatus = async (
    predictionId: string,
    newStatus: 'open' | 'closed' | 'cancelled'
  ) => {
    try {
      await predictionService.changePredictionStatus(predictionId, newStatus);
      
      const statusMessages = {
        'closed': t('toasts.admin.statusMessages.closed'),
        'open': t('toasts.admin.statusMessages.open'),
        'cancelled': t('toasts.admin.statusMessages.cancelled')
      };
      
      toast.success(
        t('toasts.admin.statusChanged'),
        statusMessages[newStatus],
        3000
      );
      
      fetchPredictions(); // Refresh list
    } catch (err) {
      console.error('Error changing status:', err);
      toast.error(
        t('toasts.admin.statusError'),
        t('toasts.admin.statusErrorMessage'),
        4000
      );
    }
  };

  // Get status color
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

  // Get top option for a prediction
  const getTopOption = (prediction: Prediction) => {
    const predictionStats = getStatsForPrediction(prediction.id);
    if (!predictionStats || predictionStats.options.length === 0) {
      return { label: t('toasts.admin.topOption.none'), percentage: 0 };
    }

    const topOption = predictionStats.options.reduce((prev, current) =>
      current.percentage > prev.percentage ? current : prev
    );

    const optionLabel = prediction.options.find(opt => opt.id === topOption.option_id)?.label || t('toasts.admin.topOption.unknown');
    return { label: optionLabel, percentage: Math.round(topOption.percentage) };
  };

  // Use historical predictions for resulted section, and filter active predictions for other section
  const resultedPredictions = historicalPredictions; // Use the historical predictions from API
  const otherPredictions = predictions.filter(prediction => 
    prediction.status !== 'resulted' && prediction.status !== 'cancelled'
  );

  // 🔍 DEBUG: Log prediction filtering
  console.log('🔍 [ManagePredictions] Prediction filtering results:');
  console.log('🔍 [ManagePredictions] Total active predictions:', predictions.length);
  console.log('🔍 [ManagePredictions] Historical predictions:', historicalPredictions.length);
  console.log('🔍 [ManagePredictions] Resulted/Cancelled predictions:', resultedPredictions.length);
  console.log('🔍 [ManagePredictions] Other predictions:', otherPredictions.length);
  
  // Log detailed breakdown by status for active predictions
  const statusCounts = predictions.reduce((acc, prediction) => {
    acc[prediction.status] = (acc[prediction.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log('🔍 [ManagePredictions] Active predictions status breakdown:', statusCounts);
  
  // Log detailed breakdown by status for historical predictions
  const historicalStatusCounts = historicalPredictions.reduce((acc, prediction) => {
    acc[prediction.status] = (acc[prediction.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log('🔍 [ManagePredictions] Historical predictions status breakdown:', historicalStatusCounts);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin')}
          className="text-[var(--mvx-text-accent-color)] hover:underline mb-4 inline-flex items-center gap-2"
        >
          ← {t('common.back', { defaultValue: 'Back' })}
        </button>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-[var(--mvx-text-color-primary)] mb-2">
              {t('predictions.admin.managePredictions')}
            </h1>
            <p className="text-[var(--mvx-text-color-secondary)]">
              {t('toasts.admin.managePredictionsSubtitle')}
            </p>
          </div>
          <RefreshButton
            onRefresh={fetchPredictions}
            cooldownMs={5000}
            variant="secondary"
            size="small"
          >
            {t('common.refresh')}
          </RefreshButton>
        </div>

        {/* Predictions Sections */}
        <div className="flex flex-col gap-6 mb-6">
          {/* Other Predictions Section */}
          <div className="bg-[var(--mvx-bg-color-secondary)] rounded-lg border border-[var(--mvx-border-color-secondary)]">
            <button
              onClick={() => setShowOtherSection(!showOtherSection)}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-[var(--mvx-bg-accent-color)] transition-colors"
            >
              <h3 className="text-lg font-semibold text-[var(--mvx-text-color-primary)]">
                {t('toasts.admin.sections.otherPredictions')} ({otherPredictions.length})
              </h3>
              <span className="text-[var(--mvx-text-color-secondary)] text-xl">
                {showOtherSection ? '−' : '+'}
              </span>
            </button>
            
            {showOtherSection && (
              <div className="border-t border-[var(--mvx-border-color-secondary)]">
                {otherPredictions.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-[var(--mvx-text-color-secondary)]">
                      {t('toasts.admin.sections.noOtherPredictions')}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto relative">
                    <PredictionsTable 
                      predictions={otherPredictions}
                      getStatsForPrediction={getStatsForPrediction}
                      getTopOption={getTopOption}
                      getStatusColor={getStatusColor}
                      handleOpenValidate={handleOpenValidate}
                      handleOpenCancel={handleOpenCancel}
                      handleChangeStatus={handleChangeStatus}
                      handleViewDetails={handleViewDetails}
                      isHistorical={false}
                      t={t}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resulted Predictions Section */}
          <div className="bg-[var(--mvx-bg-color-secondary)] rounded-lg border border-[var(--mvx-border-color-secondary)]">
            <button
              onClick={() => setShowResultedSection(!showResultedSection)}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-[var(--mvx-bg-accent-color)] transition-colors"
            >
              <h3 className="text-lg font-semibold text-[var(--mvx-text-color-primary)]">
                {t('toasts.admin.sections.resultedAndCancelledPredictions')} ({resultedPredictions.length})
              </h3>
              <span className="text-[var(--mvx-text-color-secondary)] text-xl">
                {showResultedSection ? '−' : '+'}
              </span>
            </button>
            
            {showResultedSection && (
              <div className="border-t border-[var(--mvx-border-color-secondary)]">
                {resultedPredictions.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-[var(--mvx-text-color-secondary)]">
                      {t('toasts.admin.sections.noResultedPredictions')}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto relative">
                    <PredictionsTable 
                      predictions={resultedPredictions}
                      getStatsForPrediction={getStatsForPrediction}
                      getTopOption={getTopOption}
                      getStatusColor={getStatusColor}
                      handleOpenValidate={handleOpenValidate}
                      handleOpenCancel={handleOpenCancel}
                      handleChangeStatus={handleChangeStatus}
                      handleViewDetails={handleViewDetails}
                      isHistorical={true}
                      t={t}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && predictions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[var(--mvx-text-color-secondary)] text-lg">
            {t('toasts.admin.noPredictionsYet')}
          </p>
        </div>
      )}

      {/* Validate Modal */}
      {validateModalOpen && selectedPrediction && (
        <ValidatePredictionModal
          prediction={selectedPrediction}
          stats={getStatsForPrediction(selectedPrediction.id)}
          onValidate={handleValidateResult}
          onClose={() => setValidateModalOpen(false)}
          validating={validating}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--mvx-bg-color-primary)] rounded-xl p-6 max-w-md w-full border border-[var(--mvx-border-color-secondary)]">
            <h3 className="text-2xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
              {t('predictions.admin.cancel')}
            </h3>
            <p className="text-[var(--mvx-text-color-secondary)] mb-6">
              {t('predictions.admin.cancelConfirm')}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2 px-4 bg-[var(--mvx-bg-color-secondary)] text-[var(--mvx-text-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg"
              >
                {t('common.back')}
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? t('common.loading') : t('predictions.admin.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && selectedPredictionForDetail && (
        <PredictionDetailModal
          prediction={selectedPredictionForDetail}
          stats={getStatsForPrediction(selectedPredictionForDetail.id)}
          onClose={() => setDetailModalOpen(false)}
        />
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

