import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TeamOfWeekService } from 'features/teamOfWeek/services';
import { useBatchNFTDetails } from 'features/teamOfWeek/hooks';
import { NFTDetailModal } from 'features/myNFTs/components/NFTDetailModal';
import type { TeamOfWeek as TeamOfWeekType } from 'features/teamOfWeek/types';
import type { NFTDetails } from 'features/teamOfWeek/hooks';
import type { GalacticXNFT } from 'features/myNFTs';

export const TeamOfWeek = () => {
  const { t } = useTranslation();
  const [teams, setTeams] = useState<TeamOfWeekType[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamOfWeekType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<GalacticXNFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nftDetailsMap, setNftDetailsMap] = useState<Map<string, NFTDetails>>(new Map());
  const [nftLoading, setNftLoading] = useState(false);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const allTeams = await TeamOfWeekService.getAllTeamsOfWeek();
      setTeams(allTeams);
      
      // Sélectionner la semaine courante par défaut
      const currentWeek = getCurrentWeek();
      const currentTeam = allTeams.find(team => 
        isTeamInCurrentWeek(team, currentWeek.year, currentWeek.weekNumber)
      );
      
      setSelectedTeam(currentTeam || (allTeams.length > 0 ? allTeams[0] : null));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
      console.error('Error loading teams:', err);
    } finally {
      setLoading(false);
    }
  };

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
    
    return `Semaine ${weekNumber} (${start.getFullYear()}) - ${start.toLocaleDateString('fr-FR')} au ${end.toLocaleDateString('fr-FR')}`;
  };

  // Charger les détails des NFTs quand une team est sélectionnée
  const loadNFTDetails = async (nftIds: string[]) => {
    if (nftIds.length === 0) return;
    
    setNftLoading(true);
    const detailsMap = new Map<string, NFTDetails>();
    
    try {
      // Récupérer les détails depuis le cache ou l'API
      const promises = nftIds.map(async (nftId) => {
        try {
          const response = await fetch(
            `https://api.multiversx.com/nfts/${nftId}`,
            {
              headers: {
                'accept': 'application/json'
              }
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch NFT ${nftId}`);
          }

          const data: NFTDetails = await response.json();
          detailsMap.set(nftId, data);
        } catch (err) {
          console.error(`Error fetching NFT ${nftId}:`, err);
        }
      });

      await Promise.all(promises);
      setNftDetailsMap(detailsMap);
    } catch (error) {
      console.error('Error loading NFT details:', error);
    } finally {
      setNftLoading(false);
    }
  };

  // Convertir NFTDetails en GalacticXNFT pour le modal
  const convertToGalacticXNFT = (nftDetails: NFTDetails): GalacticXNFT => {
    const playerName = nftDetails.metadata.attributes.find(attr => attr.trait_type === 'Name')?.value || '';
    
    return {
      identifier: nftDetails.identifier,
      collection: nftDetails.collection,
      nonce: nftDetails.nonce,
      name: nftDetails.name,
      rarity: getRarityFromMetadata(nftDetails.metadata),
      position: getPositionFromMetadata(nftDetails.metadata),
      imageUrl: nftDetails.media[0]?.thumbnailUrl || nftDetails.url || '',
      videoUrl: nftDetails.media[0]?.url || '',
      score: 0,
      rank: 0,
      realPlayerName: playerName, // Pour le lien Transfermarkt
      attributes: {
        playerName: playerName,
        number: nftDetails.metadata.attributes.find(attr => attr.trait_type === 'Number')?.value || '',
        nationality: nftDetails.metadata.attributes.find(attr => attr.trait_type === 'Nationality')?.value || '',
        performance1: nftDetails.metadata.attributes.find(attr => attr.trait_type === 'Performance 1')?.value || '',
        performance2: nftDetails.metadata.attributes.find(attr => attr.trait_type === 'Performance 2')?.value || '',
        performance3: nftDetails.metadata.attributes.find(attr => attr.trait_type === 'Performance 3')?.value || '',
        performance4: nftDetails.metadata.attributes.find(attr => attr.trait_type === 'Performance 4')?.value || ''
      }
    };
  };

  const getRarityFromMetadata = (metadata: any): GalacticXNFT['rarity'] => {
    // Logic to determine rarity, could be based on attributes or other metadata
    return 'Common'; // Default, adjust based on your logic
  };

  const getPositionFromMetadata = (metadata: any): string => {
    return metadata.attributes.find((attr: any) => attr.trait_type === 'Position')?.value || '';
  };

  const handleNFTClick = (nftId: string) => {
    const nftDetails = nftDetailsMap.get(nftId);
    if (nftDetails) {
      const galacticNFT = convertToGalacticXNFT(nftDetails);
      setSelectedNFT(galacticNFT);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedNFT(null), 300);
  };

  useEffect(() => {
    loadTeams();
  }, []);

  // Charger les NFT details quand une team est sélectionnée
  useEffect(() => {
    if (selectedTeam && selectedTeam.players.length > 0) {
      const nftIds = selectedTeam.players
        .map(player => player.nftId)
        .filter(Boolean) as string[];
      
      if (nftIds.length > 0) {
        loadNFTDetails(nftIds);
      }
    }
  }, [selectedTeam]);

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-[var(--mvx-text-color-secondary)]">
            🔄 Chargement de la Team of the Week...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-[var(--mvx-text-color-primary)] mb-2">
            Erreur de chargement
          </h3>
          <p className="text-[var(--mvx-text-color-secondary)] mb-6">
            {error}
          </p>
          <button
            onClick={loadTeams}
            className="px-6 py-3 bg-[var(--mvx-text-accent-color)] text-white rounded-lg hover:opacity-80 transition-opacity"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold text-[var(--mvx-text-color-primary)] mb-2">
            Aucune Team of the Week
          </h3>
          <p className="text-[var(--mvx-text-color-secondary)]">
            Aucune équipe n'a encore été sélectionnée.
            Revenez bientôt pour découvrir les joueurs vedettes !
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[var(--mvx-text-accent-color)] to-[var(--mvx-text-accent-color)]/70 rounded-full mb-6">
          <span className="text-3xl">⭐</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
          Team of the Week
        </h1>
        
        {/* Sélecteur de semaine */}
        <div className="max-w-md mx-auto mb-6">
          <select
            value={selectedTeam?.id || ''}
            onChange={(e) => {
              const team = teams.find(t => t.id === e.target.value);
              setSelectedTeam(team || null);
            }}
            className="w-full px-4 py-3 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
          >
            {teams.map((team) => (
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
                  {new Date(selectedTeam.week_start_date).toLocaleDateString('fr-FR')} - {new Date(selectedTeam.week_end_date).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>👥</span>
                <span>{selectedTeam.players.length} joueurs sélectionnés</span>
              </div>
            </div>
          </div>

          {/* Liste des joueurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {selectedTeam.players.map((player, index) => {
              const nftDetails = nftDetailsMap.get(player.nftId);
              const thumbnailUrl = nftDetails?.media[0]?.thumbnailUrl || nftDetails?.url;
              
              return (
                <button
                  key={`${player.id}-${index}`}
                  onClick={() => player.nftId && handleNFTClick(player.nftId)}
                  className="relative group bg-gradient-to-br from-[var(--mvx-bg-color-secondary)] to-[var(--mvx-bg-color-primary)] p-0.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
                >
                  <div className="bg-[var(--mvx-bg-color-secondary)] rounded-xl overflow-hidden h-full">
                    {/* Image NFT */}
                    {thumbnailUrl ? (
                      <div className="relative aspect-square overflow-hidden flex items-center justify-center">
                        <img
                          src={thumbnailUrl}
                          alt={player.name}
                          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                        
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Badge de rareté */}
                        {player.rarity && (
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 text-xs font-bold rounded-full backdrop-blur-sm ${
                              player.rarity === 'Legendary' ? 'bg-yellow-500/90 text-yellow-900' :
                              player.rarity === 'Epic' ? 'bg-purple-500/90 text-white' :
                              player.rarity === 'Rare' ? 'bg-blue-500/90 text-white' :
                              'bg-gray-500/90 text-white'
                            }`}>
                              {player.rarity}
                            </span>
                          </div>
                        )}

                        {/* Position badge */}
                        {player.position && (
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-[var(--mvx-text-accent-color)]/90 text-white backdrop-blur-sm">
                              {player.position}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                        <div className="text-center flex flex-col items-center justify-center h-full">
                          <div className="text-4xl mb-2">🎴</div>
                          {nftLoading && <div className="text-sm text-gray-400">Chargement...</div>}
                        </div>
                      </div>
                    )}

                    {/* Informations du joueur */}
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-[var(--mvx-text-color-primary)] mb-1 truncate">
                        {player.name}
                      </h3>
                    </div>
                    
                    {/* Fullscreen icon */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-[var(--mvx-text-accent-color)]/80 transition-colors duration-200">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer avec informations */}
          <div className="text-center text-sm text-[var(--mvx-text-color-tertiary)] border-t border-[var(--mvx-border-color-secondary)] pt-6">
            <p>
              Team créée le {new Date(selectedTeam.created_at).toLocaleDateString('fr-FR')} • 
              Dernière mise à jour le {new Date(selectedTeam.updated_at).toLocaleDateString('fr-FR')}
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

