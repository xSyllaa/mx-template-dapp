import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TeamOfWeek, PlayerWithHolders } from '../types';

interface TeamOfWeekDisplayProps {
  team: TeamOfWeek;
}

export const TeamOfWeekDisplay = ({ team }: TeamOfWeekDisplayProps) => {
  const { t } = useTranslation();
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'from-yellow-400 to-yellow-600 border-yellow-400/50';
      case 'Epic': return 'from-purple-400 to-purple-600 border-purple-400/50';
      case 'Rare': return 'from-blue-400 to-blue-600 border-blue-400/50';
      default: return 'from-gray-400 to-gray-600 border-gray-400/50';
    }
  };

  const copyPlayerAddresses = (player: PlayerWithHolders) => {
    const addresses = player.holders.map(holder => holder.address).join('\n');
    navigator.clipboard.writeText(addresses);
    
    // TODO: Ajouter un toast de confirmation
    console.log(`Addresses for ${player.name} copied to clipboard`);
  };

  const copyAllAddresses = () => {
    const allAddresses = new Set<string>();
    
    team.players.forEach(player => {
      player.holders.forEach(holder => {
        allAddresses.add(holder.address);
      });
    });
    
    const addressList = Array.from(allAddresses).join('\n');
    navigator.clipboard.writeText(addressList);
    
    // TODO: Ajouter un toast de confirmation
    console.log('All team addresses copied to clipboard');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[var(--mvx-text-accent-color)] to-[var(--mvx-text-accent-color)]/70 rounded-full mb-6">
          <span className="text-3xl">⭐</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
          {team.title}
        </h1>
        
        {team.description && (
          <p className="text-lg text-[var(--mvx-text-color-secondary)] mb-4 max-w-2xl mx-auto">
            {team.description}
          </p>
        )}
        
        <div className="flex items-center justify-center space-x-6 text-[var(--mvx-text-color-secondary)]">
          <div className="flex items-center space-x-2">
            <span>📅</span>
            <span>{formatDate(team.week_start_date)} - {formatDate(team.week_end_date)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>👥</span>
            <span>{team.players.length} joueurs sélectionnés</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>💰</span>
            <span>{team.total_holders} détenteurs uniques</span>
          </div>
        </div>
      </div>

      {/* Actions globales */}
      <div className="flex justify-center">
        <button
          onClick={copyAllAddresses}
          className="px-6 py-3 bg-[var(--mvx-text-accent-color)] text-white rounded-lg hover:opacity-80 transition-opacity font-medium"
        >
          📋 Copier toutes les adresses ({team.total_holders})
        </button>
      </div>

      {/* Grille des joueurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {team.players.map((player, index) => (
          <div
            key={`${player.id}-${index}`}
            className={`relative bg-gradient-to-br ${getRarityColor(player.rarity || 'Common')} p-0.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl`}
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

              {/* Statistiques des détenteurs */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--mvx-text-color-secondary)]">Détenteurs:</span>
                  <span className="font-semibold text-[var(--mvx-text-color-primary)]">
                    {player.holders.length}
                  </span>
                </div>
                
                {player.holders.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-[var(--mvx-text-color-tertiary)]">
                      Total NFTs: {player.holders.reduce((sum, holder) => sum + parseInt(holder.balance), 0)}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {player.holders.length > 0 && (
                  <>
                    <button
                      onClick={() => copyPlayerAddresses(player)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      📋 Copier les adresses
                    </button>
                    
                    <button
                      onClick={() => setExpandedPlayer(
                        expandedPlayer === player.id ? null : player.id
                      )}
                      className="w-full px-4 py-2 bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)] text-[var(--mvx-text-color-primary)] rounded-lg hover:bg-[var(--mvx-bg-accent-color)] transition-colors text-sm"
                    >
                      {expandedPlayer === player.id ? '🔼 Masquer' : '🔽 Voir'} les détenteurs
                    </button>
                  </>
                )}
              </div>

              {/* Liste des détenteurs (expandable) */}
              {expandedPlayer === player.id && player.holders.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--mvx-border-color-secondary)]">
                  <h4 className="text-sm font-semibold text-[var(--mvx-text-color-primary)] mb-3">
                    Détenteurs ({player.holders.length})
                  </h4>
                  
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {player.holders.map((holder, holderIndex) => (
                      <div
                        key={`${holder.address}-${holderIndex}`}
                        className="flex items-center justify-between p-2 bg-[var(--mvx-bg-color-primary)] rounded border border-[var(--mvx-border-color-secondary)]"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-[var(--mvx-text-color-primary)] truncate">
                            {holder.address}
                          </p>
                        </div>
                        <div className="ml-2 flex items-center space-x-2">
                          <span className="text-xs text-[var(--mvx-text-color-secondary)]">
                            {holder.balance}
                          </span>
                          <button
                            onClick={() => navigator.clipboard.writeText(holder.address)}
                            className="text-[var(--mvx-text-accent-color)] hover:opacity-80 transition-opacity"
                            title="Copier l'adresse"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message si pas de détenteurs */}
              {player.holders.length === 0 && (
                <div className="text-center py-4 text-[var(--mvx-text-color-tertiary)]">
                  <div className="text-2xl mb-2">😔</div>
                  <p className="text-sm">Aucun détenteur trouvé</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer avec informations */}
      <div className="text-center text-sm text-[var(--mvx-text-color-tertiary)] border-t border-[var(--mvx-border-color-secondary)] pt-6">
        <p>
          Team créée le {new Date(team.created_at).toLocaleDateString('fr-FR')} • 
          Dernière mise à jour le {new Date(team.updated_at).toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
};
