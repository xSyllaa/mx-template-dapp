import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNFTHolders } from '../hooks';
import type { PlayerSearchResult, NFTHolder } from '../types';

interface SelectedPlayerCardProps {
  player: PlayerSearchResult;
  onRemove: (playerId: string) => void;
  onHoldersUpdate: (playerId: string, holders: NFTHolder[]) => void;
}

export const SelectedPlayerCard = ({
  player,
  onRemove,
  onHoldersUpdate
}: SelectedPlayerCardProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { holders, loading, error, fetchHolders } = useNFTHolders();

  const handleFetchHolders = async () => {
    if (!player.nftId) return;
    
    await fetchHolders(player.nftId);
    // Mettre à jour les holders dans le parent
    onHoldersUpdate(player.id, holders);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'text-yellow-400 border-yellow-400/30';
      case 'Epic': return 'text-purple-400 border-purple-400/30';
      case 'Rare': return 'text-blue-400 border-blue-400/30';
      default: return 'text-[var(--mvx-text-color-secondary)] border-[var(--mvx-border-color-secondary)]';
    }
  };

  const copyHolderAddresses = () => {
    if (holders.length === 0) return;
    
    const addresses = holders.map(holder => holder.address).join('\n');
    navigator.clipboard.writeText(addresses);
    
    // TODO: Ajouter un toast de confirmation
    console.log('Addresses copied to clipboard');
  };

  return (
    <div className={`bg-[var(--mvx-bg-color-secondary)] border-2 rounded-lg p-4 transition-all ${getRarityColor(player.rarity || 'Common')}`}>
      {/* Header de la carte */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-[var(--mvx-text-color-primary)] text-lg">
            {player.name}
          </h3>
          <p className="text-sm text-[var(--mvx-text-color-secondary)] mt-1">
            {player.nftId}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {player.position && (
            <span className="px-2 py-1 text-xs bg-[var(--mvx-text-accent-color)]/20 text-[var(--mvx-text-accent-color)] rounded">
              {player.position}
            </span>
          )}
          {player.rarity && (
            <span className={`text-xs font-medium ${getRarityColor(player.rarity).split(' ')[0]}`}>
              {player.rarity}
            </span>
          )}
          
          <button
            onClick={() => onRemove(player.id)}
            className="text-red-400 hover:text-red-300 transition-colors p-1"
            title="Retirer ce joueur"
          >
            ❌
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3 mb-3">
        <button
          onClick={handleFetchHolders}
          disabled={loading || !player.nftId}
          className="px-3 py-2 bg-[var(--mvx-text-accent-color)] text-white rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? '🔄 Chargement...' : '🔍 Récupérer les détenteurs'}
        </button>

        {holders.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-2 bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)] text-[var(--mvx-text-color-primary)] rounded-lg hover:bg-[var(--mvx-bg-accent-color)] transition-colors text-sm"
          >
            {isExpanded ? '🔼 Masquer' : '🔽 Voir'} ({holders.length})
          </button>
        )}

        {holders.length > 0 && (
          <button
            onClick={copyHolderAddresses}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            title="Copier toutes les adresses"
          >
            📋 Copier
          </button>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Liste des détenteurs */}
      {isExpanded && holders.length > 0 && (
        <div className="border-t border-[var(--mvx-border-color-secondary)] pt-3">
          <h4 className="font-medium text-[var(--mvx-text-color-primary)] mb-2">
            Détenteurs ({holders.length})
          </h4>
          
          <div className="max-h-40 overflow-y-auto space-y-2">
            {holders.map((holder, index) => (
              <div
                key={`${holder.address}-${index}`}
                className="flex items-center justify-between p-2 bg-[var(--mvx-bg-color-primary)] rounded border border-[var(--mvx-border-color-secondary)]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-[var(--mvx-text-color-primary)] truncate">
                    {holder.address}
                  </p>
                </div>
                <div className="ml-3 flex items-center space-x-2">
                  <span className="text-xs text-[var(--mvx-text-color-secondary)]">
                    Balance: {holder.balance}
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
    </div>
  );
};
