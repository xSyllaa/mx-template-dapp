import { useTranslation } from 'react-i18next';
import { Button } from 'components/Button';
import { FootballField } from './FootballField';
import { NFTListPanel } from './NFTListPanel';
import { SavedTeamsList } from './SavedTeamsList';
import type { TeamSlot } from '../types';
import type { GalacticXNFT } from 'features/myNFTs/types';

interface TeamBuildingInterfaceProps {
  slots: TeamSlot[];
  draggedNFT: GalacticXNFT | null;
  placedCount: number;
  isTeamComplete: boolean;
  isAuthenticated: boolean;
  warGameMode: 'create' | 'join';
  testAddress: string;
  teamName: string;
  showTeamNameError: boolean;
  supabaseUserId?: string | null;
  onDragStart: (nft: GalacticXNFT) => void;
  onDragEnd: () => void;
  onDropNFT: (slotId: string, nft: GalacticXNFT) => void;
  onRemoveNFT: (slotId: string) => void;
  onClearTeam: () => void;
  onSaveTeam: () => void;
  onSubmitWarGame: () => void;
  onLoadTeam: (team: any) => void;
  onTeamNameChange: (name: string) => void;
  canDropOnSlot: (slotId: string, nft: GalacticXNFT) => boolean;
  getPlacedNFTs: () => string[]; // Function returning array of NFT identifiers
}

export const TeamBuildingInterface = ({
  slots,
  draggedNFT,
  placedCount,
  isTeamComplete,
  isAuthenticated,
  warGameMode,
  testAddress,
  teamName,
  showTeamNameError,
  supabaseUserId,
  onDragStart,
  onDragEnd,
  onDropNFT,
  onRemoveNFT,
  onClearTeam,
  onSaveTeam,
  onSubmitWarGame,
  onLoadTeam,
  onTeamNameChange,
  canDropOnSlot,
  getPlacedNFTs
}: TeamBuildingInterfaceProps) => {
  const { t } = useTranslation();

  return (
    <>
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
                  onClick={onClearTeam}
                  variant="secondary"
                  size="small"
                  disabled={placedCount === 0}
                >
                  {t('pages.warGames.actions.clearTeam')}
                </Button>
                
                {/* Save Team Button - Only show if team is complete */}
                {isTeamComplete && (
                  <Button
                    onClick={() => {}}
                    variant="secondary"
                    size="small"
                  >
                    {t('pages.warGames.actions.saveTeam')}
                  </Button>
                )}
                
                <Button
                  onClick={onSubmitWarGame}
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
                onDropNFT={onDropNFT}
                onRemoveNFT={onRemoveNFT}
                canDropOnSlot={canDropOnSlot}
              />
            </div>
          </div>
        </div>

        {/* NFT List Panel - Right side */}
        <div className="lg:w-80 lg:flex-shrink-0 min-h-0">
          <NFTListPanel
            placedNFTs={getPlacedNFTs}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            testAddress={testAddress}
          />
        </div>
      </div>

      {/* Save Team Section - Show when team is complete */}
      {isTeamComplete && (
        <div className="mt-6 bg-[var(--mvx-bg-color-secondary)] rounded-lg p-6 border border-[var(--mvx-border-color-secondary)]">
          <h3 className="text-lg font-bold text-[var(--mvx-text-color-primary)] mb-4">
            {t('pages.warGames.actions.saveTeam')}
          </h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-[var(--mvx-text-color-primary)] font-semibold mb-2">
                {t('pages.warGames.actions.teamNamePlaceholder')}
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => onTeamNameChange(e.target.value)}
                placeholder={t('pages.warGames.actions.teamNamePlaceholder')}
                className={`w-full px-4 py-2 bg-[var(--mvx-bg-color-primary)] text-[var(--mvx-text-color-primary)] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mvx-text-accent-color)] ${
                  showTeamNameError 
                    ? 'border-red-500' 
                    : 'border-[var(--mvx-border-color-secondary)]'
                }`}
              />
              {showTeamNameError && (
                <p className="text-red-500 text-sm mt-1">
                  {t('pages.warGames.actions.teamNameRequired')}
                </p>
              )}
            </div>
            <Button
              onClick={onSaveTeam}
              variant="primary"
              disabled={!teamName.trim()}
            >
              {t('pages.warGames.actions.saveTeam')}
            </Button>
          </div>
        </div>
      )}

      {/* Saved Teams Section - Always show in create/join mode */}
      <div className="mt-6">
        <SavedTeamsList userId={supabaseUserId} onLoadTeam={onLoadTeam} />
      </div>
    </>
  );
};

