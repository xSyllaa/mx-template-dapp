import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAccount } from 'lib/sdkDapp';
import { useMyNFTs } from 'features/myNFTs';
import { 
  useWarGameTeam, 
  WarGameService, 
  WarGameHistory,
  WarGameModeButtons,
  ActiveWarGamesList,
  WarGameConfiguration,
  TeamBuildingInterface
} from 'features/warGames';
import { TeamService } from 'features/warGames/services/teamService';
import type { WarGameWithDetails } from 'features/warGames/types';
import { Button } from 'components/Button';
import { useAuth } from 'contexts/AuthContext';

type WarGameMode = 'select' | 'create' | 'join';

export const WarGames = () => {
  const { t } = useTranslation();
  const { address } = useGetAccount();
  const { isAuthenticated, supabaseUserId, signIn } = useAuth();
  
  // War Game mode state (must be declared early for conditional NFT loading)
  const [warGameMode, setWarGameMode] = useState<WarGameMode>('select');
  
  // Test address functionality
  const [testAddress, setTestAddress] = useState('erd1z563juvyfl7etnev8ua65vzhx65ln0rp0m783hq2m2wgdxx6z83s9t2cmv');
  const [showTestInput, setShowTestInput] = useState(false);
  const [isLoadingTestAddress, setIsLoadingTestAddress] = useState(false);
  
  // Use test address by default, fallback to connected address
  const currentAddress = address || testAddress;
  
  // Only load NFTs when in create/join mode
  const shouldLoadNFTs = warGameMode !== 'select';
  const { nfts, loading, error, fetchNFTsForAddress } = useMyNFTs(
    shouldLoadNFTs ? currentAddress : '', 
    shouldLoadNFTs
  );
  
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
  
  // War Games state
  const [allWarGames, setAllWarGames] = useState<WarGameWithDetails[]>([]);
  const [openWarGames, setOpenWarGames] = useState<WarGameWithDetails[]>([]);
  const [completedWarGames, setCompletedWarGames] = useState<WarGameWithDetails[]>([]);
  const [loadingWarGames, setLoadingWarGames] = useState(false);
  
  // Form state
  const [selectedWarGameId, setSelectedWarGameId] = useState<string>('');
  const [pointsStake, setPointsStake] = useState<number>(100);
  const [entryDeadline, setEntryDeadline] = useState<string>('');
  const [teamName, setTeamName] = useState('');
  const [showTeamNameError, setShowTeamNameError] = useState(false);

  // Load all war games on mount and when user changes
  useEffect(() => {
    if (supabaseUserId) {
      loadAllWarGames();
    }
  }, [supabaseUserId]);

  // Set default deadline when entering create mode
  useEffect(() => {
    if (warGameMode === 'create' && !entryDeadline) {
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);
      setEntryDeadline(tomorrow.toISOString().slice(0, 16));
    }
  }, [warGameMode]);

  /**
   * Load all war games and filter them
   */
  const loadAllWarGames = async () => {
    console.log('🔄 Starting to load all war games...');
    console.log('🔍 loadAllWarGames called with supabaseUserId:', supabaseUserId);
    console.log('🔍 supabaseUserId type:', typeof supabaseUserId);
    console.log('🔍 supabaseUserId === null:', supabaseUserId === null);
    console.log('🔍 supabaseUserId === undefined:', supabaseUserId === undefined);
    
    setLoadingWarGames(true);
    try {
      const games = await WarGameService.getAllUserVisibleWarGames();
      
      console.log('📊 ALL WAR GAMES RETRIEVED:', games.length);
      console.log('📊 Full list of war games:', games.map(g => ({
        id: g.id,
        status: g.status,
        creatorId: g.creatorId,
        opponentId: g.opponentId,
        creatorUsername: g.creatorUsername,
        opponentUsername: g.opponentUsername
      })));
      
      setAllWarGames(games);
      
      // Filter games into 3 categories
      const open = WarGameService.filterOpenWarGames(games);
      
      // In progress: in_progress status (only if user is loaded)
      const inProgress = supabaseUserId ? games.filter(game => 
        game.status === 'in_progress' &&
        (game.creatorId === supabaseUserId || game.opponentId === supabaseUserId)
      ) : [];
      
      console.log('🔍 Debug in_progress filtering:');
      console.log('  📊 Current supabaseUserId:', supabaseUserId);
      console.log('  📊 All games with in_progress status:', games.filter(g => g.status === 'in_progress').map(g => ({
        id: g.id,
        status: g.status,
        creatorId: g.creatorId,
        opponentId: g.opponentId,
        supabaseUserId: supabaseUserId,
        isCreator: g.creatorId === supabaseUserId,
        isOpponent: g.opponentId === supabaseUserId,
        creatorIdType: typeof g.creatorId,
        opponentIdType: typeof g.opponentId,
        supabaseUserIdType: typeof supabaseUserId
      })));
      console.log('  📊 Filtered in_progress games:', inProgress.map(g => ({
        id: g.id,
        status: g.status,
        creatorId: g.creatorId,
        opponentId: g.opponentId
      })));
      
      // Completed: completed games where user participated (only if user is loaded)
      const completed = supabaseUserId ? games.filter(game => 
        game.status === 'completed' &&
        (game.creatorId === supabaseUserId || game.opponentId === supabaseUserId)
      ) : [];
      
      // History: combine in_progress and completed for history section
      const history = [...inProgress, ...completed].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setOpenWarGames(open);
      setCompletedWarGames(history); // Use history (in_progress + completed)
      
      console.log('✅ War games filtered:');
      console.log('  📗 OPEN games (can join):', open.length);
      console.log('  📗 Open games details:', open.map(g => ({
        id: g.id,
        status: g.status,
        creatorUsername: g.creatorUsername,
        pointsStake: g.pointsStake
      })));
      console.log('  📘 IN PROGRESS games:', inProgress.length);
      console.log('  📘 In progress games details:', inProgress.map(g => ({
        id: g.id,
        status: g.status,
        creatorUsername: g.creatorUsername,
        opponentUsername: g.opponentUsername
      })));
      console.log('  📕 COMPLETED games:', completed.length);
      console.log('  📕 Completed games details:', completed.map(g => ({
        id: g.id,
        status: g.status,
        creatorUsername: g.creatorUsername,
        opponentUsername: g.opponentUsername
      })));
      console.log('  📜 HISTORY games (in_progress + completed):', history.length);
      
      // Set first game as selected if available
      if (open.length > 0) {
        setSelectedWarGameId(open[0].id);
      }
    } catch (error) {
      console.error('Failed to load war games:', error);
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

  const handleSaveTeam = async () => {
    if (!teamName.trim()) {
      setShowTeamNameError(true);
      return;
    }
    
    if (!isAuthenticated) {
      try {
        await signIn();
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
      alert('✅ ' + t('pages.warGames.messages.teamSavedSuccess'));
    } catch (error) {
      console.error('Failed to save team:', error);
      if (error instanceof Error) {
        alert(`Failed to save team: ${error.message}`);
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
      // Save the team
      const savedSlots = TeamService.convertSlotsToSavedSlots(slots);
      const generatedTeamName = `War Game Team - ${new Date().toLocaleDateString()}`;
      const savedTeam = await TeamService.createTeam({
        teamName: generatedTeamName,
        formation: '4-4-2',
        slots: savedSlots
      }, supabaseUserId!);

      // Create or join the war game
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
        resetToSelectMode();
        loadAllWarGames();
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
        resetToSelectMode();
        loadAllWarGames();
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
      clearTeam();
      loadTeam(team.slots, nfts);
      console.log('Team loaded successfully:', team.teamName);
    } catch (error) {
      console.error('Failed to load team:', error);
    }
  };

  const handleJoinFromCard = (gameId: string) => {
    setSelectedWarGameId(gameId);
    setWarGameMode('join');
  };

  const resetToSelectMode = () => {
    clearTeam();
    setWarGameMode('select');
    setPointsStake(100);
    setEntryDeadline('');
    setSelectedWarGameId('');
  };

  // Loading state (only if loading in create/join mode)
  if ((loading || isLoadingTestAddress) && warGameMode !== 'select') {
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
              onClick={resetToSelectMode}
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
          <WarGameModeButtons
            activeWarGamesCount={openWarGames.length}
            onCreateClick={() => setWarGameMode('create')}
            onJoinClick={() => setWarGameMode('join')}
          />

          <ActiveWarGamesList
            warGames={openWarGames}
            currentUserId={supabaseUserId}
            onJoinClick={handleJoinFromCard}
            showBadge={true}
          />

          {/* War Games History */}
          <div className="mt-8 w-full max-w-4xl">
            <WarGameHistory 
              userId={supabaseUserId} 
              completedGames={completedWarGames}
            />
          </div>
        </div>
      )}

      {/* Create/Join War Game Interface */}
      {warGameMode !== 'select' && (
        <>
          {/* Not enough NFTs warning */}
          {shouldLoadNFTs && !loading && nfts.length < 11 && (
            <div className="mb-6 bg-yellow-500/20 border-2 border-yellow-500 rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="text-5xl">📭</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[var(--mvx-text-color-primary)] mb-2">
                    {t('pages.warGames.errors.notEnoughNFTs')}
                  </h3>
                  <p className="text-[var(--mvx-text-color-secondary)]">
                    {t('pages.warGames.errors.needMoreNFTs', { current: nfts.length, needed: 11 })}
                  </p>
                  {/* Test Address Input */}
                  <div className="mt-4">
                    <button
                      onClick={() => setShowTestInput(!showTestInput)}
                      className="text-sm text-[var(--mvx-text-color-secondary)] hover:text-[var(--mvx-text-color-primary)] underline"
                    >
                      {showTestInput ? t('pages.warGames.testMode.hide') : t('pages.warGames.testMode.show')}
                    </button>
                    
                    {showTestInput && (
                      <div className="flex gap-2 mt-2">
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
            </div>
          )}

          {/* War Game Configuration (Create/Join forms) */}
          <WarGameConfiguration
            mode={warGameMode}
            pointsStake={pointsStake}
            entryDeadline={entryDeadline}
            selectedWarGameId={selectedWarGameId}
            openWarGames={openWarGames}
            loadingWarGames={loadingWarGames}
            onPointsStakeChange={setPointsStake}
            onEntryDeadlineChange={setEntryDeadline}
            onSelectedWarGameChange={setSelectedWarGameId}
          />

          {/* Team Building Interface - Only show if has enough NFTs */}
          {nfts.length >= 11 && (
            <TeamBuildingInterface
              slots={slots}
              draggedNFT={draggedNFT}
              placedCount={placedCount}
              isTeamComplete={isTeamComplete}
              isAuthenticated={isAuthenticated}
              warGameMode={warGameMode}
              testAddress={testAddress}
              teamName={teamName}
              showTeamNameError={showTeamNameError}
              supabaseUserId={supabaseUserId}
              onDragStart={setDraggedNFT}
              onDragEnd={() => setDraggedNFT(null)}
              onDropNFT={(slotId, nft) => placeNFT(slotId, nft)}
              onRemoveNFT={removeNFT}
              onClearTeam={clearTeam}
              onSaveTeam={handleSaveTeam}
              onSubmitWarGame={handleSubmitWarGame}
              onLoadTeam={handleLoadTeam}
              onTeamNameChange={(name) => {
                setTeamName(name);
                setShowTeamNameError(false);
              }}
              canDropOnSlot={canDropOnSlot}
              getPlacedNFTs={() => getPlacedNFTs}
            />
          )}
        </>
      )}
    </div>
  );
};

