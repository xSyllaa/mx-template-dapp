import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAccount } from 'lib/sdkDapp';
import { useMyNFTs } from 'features/myNFTs';
import { FootballField, NFTListPanel, useWarGameTeam, SavedTeamsList, WarGameService } from 'features/warGames';
import { TeamService } from 'features/warGames/services/teamService';
import type { WarGameWithDetails } from 'features/warGames/types';
import { Button } from 'components/Button';
import { useAuth } from 'contexts/AuthContext';

type WarGameMode = 'select' | 'create' | 'join';

export const WarGames = () => {
  const { t } = useTranslation();
  const { address } = useGetAccount();
  const { isAuthenticated, supabaseUserId, signIn } = useAuth();
  
  // Test address functionality
  const [testAddress, setTestAddress] = useState('erd1z563juvyfl7etnev8ua65vzhx65ln0rp0m783hq2m2wgdxx6z83s9t2cmv');
  const [showTestInput, setShowTestInput] = useState(false);
  const [isLoadingTestAddress, setIsLoadingTestAddress] = useState(false);
  
  // Use test address by default, fallback to connected address
  const currentAddress = testAddress;
  const { nfts, hasNFTs, loading, error, fetchNFTsForAddress } = useMyNFTs(currentAddress, true);
  
  const {
    slots,
    draggedNFT,
    setDraggedNFT,
    placeNFT,
    removeNFT,
    clearTeam,
    loadTeam,
    getPlacedNFTs,
    isTeamComplete,
    placedCount,
    canDropOnSlot
  } = useWarGameTeam();
  
  // Saved teams state
  const [showSavedTeams, setShowSavedTeams] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [showTeamNameError, setShowTeamNameError] = useState(false);
  
  // War Game mode state
  const [warGameMode, setWarGameMode] = useState<WarGameMode>('select');
  const [openWarGames, setOpenWarGames] = useState<WarGameWithDetails[]>([]);
  const [selectedWarGameId, setSelectedWarGameId] = useState<string>('');
  const [pointsStake, setPointsStake] = useState<number>(100);
  const [entryDeadline, setEntryDeadline] = useState<string>('');
  const [loadingWarGames, setLoadingWarGames] = useState(false);
  const [activeWarGamesCount, setActiveWarGamesCount] = useState<number>(0);

  // Load active war games count on mount
  useEffect(() => {
    loadActiveWarGamesCount();
  }, []);

  // Load open war games when entering join mode
  useEffect(() => {
    if (warGameMode === 'join') {
      loadOpenWarGames();
    }
  }, [warGameMode]);

  const loadActiveWarGamesCount = async () => {
    try {
      const games = await WarGameService.getOpenWarGames();
      setActiveWarGamesCount(games.length);
    } catch (error) {
      console.error('Failed to load active war games count:', error);
    }
  };

  // Set default deadline when entering create mode
  useEffect(() => {
    if (warGameMode === 'create' && !entryDeadline) {
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);
      setEntryDeadline(tomorrow.toISOString().slice(0, 16));
    }
  }, [warGameMode]);

  // Debug logs (only on initial mount and key changes)
  useEffect(() => {
    console.log('⚔️ WarGames Debug:');
    console.log('- Connected Address:', address);
    console.log('- Test Address:', testAddress);
    console.log('- Current Address:', currentAddress);
    console.log('- NFTs count:', nfts.length);
    console.log('- Has NFTs:', hasNFTs);
    console.log('- Loading:', loading);
    console.log('- Wallet connected:', !!address);
    console.log('- Supabase authenticated:', isAuthenticated);
    console.log('- Supabase user ID:', supabaseUserId);
  }, [address, isAuthenticated]); // Ne se déclenche que si l'auth change

  const loadOpenWarGames = async () => {
    setLoadingWarGames(true);
    try {
      const games = await WarGameService.getOpenWarGames();
      setOpenWarGames(games);
      if (games.length > 0) {
        setSelectedWarGameId(games[0].id);
      }
    } catch (error) {
      console.error('Failed to load open war games:', error);
      alert(t('pages.warGames.messages.loadWarGamesError'));
    } finally {
      setLoadingWarGames(false);
    }
  };

  const handleTestAddressSearch = async () => {
    if (testAddress.trim()) {
      setIsLoadingTestAddress(true);
      try {
        await fetchNFTsForAddress(testAddress.trim());
      } finally {
        setIsLoadingTestAddress(false);
      }
    }
  };

  const handleDropNFT = (slotId: string, nft: any) => {
    placeNFT(slotId, nft);
  };

  const handleRemoveNFT = (slotId: string) => {
    removeNFT(slotId);
  };

  const handleSaveTeam = async () => {
    if (!teamName.trim()) {
      setShowTeamNameError(true);
      return;
    }
    
    if (!isAuthenticated) {
      try {
        await signIn();
        // After successful sign in, try saving again
        setTimeout(() => handleSaveTeam(), 1000);
        return;
      } catch (error) {
        alert('Please sign the message to authenticate and save your team.');
        return;
      }
    }
    
    setShowTeamNameError(false);
    
    try {
      const savedSlots = TeamService.convertSlotsToSavedSlots(slots);
      await TeamService.createTeam({
        teamName: teamName.trim(),
        formation: '4-4-2',
        slots: savedSlots
      }, supabaseUserId!);
      
      setTeamName('');
      setShowSavedTeams(true);
      console.log('Team saved successfully!');
    } catch (error) {
      console.error('Failed to save team:', error);
      
      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('Database table not found')) {
          alert('Database setup required: Please run the migration script in Supabase dashboard to create the teams table.');
        } else if (error.message.includes('User not authenticated')) {
          alert('Please sign the message to authenticate and save your team.');
        } else if (error.message.includes('Authentication error')) {
          alert('Authentication error. Please refresh the page and try again.');
        } else {
          alert(`Failed to save team: ${error.message}`);
        }
      } else {
        alert('Failed to save team. Please try again.');
      }
    }
  };

  const handleSubmitWarGame = async () => {
    if (!isTeamComplete) {
      alert(t('pages.warGames.messages.teamIncomplete'));
      return;
    }

    if (!isAuthenticated) {
      try {
        await signIn();
        setTimeout(() => handleSubmitWarGame(), 1000);
        return;
      } catch (error) {
        alert(t('pages.warGames.messages.authRequired'));
        return;
      }
    }

    try {
      // First, save the team
      const savedSlots = TeamService.convertSlotsToSavedSlots(slots);
      const teamName = `War Game Team - ${new Date().toLocaleDateString()}`;
      const savedTeam = await TeamService.createTeam({
        teamName,
        formation: '4-4-2',
        slots: savedSlots
      }, supabaseUserId!);

      // Then create or join the war game
      if (warGameMode === 'create') {
        if (pointsStake <= 0) {
          alert(t('pages.warGames.create.errors.invalidPoints'));
          return;
        }
        if (!entryDeadline) {
          alert(t('pages.warGames.create.errors.invalidDeadline'));
          return;
        }

        await WarGameService.createWarGame({
          teamId: savedTeam.id,
          pointsStake,
          entryDeadline
        }, supabaseUserId!);

        alert('✅ ' + t('pages.warGames.messages.createSuccess'));
        // Reset to selection mode and reload count
        clearTeam();
        setWarGameMode('select');
        setPointsStake(100);
        setEntryDeadline('');
        loadActiveWarGamesCount();
      } else if (warGameMode === 'join') {
        if (!selectedWarGameId) {
          alert(t('pages.warGames.join.errors.selectWarGame'));
          return;
        }

        await WarGameService.joinWarGame({
          warGameId: selectedWarGameId,
          teamId: savedTeam.id
        }, supabaseUserId!);

        alert('✅ ' + t('pages.warGames.messages.joinSuccess'));
        // Reset to selection mode and reload count
        clearTeam();
        setWarGameMode('select');
        setSelectedWarGameId('');
        loadActiveWarGamesCount();
      }
    } catch (error) {
      console.error('Failed to submit war game:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(t('pages.warGames.messages.genericError'));
      }
    }
  };

  const handleLoadTeam = (team: any) => {
    try {
      // Clear current team first
      clearTeam();
      
      // Load the team using the new loadTeam function
      loadTeam(team.slots, nfts);
      
      console.log('Team loaded successfully:', team.teamName);
    } catch (error) {
      console.error('Failed to load team:', error);
    }
  };

  const handleClearTeam = () => {
    clearTeam();
  };

  // Loading state
  if (loading || isLoadingTestAddress) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="animate-spin inline-block w-16 h-16 border-4 border-secondary border-t-accent rounded-full mb-4"></div>
          <p className="text-lg text-[var(--mvx-text-color-secondary)]">
            {isLoadingTestAddress ? t('pages.warGames.testMode.loading') : t('common.loading')}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-2xl mb-4 text-[var(--mvx-text-color-primary)] font-bold">
            {t('pages.warGames.errors.loadingError')}
          </p>
          <p className="text-sm mb-6 text-[var(--mvx-text-color-secondary)]">{error.message}</p>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!address) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-8xl mb-6">🔒</div>
          <p className="text-2xl text-[var(--mvx-text-color-primary)] mb-2 font-bold">
            {t('pages.warGames.notConnected.title')}
          </p>
          <p className="text-md text-[var(--mvx-text-color-secondary)]">
            {t('pages.warGames.notConnected.subtitle')}
          </p>
        </div>
      </div>
    );
  }

  // Not enough NFTs state
  if (!hasNFTs || nfts.length < 11) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-8xl mb-6">📭</div>
          <p className="text-2xl text-[var(--mvx-text-color-primary)] mb-2 font-bold">
            {t('pages.warGames.errors.notEnoughNFTs')}
          </p>
          <p className="text-md text-[var(--mvx-text-color-secondary)] mb-6">
            {t('pages.warGames.errors.needMoreNFTs', { current: nfts.length, needed: 11 })}
          </p>
          
          {/* Test Address Input */}
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setShowTestInput(!showTestInput)}
              className="text-sm text-[var(--mvx-text-color-secondary)] hover:text-[var(--mvx-text-color-primary)] underline mb-4"
            >
              {showTestInput ? t('pages.warGames.testMode.hide') : t('pages.warGames.testMode.show')}
            </button>
            
            {showTestInput && (
              <div className="flex gap-2 p-4 rounded-lg bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)]">
                <input
                  type="text"
                  value={testAddress}
                  onChange={(e) => setTestAddress(e.target.value)}
                  placeholder={t('pages.warGames.testMode.placeholder')}
                  className="flex-1 px-3 py-2 rounded-lg bg-[var(--mvx-bg-color-primary)] text-[var(--mvx-text-color-primary)] border border-[var(--mvx-border-color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--mvx-text-accent-color)]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && testAddress.trim() && !isLoadingTestAddress) {
                      handleTestAddressSearch();
                    }
                  }}
                />
                <button
                  onClick={handleTestAddressSearch}
                  disabled={!testAddress.trim() || isLoadingTestAddress}
                  className="px-4 py-2 rounded-lg bg-[var(--mvx-text-accent-color)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {t('pages.warGames.testMode.search')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--mvx-text-color-primary)] to-[var(--mvx-text-accent-color)] bg-clip-text text-transparent">
          ⚔️ {t('pages.warGames.title')}
        </h1>
        <p className="text-lg text-[var(--mvx-text-color-secondary)]">
          {t('pages.warGames.subtitle')}
        </p>
      </div>
          {warGameMode !== 'select' && (
            <Button
              onClick={() => {
                clearTeam();
                setWarGameMode('select');
              }}
              variant="secondary"
            >
              ← {t('common.back')}
            </Button>
          )}
        </div>
      </div>

      {/* War Game Mode Selection */}
      {warGameMode === 'select' && (
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          {/* Active War Games Counter */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-full">
              <span className="text-2xl">⚔️</span>
              <span className="text-[var(--mvx-text-color-primary)] font-semibold">
                {t('pages.warGames.activeCount', { count: activeWarGamesCount })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            {/* Create War Game */}
            <button
              onClick={() => setWarGameMode('create')}
              className="bg-[var(--mvx-bg-color-secondary)] border-2 border-[var(--mvx-border-color-secondary)] hover:border-[var(--mvx-text-accent-color)] rounded-xl p-8 transition-all group"
            >
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-[var(--mvx-text-color-primary)] mb-3 group-hover:text-[var(--mvx-text-accent-color)] transition-colors">
                {t('pages.warGames.mode.create.title')}
              </h3>
              <p className="text-[var(--mvx-text-color-secondary)]">
                {t('pages.warGames.mode.create.description')}
              </p>
            </button>

            {/* Join War Game */}
            <button
              onClick={() => setWarGameMode('join')}
              className="bg-[var(--mvx-bg-color-secondary)] border-2 border-[var(--mvx-border-color-secondary)] hover:border-[var(--mvx-text-accent-color)] rounded-xl p-8 transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[var(--mvx-border-color-secondary)]"
              disabled={activeWarGamesCount === 0}
            >
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold text-[var(--mvx-text-color-primary)] mb-3 group-hover:text-[var(--mvx-text-accent-color)] transition-colors">
                {t('pages.warGames.mode.join.title')}
              </h3>
              <p className="text-[var(--mvx-text-color-secondary)]">
                {t('pages.warGames.mode.join.description')}
              </p>
              {activeWarGamesCount === 0 && (
                <p className="text-yellow-500 text-sm mt-2">
                  {t('pages.warGames.mode.join.noGamesAvailable')}
                </p>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Create/Join War Game Interface */}
      {warGameMode !== 'select' && (
        <>
          {/* War Game Configuration */}
          {warGameMode === 'create' && (
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
                    onChange={(e) => setPointsStake(parseInt(e.target.value) || 0)}
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
                    onChange={(e) => setEntryDeadline(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-2 bg-[var(--mvx-bg-color-primary)] text-[var(--mvx-text-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mvx-text-accent-color)]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Join War Game - Dropdown */}
          {warGameMode === 'join' && (
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
                    onChange={(e) => setSelectedWarGameId(e.target.value)}
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
          )}

          {/* Team Building Interface - Only show if not in select mode */}
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)] max-h-[800px] min-h-[500px]">
        {/* Football Field - Left side */}
        <div className="flex-1 lg:flex-[2] min-h-0">
          <div className="h-full bg-[var(--mvx-bg-color-secondary)] rounded-lg p-4 flex flex-col">
            <div className="mb-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-[var(--mvx-text-color-primary)]">
                  {t('pages.warGames.field.title')}
                </h3>
                <p className="text-sm text-[var(--mvx-text-color-secondary)]">
                  {t('pages.warGames.field.formation')} • {placedCount}/11 {t('pages.warGames.field.playersPlaced')}
                  {isTeamComplete && (
                    <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-bold">
                      ✓ {t('pages.warGames.field.complete')}
                    </span>
                  )}
                  {!isAuthenticated && (
                    <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold">
                      ⚠️ {t('pages.warGames.field.authRequired')}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleClearTeam}
                  variant="secondary"
                  size="small"
                  disabled={placedCount === 0}
                >
                  {t('pages.warGames.actions.clearTeam')}
                </Button>
                
                  <Button
                      onClick={handleSubmitWarGame}
                    variant="primary"
                    size="small"
                      disabled={!isTeamComplete}
                      title={warGameMode === 'create' ? t('pages.warGames.create.button') : t('pages.warGames.join.button')}
                    >
                      {warGameMode === 'create' ? t('pages.warGames.create.button') : t('pages.warGames.join.button')}
                </Button>
              </div>
            </div>
            
            <div className="flex-1 min-h-0">
              <FootballField
                slots={slots}
                draggedNFT={draggedNFT}
                onDropNFT={handleDropNFT}
                onRemoveNFT={handleRemoveNFT}
                canDropOnSlot={canDropOnSlot}
              />
            </div>
          </div>
        </div>

        {/* NFT List Panel - Right side */}
        <div className="lg:w-80 lg:flex-shrink-0 min-h-0">
          <NFTListPanel
            placedNFTs={getPlacedNFTs}
            onDragStart={setDraggedNFT}
            onDragEnd={() => setDraggedNFT(null)}
            testAddress={testAddress}
          />
        </div>
      </div>
      
          {/* Saved Teams Section - Always show in create/join mode */}
            <div className="mt-6">
              <SavedTeamsList userId={supabaseUserId} onLoadTeam={handleLoadTeam} />
            </div>
        </>
          )}
    </div>
  );
};

