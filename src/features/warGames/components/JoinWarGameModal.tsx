import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/Button';
import { SavedTeam, WarGameWithDetails } from '../types';
import { TeamService } from '../services/teamService';
import { WarGameService } from '../services/warGameService';

interface JoinWarGameModalProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal for joining an existing War Game
 */
export const JoinWarGameModal = ({ userId, onClose, onSuccess }: JoinWarGameModalProps) => {
  const { t } = useTranslation();
  
  // State
  const [teams, setTeams] = useState<SavedTeam[]>([]);
  const [warGames, setWarGames] = useState<WarGameWithDetails[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedWarGameId, setSelectedWarGameId] = useState<string>('');
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's teams and available war games
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load teams and war games in parallel
        const [userTeams, openWarGames] = await Promise.all([
          TeamService.getUserTeams(userId),
          WarGameService.getOpenWarGames()
        ]);
        
        setTeams(userTeams);
        setWarGames(openWarGames);
        
        // Auto-select first team if available
        if (userTeams.length > 0) {
          setSelectedTeamId(userTeams[0].id);
        }
        
        // Auto-select first war game if available
        if (openWarGames.length > 0) {
          setSelectedWarGameId(openWarGames[0].id);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(t('pages.warGames.join.errors.loadData'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, t]);

  const handleJoin = async () => {
    // Validation
    if (!selectedTeamId) {
      setError(t('pages.warGames.join.errors.selectTeam'));
      return;
    }

    if (!selectedWarGameId) {
      setError(t('pages.warGames.join.errors.selectWarGame'));
      return;
    }

    try {
      setJoining(true);
      setError(null);

      await WarGameService.joinWarGame(
        {
          warGameId: selectedWarGameId,
          teamId: selectedTeamId
        },
        userId
      );

      onSuccess();
    } catch (err) {
      console.error('Error joining war game:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : t('pages.warGames.join.errors.joinFailed')
      );
    } finally {
      setJoining(false);
    }
  };

  const selectedWarGame = warGames.find(wg => wg.id === selectedWarGameId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--mvx-bg-color-primary)] rounded-xl p-6 max-w-2xl w-full border border-[var(--mvx-border-color-secondary)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--mvx-text-color-primary)] mb-2">
            🤝 {t('pages.warGames.join.title')}
          </h2>
          <p className="text-[var(--mvx-text-color-secondary)]">
            {t('pages.warGames.join.subtitle')}
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
            {/* War Game Selection */}
            <div>
              <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
                {t('pages.warGames.join.fields.warGame.label')}
              </label>
              {warGames.length === 0 ? (
                <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
                  <p className="text-yellow-500 text-sm">
                    {t('pages.warGames.join.fields.warGame.noGames')}
                  </p>
                </div>
              ) : (
                <select
                  value={selectedWarGameId}
                  onChange={(e) => setSelectedWarGameId(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--mvx-bg-color-secondary)] text-[var(--mvx-text-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mvx-text-accent-color)]"
                >
                  {warGames.map((warGame) => (
                    <option key={warGame.id} value={warGame.id}>
                      {warGame.creatorUsername || t('pages.warGames.join.fields.warGame.anonymous')} - {warGame.pointsStake} {t('common.points')} - {new Date(warGame.entryDeadline).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-[var(--mvx-text-color-secondary)] text-sm mt-2">
                {t('pages.warGames.join.fields.warGame.description')}
              </p>
            </div>

            {/* War Game Details */}
            {selectedWarGame && (
              <div className="bg-[var(--mvx-bg-color-secondary)] rounded-lg p-4">
                <h3 className="text-[var(--mvx-text-color-primary)] font-semibold mb-3">
                  {t('pages.warGames.join.warGameDetails.title')}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--mvx-text-color-secondary)]">
                      {t('pages.warGames.join.warGameDetails.creator')}:
                    </span>
                    <span className="text-[var(--mvx-text-color-primary)] font-semibold">
                      {selectedWarGame.creatorUsername || t('pages.warGames.join.fields.warGame.anonymous')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--mvx-text-color-secondary)]">
                      {t('pages.warGames.join.warGameDetails.stake')}:
                    </span>
                    <span className="text-[var(--mvx-text-accent-color)] font-bold">
                      {selectedWarGame.pointsStake} {t('common.points')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--mvx-text-color-secondary)]">
                      {t('pages.warGames.join.warGameDetails.deadline')}:
                    </span>
                    <span className="text-[var(--mvx-text-color-primary)]">
                      {new Date(selectedWarGame.entryDeadline).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--mvx-text-color-secondary)]">
                      {t('pages.warGames.join.warGameDetails.created')}:
                    </span>
                    <span className="text-[var(--mvx-text-color-primary)]">
                      {new Date(selectedWarGame.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Team Selection */}
            <div>
              <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
                {t('pages.warGames.join.fields.team.label')}
              </label>
              {teams.length === 0 ? (
                <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
                  <p className="text-yellow-500 text-sm">
                    {t('pages.warGames.join.fields.team.noTeams')}
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
                {t('pages.warGames.join.fields.team.description')}
              </p>
            </div>

            {/* Summary */}
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
              <h3 className="text-green-500 font-semibold mb-2 flex items-center">
                <span className="mr-2">⚠️</span>
                {t('pages.warGames.join.summary.title')}
              </h3>
              <p className="text-green-500 text-sm">
                {t('pages.warGames.join.summary.message', { points: selectedWarGame?.pointsStake || 0 })}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-3 justify-end">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={joining}
          >
            {t('common.close')}
          </Button>
          <Button
            onClick={handleJoin}
            variant="primary"
            disabled={loading || joining || teams.length === 0 || warGames.length === 0 || !selectedTeamId || !selectedWarGameId}
          >
            {joining ? t('common.loading') : t('pages.warGames.join.button')}
          </Button>
        </div>
      </div>
    </div>
  );
};

