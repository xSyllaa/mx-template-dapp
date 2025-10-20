import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WarGameService } from '../services/warGameService';
import { TeamService } from '../services/teamService';
import type { WarGameWithDetails } from '../types';

interface WarGameHistoryProps {
  userId?: string | null;
  completedGames?: WarGameWithDetails[]; // Optional: if provided, use these instead of fetching
}

export const WarGameHistory = ({ userId, completedGames: providedGames }: WarGameHistoryProps) => {
  const { t } = useTranslation();
  const [completedGames, setCompletedGames] = useState<WarGameWithDetails[]>(providedGames || []);
  const [loading, setLoading] = useState(!providedGames);
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [teamDetails, setTeamDetails] = useState<Record<string, {
    creator: any;
    opponent: any;
  }>>({});

  // Update completed games if provided externally
  useEffect(() => {
    if (providedGames) {
      setCompletedGames(providedGames);
      setLoading(false);
    }
  }, [providedGames]);

  // Fetch if not provided
  useEffect(() => {
    if (!providedGames && userId) {
      loadCompletedGames();
    }
  }, [userId, providedGames]);

  const loadCompletedGames = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const games = await WarGameService.getCompletedWarGames(userId);
      setCompletedGames(games);
    } catch (error) {
      console.error('Failed to load completed war games:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGameDetails = async (gameId: string) => {
    if (expandedGameId === gameId) {
      setExpandedGameId(null);
    } else {
      setExpandedGameId(gameId);
      
      // Load team details if not already loaded
      if (!teamDetails[gameId]) {
        const game = completedGames.find(g => g.id === gameId);
        if (game) {
          try {
            const [creatorTeam, opponentTeam] = await Promise.all([
              game.creatorTeamId ? TeamService.getTeamDetails(game.creatorTeamId) : null,
              game.opponentTeamId ? TeamService.getTeamDetails(game.opponentTeamId) : null
            ]);
            
            setTeamDetails(prev => ({
              ...prev,
              [gameId]: {
                creator: creatorTeam,
                opponent: opponentTeam
              }
            }));
          } catch (error) {
            console.error('Failed to load team details:', error);
          }
        }
      }
    }
  };

  const getWinnerLabel = (game: WarGameWithDetails) => {
    if (!game.winnerId) return t('pages.warGames.history.noWinner');
    
    if (game.winnerId === game.creatorId) {
      return game.creatorUsername || t('common.anonymous');
    } else {
      return game.opponentUsername || t('common.anonymous');
    }
  };

  const isUserWinner = (game: WarGameWithDetails) => {
    return game.winnerId === userId;
  };

  if (loading) {
    return (
      <div className="bg-[var(--mvx-bg-color-secondary)] rounded-lg p-6 border border-[var(--mvx-border-color-secondary)]">
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--mvx-text-accent-color)] mx-auto"></div>
          <p className="text-sm text-[var(--mvx-text-color-secondary)] mt-2">
            {t('pages.warGames.history.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (completedGames.length === 0) {
    return (
      <div className="bg-[var(--mvx-bg-color-secondary)] rounded-lg p-6 border border-[var(--mvx-border-color-secondary)]">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📜</div>
          <p className="text-lg text-[var(--mvx-text-color-primary)] font-semibold mb-2">
            {t('pages.warGames.history.noHistory')}
          </p>
          <p className="text-sm text-[var(--mvx-text-color-secondary)]">
            {t('pages.warGames.history.noHistoryDescription')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--mvx-bg-color-secondary)] rounded-lg p-6 border border-[var(--mvx-border-color-secondary)]">
      <h3 className="text-xl font-bold text-[var(--mvx-text-color-primary)] mb-4 flex items-center gap-2">
        <span>📜</span>
        {t('pages.warGames.history.title')}
        <span className="text-sm font-normal text-[var(--mvx-text-color-secondary)]">
          ({completedGames.length})
        </span>
      </h3>

      <div className="space-y-3">
        {completedGames.map((game) => (
          <div
            key={game.id}
            className="bg-[var(--mvx-bg-color-primary)] rounded-lg border border-[var(--mvx-border-color-secondary)] overflow-hidden"
          >
            {/* Game Header */}
            <button
              onClick={() => toggleGameDetails(game.id)}
              className="w-full p-4 text-left hover:bg-[var(--mvx-bg-color-secondary)] transition-colors"
            >
              <div className="flex items-center justify-between">
                {/* Players */}
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    {/* Creator */}
                    <div className={`flex items-center gap-2 ${isUserWinner(game) && game.winnerId === game.creatorId ? 'text-green-500 font-bold' : ''}`}>
                      <span className="text-lg">
                        {game.winnerId === game.creatorId ? '👑' : '⚔️'}
                      </span>
                      <span className="text-[var(--mvx-text-color-primary)]">
                        {game.creatorUsername || t('common.anonymous')}
                      </span>
                      {game.creatorScore !== null && (
                        <span className="text-xs text-[var(--mvx-text-color-secondary)]">
                          ({game.creatorScore} pts)
                        </span>
                      )}
                    </div>

                    <span className="text-[var(--mvx-text-color-secondary)]">vs</span>

                    {/* Opponent */}
                    <div className={`flex items-center gap-2 ${isUserWinner(game) && game.winnerId === game.opponentId ? 'text-green-500 font-bold' : ''}`}>
                      <span className="text-lg">
                        {game.winnerId === game.opponentId ? '👑' : '⚔️'}
                      </span>
                      <span className="text-[var(--mvx-text-color-primary)]">
                        {game.opponentUsername || t('common.anonymous')}
                      </span>
                      {game.opponentScore !== null && (
                        <span className="text-xs text-[var(--mvx-text-color-secondary)]">
                          ({game.opponentScore} pts)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {game.status === 'in_progress' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      🔥 In Progress
                    </span>
                  ) : game.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      ✅ Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
                      📋 {game.status}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-[var(--mvx-text-color-secondary)]">
                      {t('pages.warGames.history.stake')}:
                    </div>
                    <div className="font-bold text-[var(--mvx-text-accent-color)]">
                      {game.pointsStake} {t('common.points')}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-[var(--mvx-text-color-secondary)]">
                      {t('pages.warGames.history.completed')}:
                    </div>
                    <div className="text-sm text-[var(--mvx-text-color-primary)]">
                      {game.completedAt ? new Date(game.completedAt).toLocaleDateString() : '-'}
                    </div>
                  </div>

                  <div className="text-[var(--mvx-text-color-secondary)]">
                    {expandedGameId === game.id ? '▼' : '▶'}
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {expandedGameId === game.id && (
              <div className="border-t border-[var(--mvx-border-color-secondary)] p-4 bg-[var(--mvx-bg-color-secondary)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Creator Info */}
                  <div>
                    <h4 className="font-bold text-[var(--mvx-text-color-primary)] mb-3 flex items-center gap-2">
                      {game.winnerId === game.creatorId && <span>👑</span>}
                      {t('pages.warGames.history.creator')}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--mvx-text-color-secondary)]">
                          {t('pages.warGames.history.username')}:
                        </span>
                        <span className="text-[var(--mvx-text-color-primary)] font-semibold">
                          {game.creatorUsername || t('common.anonymous')}
                        </span>
                      </div>
                      {game.creatorAddress && (
                        <div className="flex justify-between">
                          <span className="text-[var(--mvx-text-color-secondary)]">
                            {t('pages.warGames.history.address')}:
                          </span>
                          <span className="text-[var(--mvx-text-color-primary)] font-mono text-xs">
                            {game.creatorAddress.slice(0, 8)}...{game.creatorAddress.slice(-6)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[var(--mvx-text-color-secondary)]">
                          {t('pages.warGames.history.score')}:
                        </span>
                        <span className="text-[var(--mvx-text-accent-color)] font-bold">
                          {game.creatorScore !== null ? game.creatorScore : '-'} pts
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-[var(--mvx-text-color-secondary)] mb-2">
                          {t('pages.warGames.history.teamComposition')}:
                        </div>
                        {teamDetails[game.id]?.creator ? (
                          <div className="space-y-1">
                            <div className="text-xs text-[var(--mvx-text-color-primary)] font-semibold">
                              {teamDetails[game.id].creator.teamName} ({teamDetails[game.id].creator.formation})
                            </div>
                            <div className="text-xs text-[var(--mvx-text-color-secondary)]">
                              {teamDetails[game.id].creator.playerCount}/11 players
                            </div>
                            <div className="max-h-20 overflow-y-auto">
                              {teamDetails[game.id].creator.players.map((player, index) => (
                                <div key={index} className="text-xs text-[var(--mvx-text-color-primary)]">
                                  {player.position}: {player.playerName}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-[var(--mvx-text-color-secondary)]">
                            {t('pages.warGames.history.loadingTeam')}...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Opponent Info */}
                  <div>
                    <h4 className="font-bold text-[var(--mvx-text-color-primary)] mb-3 flex items-center gap-2">
                      {game.winnerId === game.opponentId && <span>👑</span>}
                      {t('pages.warGames.history.opponent')}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--mvx-text-color-secondary)]">
                          {t('pages.warGames.history.username')}:
                        </span>
                        <span className="text-[var(--mvx-text-color-primary)] font-semibold">
                          {game.opponentUsername || t('common.anonymous')}
                        </span>
                      </div>
                      {game.opponentAddress && (
                        <div className="flex justify-between">
                          <span className="text-[var(--mvx-text-color-secondary)]">
                            {t('pages.warGames.history.address')}:
                          </span>
                          <span className="text-[var(--mvx-text-color-primary)] font-mono text-xs">
                            {game.opponentAddress.slice(0, 8)}...{game.opponentAddress.slice(-6)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[var(--mvx-text-color-secondary)]">
                          {t('pages.warGames.history.score')}:
                        </span>
                        <span className="text-[var(--mvx-text-accent-color)] font-bold">
                          {game.opponentScore !== null ? game.opponentScore : '-'} pts
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-[var(--mvx-text-color-secondary)] mb-2">
                          {t('pages.warGames.history.teamComposition')}:
                        </div>
                        {teamDetails[game.id]?.opponent ? (
                          <div className="space-y-1">
                            <div className="text-xs text-[var(--mvx-text-color-primary)] font-semibold">
                              {teamDetails[game.id].opponent.teamName} ({teamDetails[game.id].opponent.formation})
                            </div>
                            <div className="text-xs text-[var(--mvx-text-color-secondary)]">
                              {teamDetails[game.id].opponent.playerCount}/11 players
                            </div>
                            <div className="max-h-20 overflow-y-auto">
                              {teamDetails[game.id].opponent.players.map((player, index) => (
                                <div key={index} className="text-xs text-[var(--mvx-text-color-primary)]">
                                  {player.position}: {player.playerName}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-[var(--mvx-text-color-secondary)]">
                            {t('pages.warGames.history.loadingTeam')}...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game Timeline */}
                <div className="mt-4 pt-4 border-t border-[var(--mvx-border-color-secondary)]">
                  <h4 className="font-bold text-[var(--mvx-text-color-primary)] mb-3">
                    {t('pages.warGames.history.timeline')}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--mvx-text-color-secondary)]">
                        {t('pages.warGames.history.created')}:
                      </span>
                      <span className="text-[var(--mvx-text-color-primary)]">
                        {new Date(game.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {game.startedAt && (
                      <div className="flex justify-between">
                        <span className="text-[var(--mvx-text-color-secondary)]">
                          {t('pages.warGames.history.started')}:
                        </span>
                        <span className="text-[var(--mvx-text-color-primary)]">
                          {new Date(game.startedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {game.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-[var(--mvx-text-color-secondary)]">
                          {t('pages.warGames.history.completedAt')}:
                        </span>
                        <span className="text-[var(--mvx-text-color-primary)]">
                          {new Date(game.completedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Winner Banner */}
                {game.winnerId && (
                  <div className={`mt-4 p-3 rounded-lg text-center ${
                    isUserWinner(game) 
                      ? 'bg-green-500/20 border border-green-500' 
                      : 'bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)]'
                  }`}>
                    <div className="text-lg font-bold">
                      {isUserWinner(game) ? (
                        <span className="text-green-500">
                          🎉 {t('pages.warGames.history.youWon')}
                        </span>
                      ) : (
                        <span className="text-[var(--mvx-text-color-primary)]">
                          👑 {t('pages.warGames.history.winner')}: {getWinnerLabel(game)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

