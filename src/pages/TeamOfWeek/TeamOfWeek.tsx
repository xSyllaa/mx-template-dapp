import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TeamOfWeekService } from 'features/teamOfWeek/services';
import type { TeamOfWeek as TeamOfWeekType } from 'features/teamOfWeek/types';

export const TeamOfWeek = () => {
  const { t } = useTranslation();
  const [teams, setTeams] = useState<TeamOfWeekType[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamOfWeekType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    loadTeams();
  }, []);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {selectedTeam.players.map((player, index) => (
              <div
                key={`${player.id}-${index}`}
                className="relative bg-gradient-to-br from-[var(--mvx-bg-color-secondary)] to-[var(--mvx-bg-color-primary)] p-0.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="bg-[var(--mvx-bg-color-secondary)] rounded-xl p-6 h-full">
                  {/* Badge de rareté */}
                  {player.rarity && (
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        player.rarity === 'Legendary' ? 'bg-yellow-400 text-yellow-900' :
                        player.rarity === 'Epic' ? 'bg-purple-400 text-purple-900' :
                        player.rarity === 'Rare' ? 'bg-blue-400 text-blue-900' :
                        'bg-gray-400 text-gray-900'
                      }`}>
                        {player.rarity}
                      </span>
                    </div>
                  )}

                  {/* Nom du joueur */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-[var(--mvx-text-color-primary)] mb-2 pr-16">
                      {player.name}
                    </h3>
                    <p className="text-sm text-[var(--mvx-text-color-secondary)] font-mono break-all">
                      {player.nftId}
                    </p>
                  </div>

                  {/* Position */}
                  {player.position && (
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-[var(--mvx-text-accent-color)]/20 text-[var(--mvx-text-accent-color)] text-sm font-medium rounded-full">
                        {player.position}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
    </div>
  );
};

