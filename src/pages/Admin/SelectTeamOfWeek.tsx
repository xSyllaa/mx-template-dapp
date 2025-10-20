import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'contexts';
import { TeamOfWeekService, PlayerSearchService } from 'features/teamOfWeek/services';
import { useBatchNFTHolders } from 'features/teamOfWeek/hooks';
import type { PlayerSearchResult, NFTHolder, CreateTeamOfWeekData, PlayerWithHolders } from 'features/teamOfWeek/types';

export const SelectTeamOfWeek = () => {
  const { t } = useTranslation();
  const { supabaseUserId } = useAuth();
  
  // État de l'étape actuelle
  const [step, setStep] = useState<'week' | 'players' | 'holders'>('week');
  
  // Données de la semaine
  const [weekNumber, setWeekNumber] = useState('');
  const [year, setYear] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [weekDates, setWeekDates] = useState({ start: '', end: '' });
  
  // Données des joueurs
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlayerSearchResult[]>([]);
  
  // Données des holders
  const [playersWithHolders, setPlayersWithHolders] = useState<Map<string, NFTHolder[]>>(new Map());
  const [loadingHolders, setLoadingHolders] = useState(false);
  const [allHolders, setAllHolders] = useState<string[]>([]);
  
  // États généraux
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Mode d'affichage des holders
  const [holdersDisplayMode, setHoldersDisplayMode] = useState<'nfts' | 'addresses'>('nfts');

  const { fetchBatchHolders, loading: batchLoading, progress } = useBatchNFTHolders();

  // Initialiser les valeurs par défaut
  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Calculer le numéro de semaine ISO
    const weekNumber = getWeekNumber(today);
    
    setYear(currentYear.toString());
    setWeekNumber(weekNumber.toString());
    
    // Calculer les dates de la semaine
    const { startDate, endDate } = getWeekDates(currentYear, weekNumber);
    setWeekDates({ start: startDate, end: endDate });
    setTitle(`Team of the Week - Semaine ${weekNumber} (${currentYear})`);
  }, []);

  // Fonction pour calculer le numéro de semaine ISO
  const getWeekNumber = (date: Date): number => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  };

  // Fonction pour calculer les dates de début et fin d'une semaine
  const getWeekDates = (year: number, weekNumber: number) => {
    const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    
    const ISOweekEnd = new Date(ISOweekStart);
    ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
    
    return {
      startDate: ISOweekStart.toISOString().split('T')[0],
      endDate: ISOweekEnd.toISOString().split('T')[0]
    };
  };

  // Recalculer les dates quand la semaine ou l'année change
  useEffect(() => {
    if (weekNumber && year) {
      const { startDate, endDate } = getWeekDates(parseInt(year), parseInt(weekNumber));
      setWeekDates({ start: startDate, end: endDate });
      setTitle(`Team of the Week - Semaine ${weekNumber} (${year})`);
    }
  }, [weekNumber, year]);

  // Recherche de joueurs
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = PlayerSearchService.searchPlayers(searchQuery, 20);
      const filteredResults = results.filter(
        result => !selectedPlayers.some(selected => selected.id === result.id)
      );
      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedPlayers]);

  const handlePlayerSelect = (player: PlayerSearchResult) => {
    if (selectedPlayers.length >= 15) {
      setError('Vous ne pouvez sélectionner que 15 joueurs maximum');
      return;
    }
    
    setSelectedPlayers(prev => [...prev, player]);
    setSearchQuery('');
    setError(null);
  };

  const handlePlayerRemove = (playerId: string) => {
    setSelectedPlayers(prev => prev.filter(p => p.id !== playerId));
    setPlayersWithHolders(prev => {
      const newMap = new Map(prev);
      newMap.delete(playerId);
      return newMap;
    });
  };

  const handleNextStep = async () => {
    if (step === 'week') {
      if (!weekNumber || !year || !title.trim()) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      // Vérifier si la semaine existe déjà
      const weekExists = await TeamOfWeekService.checkWeekExists(weekDates.start, weekDates.end);
      if (weekExists) {
        setError(`Une Team of the Week existe déjà pour cette période (${weekDates.start} - ${weekDates.end})`);
        return;
      }
      
      setStep('players');
      setError(null);
    } else if (step === 'players') {
      if (selectedPlayers.length === 0) {
        setError('Veuillez sélectionner au moins un joueur');
        return;
      }
      setStep('holders');
      setError(null);
    }
  };

  const handlePreviousStep = () => {
    if (step === 'players') {
      setStep('week');
    } else if (step === 'holders') {
      setStep('players');
    }
    setError(null);
  };

  const fetchAllHolders = async () => {
    if (selectedPlayers.length === 0) return;
    
    setLoadingHolders(true);
    setError(null);
    
    try {
      // Préparer les NFT IDs
      const nftIds = selectedPlayers
        .filter(player => player.nftId)
        .map(player => player.nftId);
      
      if (nftIds.length === 0) {
        setError('Aucun NFT ID trouvé pour les joueurs sélectionnés');
        return;
      }
      
      // Récupérer tous les holders en batch
      const nftHoldersMap = await fetchBatchHolders(nftIds);
      
      // Mapper les résultats par player ID
      const playersHoldersMap = new Map<string, NFTHolder[]>();
      const allAddresses = new Set<string>();
      
      selectedPlayers.forEach(player => {
        const holders = player.nftId ? (nftHoldersMap.get(player.nftId) || []) : [];
        playersHoldersMap.set(player.id, holders);
        
        holders.forEach(holder => {
          allAddresses.add(holder.address);
        });
      });
      
      setPlayersWithHolders(playersHoldersMap);
      setAllHolders(Array.from(allAddresses));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération';
      setError(errorMessage);
    } finally {
      setLoadingHolders(false);
    }
  };

  const copyCurrentMode = () => {
    if (holdersDisplayMode === 'addresses') {
      copyAddressesWithCounts();
    } else {
      copyNFTsWithAddresses();
    }
  };

  const copyNFTsWithAddresses = () => {
    if (selectedPlayers.length === 0) return;
    
    let content = '';
    selectedPlayers.forEach(player => {
      const holders = playersWithHolders.get(player.id) || [];
      if (holders.length > 0) {
        content += `${player.name} (${player.nftId}):\n`;
        holders.forEach(holder => {
          content += `  ${holder.address} (${holder.balance})\n`;
        });
        content += '\n';
      }
    });
    
    navigator.clipboard.writeText(content.trim());
    setSuccess('Liste des NFTs avec adresses copiée !');
    setTimeout(() => setSuccess(null), 3000);
  };

  const copyAddressesWithCounts = () => {
    if (allHolders.length === 0) return;
    
    // Créer un map pour compter les NFTs par adresse
    const addressCountMap = new Map<string, number>();
    
    selectedPlayers.forEach(player => {
      const holders = playersWithHolders.get(player.id) || [];
      holders.forEach(holder => {
        const currentCount = addressCountMap.get(holder.address) || 0;
        addressCountMap.set(holder.address, currentCount + parseInt(holder.balance));
      });
    });
    
    // Format CSV avec header
    let content = 'address,count\n';
    addressCountMap.forEach((count, address) => {
      content += `${address},${count}\n`;
    });
    
    navigator.clipboard.writeText(content.trim());
    setSuccess('Liste des adresses avec compteurs copiée en format CSV !');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSubmit = async () => {
    if (!supabaseUserId) {
      setError('Vous devez être connecté pour créer une Team of the Week');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Préparer les données des joueurs avec leurs détenteurs
      const playersData: PlayerWithHolders[] = selectedPlayers.map(player => ({
        ...player,
        holders: playersWithHolders.get(player.id) || []
      }));

      const teamData: CreateTeamOfWeekData = {
        title: title.trim(),
        description: description.trim() || undefined,
        week_start_date: weekDates.start,
        week_end_date: weekDates.end,
        players: playersData,
        total_holders: allHolders.length
      };

      await TeamOfWeekService.createTeamOfWeek(teamData, supabaseUserId);
      
      setSuccess('Team of the Week créée avec succès !');
      
      // Reset après 2 secondes
      setTimeout(() => {
        setStep('week');
        setSelectedPlayers([]);
        setPlayersWithHolders(new Map());
        setAllHolders([]);
        setSuccess(null);
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(errorMessage);
      console.error('Error creating team of week:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'border-yellow-400/50 bg-yellow-400/10';
      case 'Epic': return 'border-purple-400/50 bg-purple-400/10';
      case 'Rare': return 'border-blue-400/50 bg-blue-400/10';
      default: return 'border-[var(--mvx-border-color-secondary)] bg-[var(--mvx-bg-color-secondary)]';
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
          ⭐ Select Team of the Week
        </h1>
        <p className="text-lg text-[var(--mvx-text-color-secondary)]">
          Sélectionnez l'équipe de la semaine et récupérez les adresses des détenteurs
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            step === 'week' ? 'bg-[var(--mvx-text-accent-color)] text-white' : 
            'bg-[var(--mvx-bg-color-secondary)] text-[var(--mvx-text-color-secondary)]'
          }`}>
            <span>1</span>
            <span>Semaine</span>
          </div>
          
          <div className="w-8 h-0.5 bg-[var(--mvx-border-color-secondary)]"></div>
          
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            step === 'players' ? 'bg-[var(--mvx-text-accent-color)] text-white' : 
            'bg-[var(--mvx-bg-color-secondary)] text-[var(--mvx-text-color-secondary)]'
          }`}>
            <span>2</span>
            <span>Joueurs</span>
          </div>
          
          <div className="w-8 h-0.5 bg-[var(--mvx-border-color-secondary)]"></div>
          
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            step === 'holders' ? 'bg-[var(--mvx-text-accent-color)] text-white' : 
            'bg-[var(--mvx-bg-color-secondary)] text-[var(--mvx-text-color-secondary)]'
          }`}>
            <span>3</span>
            <span>Holders</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400">❌ {error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-400">✅ {success}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-[var(--mvx-bg-color-secondary)] rounded-lg p-6">
        {/* Étape 1: Sélection de la semaine */}
        {step === 'week' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
              📅 Sélectionner la semaine
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--mvx-text-color-primary)] mb-2">
                  Année *
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min="2020"
                  max="2030"
                  required
                  className="w-full px-4 py-3 bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--mvx-text-color-primary)] mb-2">
                  Numéro de semaine *
                </label>
                <input
                  type="number"
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(e.target.value)}
                  min="1"
                  max="53"
                  required
                  className="w-full px-4 py-3 bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
                />
              </div>
            </div>

            {/* Affichage des dates calculées */}
            {weekDates.start && weekDates.end && (
              <div className="p-4 bg-[var(--mvx-bg-accent-color)] rounded-lg">
                <h3 className="font-semibold text-[var(--mvx-text-color-primary)] mb-2">
                  📅 Période correspondante :
                </h3>
                <p className="text-[var(--mvx-text-color-secondary)]">
                  Du <strong>{new Date(weekDates.start).toLocaleDateString('fr-FR')}</strong> au <strong>{new Date(weekDates.end).toLocaleDateString('fr-FR')}</strong>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--mvx-text-color-primary)] mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--mvx-text-color-primary)] mb-2">
                Description (optionnel)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
              />
            </div>
          </div>
        )}

        {/* Étape 2: Sélection des joueurs */}
        {step === 'players' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--mvx-text-color-primary)]">
                👥 Sélectionner les joueurs ({selectedPlayers.length}/15)
              </h2>
            </div>
            
            {/* Recherche */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un joueur..."
                className="w-full px-4 py-3 bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] placeholder-[var(--mvx-text-color-tertiary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)]"
              />
              
              {/* Résultats de recherche */}
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((player) => (
                    <div
                      key={player.id}
                      onClick={() => handlePlayerSelect(player)}
                      className="px-4 py-3 cursor-pointer hover:bg-[var(--mvx-bg-accent-color)] transition-colors"
                    >
                      <div className="font-medium text-[var(--mvx-text-color-primary)]">
                        {player.name}
                      </div>
                      <div className="text-sm text-[var(--mvx-text-color-secondary)]">
                        {player.nftId}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Joueurs sélectionnés */}
            {selectedPlayers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`border-2 rounded-lg p-4 ${getRarityColor(player.rarity || 'Common')}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[var(--mvx-text-color-primary)]">
                          {player.name}
                        </h3>
                        <p className="text-sm text-[var(--mvx-text-color-secondary)]">
                          {player.nftId}
                        </p>
                      </div>
                      <button
                        onClick={() => handlePlayerRemove(player.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        ❌
                      </button>
                    </div>
                    
                    {player.rarity && (
                      <span className="text-xs font-medium text-[var(--mvx-text-accent-color)]">
                        {player.rarity}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Étape 3: Récupération des holders */}
        {step === 'holders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
              💰 Récupérer les holders
            </h2>
            
            <div className="text-center space-y-4">
              <p className="text-[var(--mvx-text-color-secondary)]">
                {selectedPlayers.length} joueurs sélectionnés
              </p>
              
              {allHolders.length === 0 && (
                <button
                  onClick={fetchAllHolders}
                  disabled={loadingHolders || batchLoading || selectedPlayers.length === 0}
                  className="px-8 py-4 bg-[var(--mvx-text-accent-color)] text-white rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                >
                  {loadingHolders || batchLoading ? (
                    <>
                      🔄 Récupération en cours... 
                      {progress.total > 0 && (
                        <span className="ml-2">({progress.current}/{progress.total})</span>
                      )}
                    </>
                  ) : (
                    '🔍 Récupérer tous les holders'
                  )}
                </button>
              )}
            </div>

            {/* Résultats */}
            {allHolders.length > 0 && (
              <div className="bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-[var(--mvx-text-color-primary)] mb-2">
                    🎉 Holders récupérés !
                  </h3>
                  <p className="text-[var(--mvx-text-color-secondary)]">
                    {allHolders.length} adresses uniques trouvées
                  </p>
                </div>

                {/* Mode d'affichage */}
                <div className="mb-6">
                  <div className="flex justify-center space-x-2 mb-4">
                    <button
                      onClick={() => setHoldersDisplayMode('nfts')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        holdersDisplayMode === 'nfts'
                          ? 'bg-[var(--mvx-text-accent-color)] text-white'
                          : 'bg-[var(--mvx-bg-color-secondary)] text-[var(--mvx-text-color-secondary)]'
                      }`}
                    >
                      📋 Par NFTs
                    </button>
                    <button
                      onClick={() => setHoldersDisplayMode('addresses')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        holdersDisplayMode === 'addresses'
                          ? 'bg-[var(--mvx-text-accent-color)] text-white'
                          : 'bg-[var(--mvx-bg-color-secondary)] text-[var(--mvx-text-color-secondary)]'
                      }`}
                    >
                      🏠 Par Adresses
                    </button>
                  </div>

                  {/* Affichage selon le mode */}
                  {holdersDisplayMode === 'nfts' ? (
                    <div className="max-h-60 overflow-y-auto space-y-3">
                      {selectedPlayers.map(player => {
                        const holders = playersWithHolders.get(player.id) || [];
                        if (holders.length === 0) return null;
                        
                        return (
                          <div key={player.id} className="border border-[var(--mvx-border-color-secondary)] rounded-lg p-3">
                            <h4 className="font-semibold text-[var(--mvx-text-color-primary)] mb-2">
                              {player.name} ({player.nftId})
                            </h4>
                            <div className="space-y-1">
                              {holders.map((holder, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <span className="font-mono text-[var(--mvx-text-color-secondary)]">
                                    {holder.address}
                                  </span>
                                  <span className="text-[var(--mvx-text-accent-color)]">
                                    {holder.balance}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {(() => {
                        const addressCountMap = new Map<string, number>();
                        
                        selectedPlayers.forEach(player => {
                          const holders = playersWithHolders.get(player.id) || [];
                          holders.forEach(holder => {
                            const currentCount = addressCountMap.get(holder.address) || 0;
                            addressCountMap.set(holder.address, currentCount + parseInt(holder.balance));
                          });
                        });
                        
                        return Array.from(addressCountMap.entries()).map(([address, count]) => (
                          <div key={address} className="flex items-center justify-between p-2 bg-[var(--mvx-bg-color-secondary)] rounded border border-[var(--mvx-border-color-secondary)]">
                            <span className="font-mono text-[var(--mvx-text-color-primary)] text-sm">
                              {address}
                            </span>
                            <span className="text-[var(--mvx-text-accent-color)] font-semibold">
                              {count} NFT(s)
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
                
                {/* Boutons d'action */}
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={copyCurrentMode}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    📋 Copier {holdersDisplayMode === 'nfts' ? 'NFTs avec adresses' : 'adresses avec compteurs'}
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[var(--mvx-text-accent-color)] text-white rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 font-medium text-sm"
                  >
                    {isSubmitting ? '🔄 Sauvegarde...' : '💾 Sauvegarder la Team'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={handlePreviousStep}
          disabled={step === 'week'}
          className="px-6 py-3 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] text-[var(--mvx-text-color-primary)] rounded-lg hover:bg-[var(--mvx-bg-accent-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Précédent
        </button>
        
        {step !== 'holders' && (
          <button
            onClick={handleNextStep}
            className="px-6 py-3 bg-[var(--mvx-text-accent-color)] text-white rounded-lg hover:opacity-80 transition-opacity"
          >
            Suivant →
          </button>
        )}
      </div>
    </div>
  );
};
