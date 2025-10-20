import { useTranslation } from 'react-i18next';
import type { WarGameWithDetails } from '../types';

interface ActiveWarGamesListProps {
  warGames: WarGameWithDetails[];
  currentUserId?: string | null;
  onJoinClick: (gameId: string) => void;
}

export const ActiveWarGamesList = ({ 
  warGames, 
  currentUserId,
  onJoinClick 
}: ActiveWarGamesListProps) => {
  const { t } = useTranslation();

  if (warGames.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 w-full max-w-4xl">
      <div className="bg-[var(--mvx-bg-color-secondary)] rounded-lg p-6 border border-[var(--mvx-border-color-secondary)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warGames.map((game) => {
          // Check if this war game was created by the current user
          const isOwnWarGame = game.creatorId === currentUserId;
          
          return (
            <div
              key={game.id}
              className={`bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg p-4 transition-colors ${
                isOwnWarGame 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:border-[var(--mvx-text-accent-color)]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚔️</span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[var(--mvx-text-color-primary)]">
                      {game.creatorUsername || t('common.anonymous')}
                    </span>
                    {game.creatorAddress && (
                      <span className="text-xs text-[var(--mvx-text-color-secondary)] font-mono">
                        {game.creatorAddress.slice(0, 8)}...{game.creatorAddress.slice(-6)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-[var(--mvx-text-color-secondary)]">
                    {new Date(game.createdAt).toLocaleDateString()}
                  </span>
                  <br />
                  <span className="text-xs text-[var(--mvx-text-color-secondary)]">
                    {new Date(game.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--mvx-text-color-secondary)]">
                    {t('pages.warGames.activeGames.stake')}:
                  </span>
                  <span className="font-bold text-[var(--mvx-text-accent-color)]">
                    {game.pointsStake} {t('common.points')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--mvx-text-color-secondary)]">
                    {t('pages.warGames.activeGames.deadline')}:
                  </span>
                  <span className="text-sm text-[var(--mvx-text-color-primary)]">
                    {new Date(game.entryDeadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {isOwnWarGame ? (
                <div className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg text-center font-semibold">
                  {t('pages.warGames.activeGames.ownWarGame')}
                </div>
              ) : (
                <button
                  onClick={() => onJoinClick(game.id)}
                  className="w-full bg-[var(--mvx-text-accent-color)] text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity font-semibold"
                >
                  {t('pages.warGames.activeGames.joinButton')}
                </button>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

