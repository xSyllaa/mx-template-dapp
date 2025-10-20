import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { predictionService } from 'features/predictions';
import type { Prediction } from 'features/predictions/types';
import { Loader } from 'components/Loader';
import { useToast } from 'hooks/useToast';
import { ToastContainer } from 'components/Toast';
import { useAdminPredictionStats } from 'features/predictions/hooks/useAdminPredictionStats';
import { ValidatePredictionModal } from './components/ValidatePredictionModal';

export const ManagePredictions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();
  const { stats, fetchStats, getStatsForPrediction, loading: statsLoading } = useAdminPredictionStats();

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate modal state
  const [validateModalOpen, setValidateModalOpen] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(
    null
  );
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [validating, setValidating] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch predictions
  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await predictionService.getAllPredictions();
      setPredictions(data);
      
      // Fetch stats for all predictions
      const predictionIds = data.map(p => p.id);
      await fetchStats(predictionIds);
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

  // Open delete modal
  const handleOpenDelete = (predictionId: string) => {
    setDeletingId(predictionId);
    setDeleteModalOpen(true);
  };

  // Delete prediction
  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setDeleting(true);
      const result = await predictionService.deletePredictionWithRefund(deletingId);
      
      toast.success(
        t('toasts.admin.predictionDeleted'),
        t('toasts.admin.refunded', { count: result.refunded_users, amount: result.refunded_amount }),
        4000
      );
      
      setDeleteModalOpen(false);
      fetchPredictions(); // Refresh list
    } catch (err) {
      console.error('Error deleting prediction:', err);
      toast.error(
        t('toasts.admin.deletionError'),
        t('toasts.admin.deletionErrorMessage'),
        4000
      );
    } finally {
      setDeleting(false);
      setDeletingId(null);
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
        <h1 className="text-4xl font-bold text-[var(--mvx-text-color-primary)] mb-2">
          {t('predictions.admin.managePredictions')}
        </h1>
        <p className="text-[var(--mvx-text-color-secondary)]">
          {t('toasts.admin.managePredictionsSubtitle')}
        </p>
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

      {/* Predictions Table */}
      {predictions.length > 0 && (
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
                    <div className="flex justify-end gap-2">
                      {/* Validate Button */}
                      {(prediction.status === 'closed' ||
                        prediction.status === 'open') && (
                        <button
                          onClick={() => handleOpenValidate(prediction)}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-sm"
                        >
                          {t('predictions.admin.validateResult')}
                        </button>
                      )}

                      {/* Status Change Buttons */}
                      {prediction.status === 'open' && (
                        <button
                          onClick={() =>
                            handleChangeStatus(prediction.id, 'closed')
                          }
                          className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors text-sm"
                        >
                          {t('toasts.admin.actions.close')}
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => handleOpenDelete(prediction.id)}
                        disabled={prediction.status === 'resulted'}
                        className={`px-3 py-1 rounded transition-colors text-sm ${
                          prediction.status === 'resulted'
                            ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                        title={prediction.status === 'resulted' ? t('toasts.admin.actions.cannotDelete') : ''}
                      >
                        {t('predictions.admin.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--mvx-bg-color-primary)] rounded-xl p-6 max-w-md w-full border border-[var(--mvx-border-color-secondary)]">
            <h3 className="text-2xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
              {t('predictions.admin.delete')}
            </h3>
            <p className="text-[var(--mvx-text-color-secondary)] mb-6">
              {t('predictions.admin.deleteConfirm')}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2 px-4 bg-[var(--mvx-bg-color-secondary)] text-[var(--mvx-text-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg"
              >
                {t('predictions.admin.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? t('common.loading') : t('predictions.admin.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

