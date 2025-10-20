import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/Button';
import { SavedTeam } from '../types';
import { TeamService } from '../services/teamService';
import { WarGameService } from '../services/warGameService';

interface CreateWarGameModalProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal for creating a new War Game
 */
export const CreateWarGameModal = ({ userId, onClose, onSuccess }: CreateWarGameModalProps) => {
  const { t } = useTranslation();
  
  // State
  const [teams, setTeams] = useState<SavedTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [pointsStake, setPointsStake] = useState<number>(100);
  const [deadline, setDeadline] = useState<string>('');
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's teams
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        const userTeams = await TeamService.getUserTeams(userId);
        setTeams(userTeams);
        
        // Auto-select first team if available
        if (userTeams.length > 0) {
          setSelectedTeamId(userTeams[0].id);
        }
        
        // Set default deadline to 24 hours from now
        const tomorrow = new Date();
        tomorrow.setHours(tomorrow.getHours() + 24);
        setDeadline(tomorrow.toISOString().slice(0, 16));
      } catch (err) {
        console.error('Error loading teams:', err);
        setError(t('pages.warGames.create.errors.loadTeams'));
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [userId, t]);

  const handleCreate = async () => {
    // Validation
    if (!selectedTeamId) {
      setError(t('pages.warGames.create.errors.selectTeam'));
      return;
    }

    if (pointsStake <= 0) {
      setError(t('pages.warGames.create.errors.invalidPoints'));
      return;
    }

    if (!deadline) {
      setError(t('pages.warGames.create.errors.invalidDeadline'));
      return;
    }

    try {
      setCreating(true);
      setError(null);

      await WarGameService.createWarGame(
        {
          teamId: selectedTeamId,
          pointsStake,
          entryDeadline: deadline
        },
        userId
      );

      onSuccess();
    } catch (err) {
      console.error('Error creating war game:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : t('pages.warGames.create.errors.createFailed')
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--mvx-bg-color-primary)] rounded-xl p-6 max-w-2xl w-full border border-[var(--mvx-border-color-secondary)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--mvx-text-color-primary)] mb-2">
            🎮 {t('pages.warGames.create.title')}
          </h2>
          <p className="text-[var(--mvx-text-color-secondary)]">
            {t('pages.warGames.create.subtitle')}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--mvx-text-accent-color)] mx-auto"></div>
            <p className="text-[var(--mvx-text-color-secondary)] mt-4">
              {t('common.loading')}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        {!loading && (
          <div className="space-y-6">
            {/* Team Selection */}
            <div>
              <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
                {t('pages.warGames.create.fields.team.label')}
              </label>
              {teams.length === 0 ? (
                <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
                  <p className="text-yellow-500 text-sm">
                    {t('pages.warGames.create.fields.team.noTeams')}
                  </p>
                </div>
              ) : (
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--mvx-bg-color-secondary)] text-[var(--mvx-text-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mvx-text-accent-color)]"
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.teamName} ({team.formation})
                    </option>
                  ))}
                </select>
              )}
              <p className="text-[var(--mvx-text-color-secondary)] text-sm mt-2">
                {t('pages.warGames.create.fields.team.description')}
              </p>
            </div>

            {/* Points Stake */}
            <div>
              <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
                {t('pages.warGames.create.fields.points.label')}
              </label>
              <input
                type="number"
                min="1"
                step="10"
                value={pointsStake}
                onChange={(e) => setPointsStake(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-[var(--mvx-bg-color-secondary)] text-[var(--mvx-text-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mvx-text-accent-color)]"
              />
              <p className="text-[var(--mvx-text-color-secondary)] text-sm mt-2">
                {t('pages.warGames.create.fields.points.description')}
              </p>
            </div>

            {/* Entry Deadline */}
            <div>
              <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
                {t('pages.warGames.create.fields.deadline.label')}
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2 bg-[var(--mvx-bg-color-secondary)] text-[var(--mvx-text-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mvx-text-accent-color)]"
              />
              <p className="text-[var(--mvx-text-color-secondary)] text-sm mt-2">
                {t('pages.warGames.create.fields.deadline.description')}
              </p>
            </div>

            {/* Summary */}
            <div className="bg-[var(--mvx-bg-color-secondary)] rounded-lg p-4">
              <h3 className="text-[var(--mvx-text-color-primary)] font-semibold mb-3">
                {t('pages.warGames.create.summary.title')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--mvx-text-color-secondary)]">
                    {t('pages.warGames.create.summary.team')}:
                  </span>
                  <span className="text-[var(--mvx-text-color-primary)] font-semibold">
                    {teams.find(t => t.id === selectedTeamId)?.teamName || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--mvx-text-color-secondary)]">
                    {t('pages.warGames.create.summary.stake')}:
                  </span>
                  <span className="text-[var(--mvx-text-accent-color)] font-bold">
                    {pointsStake} {t('common.points')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--mvx-text-color-secondary)]">
                    {t('pages.warGames.create.summary.deadline')}:
                  </span>
                  <span className="text-[var(--mvx-text-color-primary)]">
                    {deadline ? new Date(deadline).toLocaleString() : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-3 justify-end">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={creating}
          >
            {t('common.close')}
          </Button>
          <Button
            onClick={handleCreate}
            variant="primary"
            disabled={loading || creating || teams.length === 0 || !selectedTeamId}
          >
            {creating ? t('common.loading') : t('pages.warGames.create.button')}
          </Button>
        </div>
      </div>
    </div>
  );
};

