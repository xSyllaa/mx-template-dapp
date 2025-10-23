import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAccount } from 'lib/sdkDapp';
import { useCurrentUserNFTs } from 'features/collection';
import { 
  useWarGameTeam, 
  WarGameService, 
  WarGameHistory,
  WarGameModeButtons,
  ActiveWarGamesList,
  WarGameConfiguration,
  TeamBuildingInterface
} from 'features/warGames';
import { warGamesAPI } from 'api/wargames';
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
  
  // Use current user's NFTs from global cache
  // This will automatically use injected test NFTs if set via My NFTs page
  const { nfts, loading, error } = useCurrentUserNFTs();
  
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
  const [loadingWarGames, setLoadingWarGames] = useState(false);
  
  // War Games statistics state
  const [warGameStats, setWarGameStats] = useState<{
    active: number;
    historical: number;
    total: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Form state
  const [selectedWarGameId, setSelectedWarGameId] = useState<string>('');
  const [pointsStake, setPointsStake] = useState<number>(100);
  const [entryDeadline, setEntryDeadline] = useState<string>('');
  const [teamName, setTeamName] = useState('');
  const [showTeamNameError, setShowTeamNameError] = useState(false);

  // Load war games statistics and then war games on mount and when user changes
  useEffect(() => {
    if (supabaseUserId) {
      loadWarGameStats();
    }
  }, [supabaseUserId]);

  // Load war games after statistics are loaded
  useEffect(() => {
    if (warGameStats && supabaseUserId) {
      loadAllWarGames();
    }
  }, [warGameStats, supabaseUserId]);

  // Set default deadline when entering create mode
  useEffect(() => {
    if (warGameMode === 'create' && !entryDeadline) {
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);
      setEntryDeadline(tomorrow.toISOString().slice(0, 16));
    }
  }, [warGameMode]);

  /**
   * Load war games statistics first
   */
  const loadWarGameStats = async () => {
    console.log('📊 Loading war games statistics...');
    setLoadingStats(true);
    try {
      const statsResponse = await warGamesAPI.getStats();
      if (statsResponse.success) {
        setWarGameStats(statsResponse.data);
        console.log('📊 War games statistics loaded:', statsResponse.data);
        
        // Load war games after getting stats
        await loadAllWarGames();
      } else {
        console.error('Failed to load war games statistics');
        // Still try to load war games even if stats fail
        await loadAllWarGames();
      }
    } catch (error) {
      console.error('Error loading war games statistics:', error);
      // Still try to load war games even if stats fail
      await loadAllWarGames();
    } finally {
      setLoadingStats(false);
    }
  };

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
      // Use the total from statistics if available, otherwise use a reasonable default
      const limit = warGameStats?.total ? Math.max(warGameStats.total, 50) : 100;
      console.log('📊 Using limit based on stats:', limit, 'from stats:', warGameStats);
      
      const games = await WarGameService.getAllUserVisibleWarGames(limit);

      console.log('📊 ALL WAR GAMES RETRIEVED:', games.length);
      console.log('📊 Full list of war games:', games.map(g => ({
        id: g.id,
        status: g.status,
        creatorId: g.creatorId,
        opponentId: g.opponentId,
        creatorUsername: g.creatorUsername,
        opponentUsername: g.opponentUsername,
        entryDeadline: g.entryDeadline,
        entryDeadlineDate: new Date(g.entryDeadline).toISOString(),
        now: new Date().toISOString(),
        isExpired: new Date(g.entryDeadline) < new Date()
      })));

      setAllWarGames(games);

      // Filter games into 3 categories - with detailed debugging for open games
      const open = WarGameService.filterOpenWarGames(games);

      // Debug each game's filtering criteria
      console.log('🔍 DEBUG: Filtering criteria for each game:');
      games.forEach(game => {
        const isStatusOpen = game.status === 'open';
        const isOpponentNull = game.opponentId === null;
        const entryDeadlineDate = new Date(game.entryDeadline);
        const now = new Date();
        const isNotExpired = entryDeadlineDate > now;
        const isCreatedByCurrentUser = game.creatorId === supabaseUserId;
        const shouldInclude = isStatusOpen && isOpponentNull && isNotExpired;

        console.log(`  Game ${game.id}: status=${isStatusOpen}, opponentNull=${isOpponentNull}, notExpired=${isNotExpired}, include=${shouldInclude}`);
        console.log(`    Created by current user: ${isCreatedByCurrentUser} (creator: ${game.creatorId}, current: ${supabaseUserId})`);
        console.log(`    Entry deadline: ${game.entryDeadline} (${entryDeadlineDate.toISOString()})`);
        console.log(`    Now: ${now.toISOString()}`);
        console.log(`    Time difference: ${entryDeadlineDate.getTime() - now.getTime()}ms`);
      });
      
      setOpenWarGames(open);
      
      console.log('✅ War games filtered:');
      console.log('  📗 OPEN games (can join):', open.length);
      console.log('  📗 Open games details:', open.map(g => ({
        id: g.id,
        status: g.status,
        creatorUsername: g.creatorUsername,
        pointsStake: g.pointsStake
      })));
      
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

  // Test address functionality removed - now uses global TestAddressContext
  // Set via My NFTs page, automatically applies to all features

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
        loadWarGameStats();
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
        loadWarGameStats();
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
  if (loading && warGameMode !== 'select') {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="animate-spin inline-block w-16 h-16 border-4 border-secondary border-t-accent rounded-full mb-4"></div>
          <p className="text-lg text-[var(--mvx-text-color-secondary)]">
            {t('common.loading')}
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
            
            {/* War Games Statistics */}
            {warGameStats && (
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 bg-[var(--mvx-bg-color-secondary)] rounded-lg">
                  <span className="text-[var(--mvx-text-accent-color)]">⚔️</span>
                  <span className="text-[var(--mvx-text-color-primary)]">
                    {t('pages.warGames.stats.active', { count: warGameStats.active })}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-[var(--mvx-bg-color-secondary)] rounded-lg">
                  <span className="text-[var(--mvx-text-accent-color)]">📜</span>
                  <span className="text-[var(--mvx-text-color-primary)]">
                    {t('pages.warGames.stats.historical', { count: warGameStats.historical })}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-[var(--mvx-bg-color-secondary)] rounded-lg">
                  <span className="text-[var(--mvx-text-accent-color)]">📊</span>
                  <span className="text-[var(--mvx-text-color-primary)]">
                    {t('pages.warGames.stats.total', { count: warGameStats.total })}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {/* Refresh button */}
            <Button
              onClick={loadWarGameStats}
              variant="secondary"
              disabled={loadingStats || loadingWarGames}
              className="flex items-center gap-2"
            >
              {(loadingStats || loadingWarGames) ? (
                <div className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
              ) : (
                <span>🔄</span>
              )}
              {t('pages.warGames.refresh')}
            </Button>

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
            warGames={allWarGames}
            currentUserId={supabaseUserId}
            onJoinClick={handleJoinFromCard}
            showBadge={true}
          />

          {/* War Games History */}
          <div className="mt-8 w-full max-w-4xl">
            <WarGameHistory userId={supabaseUserId} />
          </div>
        </div>
      )}

      {/* Create/Join War Game Interface */}
      {warGameMode !== 'select' && (
        <>
          {/* Not enough NFTs warning */}
          {!loading && nfts.length < 11 && (
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
              testAddress=""
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

