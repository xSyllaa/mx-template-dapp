import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSavedTeams } from '../hooks/useSavedTeams';
import type { SavedTeam } from '../types';

interface SavedTeamsListProps {
  userId: string | null;
  onLoadTeam: (team: SavedTeam) => void;
}

export const SavedTeamsList = ({ userId, onLoadTeam }: SavedTeamsListProps) => {
  const { t } = useTranslation();
  const { teams, loading, error, deleteTeam } = useSavedTeams(userId);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (window.confirm(t('pages.warGames.savedTeams.confirmDelete', { teamName }))) {
      try {
        await deleteTeam(teamId);
      } catch (err) {
        console.error('Failed to delete team:', err);
      }
    }
  };

  const handleLoadTeam = (team: SavedTeam) => {
    onLoadTeam(team);
    setExpandedTeam(null);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-secondary border-t-accent rounded-full mb-2"></div>
        <p className="text-sm text-[var(--mvx-text-color-secondary)]">
          {t('common.loading')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-4xl mb-2">❌</div>
        <p className="text-sm text-red-500">{error.message}</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-4xl mb-2">📁</div>
        <p className="text-sm text-[var(--mvx-text-color-secondary)]">
          {t('pages.warGames.savedTeams.empty')}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold text-[var(--mvx-text-color-primary)] mb-4">
        {t('pages.warGames.savedTeams.title')}
      </h3>
      
      <div className="space-y-3">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-[var(--mvx-bg-color-secondary)] rounded-lg p-3 border border-[var(--mvx-border-color-secondary)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-[var(--mvx-text-color-primary)]">
                  {team.teamName}
                </h4>
                <p className="text-sm text-[var(--mvx-text-color-secondary)]">
                  {team.formation} • {team.slots.length}/11 {t('pages.warGames.savedTeams.players')}
                </p>
                <p className="text-xs text-[var(--mvx-text-color-tertiary)]">
                  {new Date(team.updatedAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoadTeam(team)}
                  className="px-3 py-1 bg-[var(--mvx-text-accent-color)] text-white rounded text-sm hover:opacity-90 transition-opacity"
                >
                  {t('pages.warGames.savedTeams.load')}
                </button>
                
                <button
                  onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                  className="px-3 py-1 bg-[var(--mvx-bg-color-primary)] text-[var(--mvx-text-color-primary)] rounded text-sm border border-[var(--mvx-border-color-secondary)] hover:bg-[var(--mvx-bg-accent-color)] transition-colors"
                >
                  {expandedTeam === team.id ? t('common.hide') : t('common.show')}
                </button>
                
                <button
                  onClick={() => handleDeleteTeam(team.id, team.teamName)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
            
            {expandedTeam === team.id && (
              <div className="mt-3 pt-3 border-t border-[var(--mvx-border-color-secondary)]">
                <div className="grid grid-cols-2 gap-2">
                  {team.slots.map((slot, index) => (
                    <div key={index} className="text-xs text-[var(--mvx-text-color-secondary)]">
                      <span className="font-medium">{slot.position}:</span> {slot.nftIdentifier}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
