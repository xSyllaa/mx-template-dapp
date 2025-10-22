import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCachedTeamOfWeek } from 'features/teamOfWeek';
import { useNFTsByIdentifiers } from 'features/collection';
import { NFTDetailModal } from 'features/myNFTs/components/NFTDetailModal';
import { TeamOfWeekSkeleton } from 'features/teamOfWeek/components/TeamOfWeekSkeleton';
import type { TeamOfWeek as TeamOfWeekType, Player } from 'features/teamOfWeek/types';
import type { GalacticXNFT } from 'features/myNFTs';
import { Button } from 'components/Button';

export const TeamOfWeek = () => {
  const { t } = useTranslation();

  // Use cached team of the week data (5-minute cache)
  const {
    teams,
    selectedTeam,
    setSelectedTeam,
    loading,
    error,
    refetch,
    isRefetching,
    lastUpdated
  } = useCachedTeamOfWeek();

  const [selectedNFT, setSelectedNFT] = useState<GalacticXNFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract NFT identifiers from selected team players
  const nftIdentifiers = useMemo(() => {
    if (!selectedTeam?.players || selectedTeam.players.length === 0) {
      return [];
    }

    // Extract nftId from each player
    return selectedTeam.players
      .map((player: Player) => player.nftId)
      .filter(Boolean); // Remove empty/undefined values
  }, [selectedTeam]);

  // Use cached collection system to get NFT details
  const { nfts, nftMap, loading: nftLoading, allFound, missingIdentifiers } = useNFTsByIdentifiers(nftIdentifiers);

  // Log if some NFTs are missing
  useEffect(() => {
    if (!allFound && missingIdentifiers.length > 0) {
      console.warn(`⚠️ Team of the Week: ${missingIdentifiers.length} NFTs not found in collection:`, missingIdentifiers);
    }
  }, [allFound, missingIdentifiers]);

  const getCurrentWeek = () => {
    const today = new Date();
    const year = today.getFullYear();
    
    // Calculer le numéro de semaine ISO
    const target = new Date(today.valueOf());
    const dayNr = (today.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    
    return { year, weekNumber };
  };

  const isTeamInCurrentWeek = (team: TeamOfWeekType, year: number, weekNumber: number) => {
    // Comparer les dates de début et fin avec la semaine courante
    const teamStart = new Date(team.week_start_date);
    const teamEnd = new Date(team.week_end_date);
    
    const currentWeekStart = getWeekStartDate(year, weekNumber);
    const currentWeekEnd = getWeekEndDate(year, weekNumber);
    
    return teamStart <= currentWeekEnd && teamEnd >= currentWeekStart;
  };

  const getWeekStartDate = (year: number, weekNumber: number) => {
    const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
  };

  const getWeekEndDate = (year: number, weekNumber: number) => {
    const start = getWeekStartDate(year, weekNumber);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  };

  const formatWeekLabel = (team: TeamOfWeekType) => {
    const start = new Date(team.week_start_date);
    const end = new Date(team.week_end_date);

    // Calculer le numéro de semaine
    const weekNumber = Math.ceil((start.getTime() - new Date(start.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

    return t('pages.teamOfWeek.weekLabel', {
      week: weekNumber,
      year: start.getFullYear(),
      start: start.toLocaleDateString('fr-FR'),
      end: end.toLocaleDateString('fr-FR')
    });
  };

  // Handle NFT click - now uses cached collection data
  const handleNFTClick = (nftId: string) => {
    const nft = nftMap.get(nftId);
    if (nft) {
      setSelectedNFT(nft);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedNFT(null), 300);
  };

  useEffect(() => {
    refetch();
  }, []);
  
  // NFT details are now automatically loaded via useNFTsByIdentifiers hook
  // which uses the cached collection data

  // Show loading skeleton while data is being fetched
  // The hook now properly handles initial loading state to prevent showing "no teams" message
  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <TeamOfWeekSkeleton playerCount={11} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">{t('pages.teamOfWeek.error.icon')}</div>
          <h3 className="text-xl font-semibold text-[var(--mvx-text-color-primary)] mb-2">
            {t('pages.teamOfWeek.error.title')}
          </h3>
          <p className="text-[var(--mvx-text-color-secondary)] mb-6">
            {error}
          </p>
          <Button
            variant="primary"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            {t('pages.teamOfWeek.error.retry')}
          </Button>
        </div>
      </div>
    );
  }

  // Only show empty state if we have finished loading and there's confirmed no teams
  // This should rarely happen as there should always be teams
  if (teams.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">{t('pages.teamOfWeek.empty.icon')}</div>
          <h3 className="text-xl font-semibold text-[var(--mvx-text-color-primary)] mb-2">
            {t('pages.teamOfWeek.empty.title')}
          </h3>
          <p className="text-[var(--mvx-text-color-secondary)]">
            {t('pages.teamOfWeek.empty.subtitle')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex flex-col items-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[var(--mvx-text-accent-color)] to-[var(--mvx-text-accent-color)]/70 rounded-full mb-4">
            <span className="text-3xl">⭐</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--mvx-text-color-primary)]">
              {t('pages.teamOfWeek.title')}
            </h1>

            {/* Refresh Button */}
            <div className="flex items-center gap-3">
              {lastUpdated && !loading && (
                <span className="text-xs text-[var(--mvx-text-color-tertiary)]">
                  {t('pages.teamOfWeek.lastUpdate', {
                    time: lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  })}
                </span>
              )}
            <Button
              variant="secondary"
              size="small"
              onClick={() => refetch()}
                disabled={isRefetching}
                className="flex items-center gap-2"
              >
                <span className={isRefetching ? 'animate-spin' : ''}>🔄</span>
                {isRefetching ? t('pages.teamOfWeek.refreshing') : t('pages.teamOfWeek.refresh')}
              </Button>
            </div>
          </div>
        </div>

        {/* Sélecteur de semaine */}
        <div className="max-w-md mx-auto">
          <select
            value={selectedTeam?.id || ''}
            onChange={(e) => {
              const team = teams.find((t: TeamOfWeekType) => t.id === e.target.value);
              setSelectedTeam(team || null);
            }}
            className="w-full px-4 py-3 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
          >
            {teams.map((team: TeamOfWeekType) => (
              <option key={team.id} value={team.id}>
                {formatWeekLabel(team)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Affichage de l'équipe sélectionnée */}
      {selectedTeam && (
        <div className="space-y-8">
          {/* Informations de la semaine */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--mvx-text-color-primary)] mb-2">
              {selectedTeam.title}
            </h2>
            {selectedTeam.description && (
              <p className="text-[var(--mvx-text-color-secondary)] mb-4">
                {selectedTeam.description}
              </p>
            )}
            <div className="flex items-center justify-center space-x-6 text-[var(--mvx-text-color-secondary)]">
              <div className="flex items-center space-x-2">
                <span>📅</span>
                <span>
                  {t('pages.teamOfWeek.info.weekDates', {
                    start: new Date(selectedTeam.week_start_date).toLocaleDateString('fr-FR'),
                    end: new Date(selectedTeam.week_end_date).toLocaleDateString('fr-FR')
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>👥</span>
                <span>
                  {t('pages.teamOfWeek.info.playersCount', {
                    count: selectedTeam.players.length
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Liste des joueurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {selectedTeam.players.map((player: Player, index: number) => {
              // Get NFT data from cached collection
              const nft = nftMap.get(player.nftId);
              
              // Use NFT data if available, otherwise use player data from Supabase
              const displayName = nft?.realPlayerName || player.name;
              const thumbnailUrl = nft?.imageUrl;
              const position = nft?.position || player.position || 'Unknown';
              const rarity = nft?.rarity || player.rarity || 'Common';
              const nationality = nft?.attributes?.nationality as string | undefined;
              
              return (
                <button
                  key={`${player.id}-${index}`}
                  onClick={() => player.nftId && handleNFTClick(player.nftId)}
                  disabled={!nft}
                  className="relative group bg-gradient-to-br from-[var(--mvx-bg-color-secondary)] to-[var(--mvx-bg-color-primary)] p-0.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="bg-[var(--mvx-bg-color-secondary)] rounded-xl overflow-hidden h-full">
                    {/* Image NFT */}
                    {thumbnailUrl ? (
                      <div className="relative aspect-square overflow-hidden flex items-center justify-center">
                        <img
                          src={thumbnailUrl}
                          alt={displayName}
                          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                        
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Badge de rareté */}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full backdrop-blur-sm ${
                            rarity === 'Mythic' ? 'bg-purple-500/90 text-white' :
                            rarity === 'Legendary' ? 'bg-yellow-500/90 text-yellow-900' :
                            rarity === 'Epic' ? 'bg-purple-400/90 text-white' :
                            rarity === 'Rare' ? 'bg-blue-500/90 text-white' :
                            'bg-gray-500/90 text-white'
                          }`}>
                            {rarity}
                          </span>
                        </div>

                        {/* Position badge */}
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 text-xs font-bold rounded-full bg-[var(--mvx-text-accent-color)]/90 text-white backdrop-blur-sm">
                            {position}
                          </span>
                        </div>
                        
                        {/* Nationality flag (if available) */}
                        {nationality && (
                          <div className="absolute bottom-2 left-2">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-black/70 text-white backdrop-blur-sm">
                              {nationality}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center animate-pulse">
                        <div className="text-center flex flex-col items-center justify-center h-full">
                          <div className="text-4xl mb-2 opacity-50">🎴</div>
                          {nftLoading && (
                            <div className="text-sm text-gray-400 flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent"></div>
                              {t('pages.teamOfWeek.placeholder.playerCard.loading')}
                            </div>
                          )}
                          {!nftLoading && !nft && (
                            <div className="text-xs text-gray-500 px-2">
                              {t('pages.teamOfWeek.placeholder.playerCard.notFound')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Informations du joueur */}
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-[var(--mvx-text-color-primary)] mb-1 truncate" title={displayName}>
                        {displayName}
                      </h3>
                      
                      {/* Score and Rank if available */}
                      {nft && (nft.score || nft.rank) && (
                        <div className="flex items-center justify-between text-xs text-[var(--mvx-text-color-secondary)]">
                          {nft.rank && (
                            <span className="flex items-center gap-1">
                              🏆 #{nft.rank}
                            </span>
                          )}
                          {nft.score && (
                            <span className="flex items-center gap-1">
                              ⭐ {nft.score.toFixed(1)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Fullscreen icon */}
                    {nft && (
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-[var(--mvx-text-accent-color)]/80 transition-colors duration-200">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Warning if some NFTs are missing */}
          {!allFound && missingIdentifiers.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h4 className="font-bold text-[var(--mvx-text-color-primary)] mb-2">
                    {missingIdentifiers.length} NFT(s) non trouvé(s)
                  </h4>
                  <p className="text-sm text-[var(--mvx-text-color-secondary)] mb-2">
                    Les NFTs suivants sont dans la team mais n'ont pas été trouvés dans la collection :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {missingIdentifiers.map(id => (
                      <code key={id} className="text-xs bg-black/20 px-2 py-1 rounded">
                        {id}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Stats rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[var(--mvx-bg-color-secondary)] rounded-xl p-4 text-center border border-[var(--mvx-border-color-secondary)]">
              <div className="text-2xl mb-2">🎴</div>
              <div className="text-2xl font-bold text-[var(--mvx-text-color-primary)]">
                {nfts.length}
              </div>
              <div className="text-xs text-[var(--mvx-text-color-secondary)]">
                {t('pages.teamOfWeek.placeholder.stats.nftsFound')}
              </div>
            </div>

            <div className="bg-[var(--mvx-bg-color-secondary)] rounded-xl p-4 text-center border border-[var(--mvx-border-color-secondary)]">
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-[var(--mvx-text-color-primary)]">
                {nfts.filter(n => n.rarity === 'Legendary' || n.rarity === 'Mythic').length}
              </div>
              <div className="text-xs text-[var(--mvx-text-color-secondary)]">
                {t('pages.teamOfWeek.placeholder.stats.legendary')}
              </div>
            </div>

            <div className="bg-[var(--mvx-bg-color-secondary)] rounded-xl p-4 text-center border border-[var(--mvx-border-color-secondary)]">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-[var(--mvx-text-color-primary)]">
                {nfts.reduce((sum, n) => sum + (n.rank || 0), 0) > 0
                  ? Math.round(nfts.reduce((sum, n) => sum + (n.rank || 0), 0) / nfts.filter(n => n.rank).length)
                  : '-'}
              </div>
              <div className="text-xs text-[var(--mvx-text-color-secondary)]">
                {t('pages.teamOfWeek.placeholder.stats.averageRank')}
              </div>
            </div>

            <div className="bg-[var(--mvx-bg-color-secondary)] rounded-xl p-4 text-center border border-[var(--mvx-border-color-secondary)]">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-[var(--mvx-text-color-primary)]">
                {nfts.reduce((sum, n) => sum + (n.score || 0), 0) > 0
                  ? (nfts.reduce((sum, n) => sum + (n.score || 0), 0) / nfts.filter(n => n.score).length).toFixed(1)
                  : '-'}
              </div>
              <div className="text-xs text-[var(--mvx-text-color-secondary)]">
                {t('pages.teamOfWeek.placeholder.stats.averageScore')}
              </div>
            </div>
          </div>

          {/* Footer avec informations */}
          <div className="text-center text-sm text-[var(--mvx-text-color-tertiary)] border-t border-[var(--mvx-border-color-secondary)] pt-6">
            <p>
              {t('pages.teamOfWeek.info.created', {
                date: new Date(selectedTeam.created_at).toLocaleDateString('fr-FR'),
                updatedDate: new Date(selectedTeam.updated_at).toLocaleDateString('fr-FR')
              })}
            </p>
          </div>
        </div>
      )}

      {/* NFT Detail Modal */}
      <NFTDetailModal
        nft={selectedNFT}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

