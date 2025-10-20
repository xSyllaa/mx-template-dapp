import { useTranslation } from 'react-i18next';
import type { WarGameWithDetails } from '../types';

interface WarGameConfigurationProps {
  mode: 'create' | 'join';
  pointsStake: number;
  entryDeadline: string;
  selectedWarGameId: string;
  openWarGames: WarGameWithDetails[];
  loadingWarGames: boolean;
  onPointsStakeChange: (value: number) => void;
  onEntryDeadlineChange: (value: string) => void;
  onSelectedWarGameChange: (gameId: string) => void;
}

export const WarGameConfiguration = ({
  mode,
  pointsStake,
  entryDeadline,
  selectedWarGameId,
  openWarGames,
  loadingWarGames,
  onPointsStakeChange,
  onEntryDeadlineChange,
  onSelectedWarGameChange
}: WarGameConfigurationProps) => {
  const { t } = useTranslation();

  if (mode === 'create') {
    return (
      <div className="mb-6 bg-[var(--mvx-bg-color-secondary)] rounded-lg p-6 border border-[var(--mvx-border-color-secondary)]">
        <h3 className="text-xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
          {t('pages.warGames.create.title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
              {t('pages.warGames.create.fields.points.label')}
            </label>
            <input
              type="number"
              min="1"
              step="10"
              value={pointsStake}
              onChange={(e) => onPointsStakeChange(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-[var(--mvx-bg-color-primary)] text-[var(--mvx-text-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mvx-text-accent-color)]"
            />
          </div>
          <div>
            <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
              {t('pages.warGames.create.fields.deadline.label')}
            </label>
            <input
              type="datetime-local"
              value={entryDeadline}
              onChange={(e) => onEntryDeadlineChange(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-2 bg-[var(--mvx-bg-color-primary)] text-[var(--mvx-text-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mvx-text-accent-color)]"
            />
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="mb-6 bg-[var(--mvx-bg-color-secondary)] rounded-lg p-6 border border-[var(--mvx-border-color-secondary)]">
        <h3 className="text-xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
          {t('pages.warGames.join.title')}
        </h3>
        {loadingWarGames ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--mvx-text-accent-color)] mx-auto"></div>
          </div>
        ) : openWarGames.length === 0 ? (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
            <p className="text-yellow-500 text-sm">
              {t('pages.warGames.join.fields.warGame.noGames')}
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
              {t('pages.warGames.join.fields.warGame.label')}
            </label>
            <select
              value={selectedWarGameId}
              onChange={(e) => onSelectedWarGameChange(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--mvx-bg-color-primary)] text-[var(--mvx-text-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mvx-text-accent-color)]"
            >
              {openWarGames.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.creatorUsername || t('common.anonymous')} - {game.pointsStake} {t('common.points')} - {new Date(game.entryDeadline).toLocaleDateString()}
                </option>
              ))}
            </select>
            {selectedWarGameId && openWarGames.find(g => g.id === selectedWarGameId) && (
              <div className="mt-4 p-4 bg-[var(--mvx-bg-color-primary)] rounded-lg border border-[var(--mvx-border-color-secondary)]">
                <h4 className="font-semibold text-[var(--mvx-text-color-primary)] mb-2">
                  {t('pages.warGames.join.warGameDetails.title')}
                </h4>
                {(() => {
                  const game = openWarGames.find(g => g.id === selectedWarGameId)!;
                  return (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--mvx-text-color-secondary)]">{t('pages.warGames.join.warGameDetails.creator')}:</span>
                        <span className="text-[var(--mvx-text-color-primary)]">{game.creatorUsername || t('common.anonymous')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--mvx-text-color-secondary)]">{t('pages.warGames.join.warGameDetails.stake')}:</span>
                        <span className="text-[var(--mvx-text-accent-color)] font-bold">{game.pointsStake} {t('common.points')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--mvx-text-color-secondary)]">{t('pages.warGames.join.warGameDetails.deadline')}:</span>
                        <span className="text-[var(--mvx-text-color-primary)]">{new Date(game.entryDeadline).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
};

