import { useTranslation } from 'react-i18next';
import type { WarGameWithDetails } from '../types';

interface ActiveWarGamesListProps {
  warGames: WarGameWithDetails[];
  currentUserId?: string | null;
  onJoinClick: (gameId: string) => void;
  showBadge?: boolean;
}

export const ActiveWarGamesList = ({ 
  warGames, 
  currentUserId,
  onJoinClick,
  showBadge = true
}: ActiveWarGamesListProps) => {
  const { t } = useTranslation();

  if (warGames.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 w-full max-w-4xl">
      <div className="bg-[var(--mvx-bg-color-secondary)] rounded-lg p-6 border border-[var(--mvx-border-color-secondary)]">
        {/* War Games List Badge - Inside container */}
        {showBadge && (
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--mvx-bg-accent-color)] border border-[var(--mvx-border-color-secondary)] text-[var(--mvx-text-color-primary)] font-medium">
              ⚔️ {t('pages.warGames.allWarGames', { count: warGames.length, defaultValue_one: '{{count}} war game', defaultValue_other: '{{count}} war games' })}
            </span>
          </div>
        )}
        
        {/* Scrollable list with max height */}
        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
        {warGames.map((game) => {
          // Check if this war game was created by the current user
          const isOwnWarGame = game.creatorId === currentUserId;
          
          // Check if the game is expired
          const isExpired = new Date(game.entryDeadline) < new Date();
          
          // Determine if the game is accessible
          const isAccessible = !isOwnWarGame && !isExpired;
          
          return (
            <div
              key={game.id}
              className={`bg-[var(--mvx-bg-color-secondary)] border rounded-lg p-4 transition-colors ${
                isAccessible
                  ? 'border-[var(--mvx-border-color-secondary)] hover:border-[var(--mvx-text-accent-color)]'
                  : 'border-red-500 bg-red-50/10 opacity-75 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚔️</span>
                  <div className="flex flex-col">
                    <span className={`font-semibold ${isAccessible ? 'text-[var(--mvx-text-color-primary)]' : 'text-red-600'}`}>
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
                  <span className={`font-bold ${isAccessible ? 'text-[var(--mvx-text-accent-color)]' : 'text-red-600'}`}>
                    {game.pointsStake} {t('common.points')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--mvx-text-color-secondary)]">
                    {t('pages.warGames.activeGames.deadline')}:
                  </span>
                  <span className={`text-sm ${isExpired ? 'text-red-600 font-bold' : isAccessible ? 'text-[var(--mvx-text-color-primary)]' : 'text-red-600'}`}>
                    {new Date(game.entryDeadline).toLocaleDateString()}
                    {isExpired && ' (Expiré)'}
                  </span>
                </div>
              </div>
              
              {!isAccessible ? (
                <div className="w-full bg-red-500 text-white py-2 px-4 rounded-lg text-center font-semibold">
                  {isOwnWarGame 
                    ? t('pages.warGames.activeGames.ownWarGame')
                    : isExpired 
                      ? t('pages.warGames.activeGames.expired')
                      : t('pages.warGames.activeGames.notAccessible')
                  }
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

