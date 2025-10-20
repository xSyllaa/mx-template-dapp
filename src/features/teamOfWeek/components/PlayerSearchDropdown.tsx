import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlayerSearchService } from '../services';
import type { PlayerSearchResult } from '../types';

interface PlayerSearchDropdownProps {
  onPlayerSelect: (player: PlayerSearchResult) => void;
  placeholder?: string;
  disabled?: boolean;
  selectedPlayers?: PlayerSearchResult[];
}

export const PlayerSearchDropdown = ({
  onPlayerSelect,
  placeholder = "Rechercher un joueur...",
  disabled = false,
  selectedPlayers = []
}: PlayerSearchDropdownProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Recherche des joueurs quand la query change
  useEffect(() => {
    if (query.length >= 2) {
      const searchResults = PlayerSearchService.searchPlayers(query, 10);
      // Filtrer les joueurs déjà sélectionnés
      const filteredResults = searchResults.filter(
        result => !selectedPlayers.some(selected => selected.id === result.id)
      );
      setResults(filteredResults);
      setIsOpen(true);
      setHighlightedIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, selectedPlayers]);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gestion du clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handlePlayerSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handlePlayerSelect = (player: PlayerSearchResult) => {
    onPlayerSelect(player);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'text-yellow-400';
      case 'Epic': return 'text-purple-400';
      case 'Rare': return 'text-blue-400';
      default: return 'text-[var(--mvx-text-color-secondary)]';
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] placeholder-[var(--mvx-text-color-tertiary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)] transition-colors"
        />
        
        {/* Icône de recherche */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--mvx-text-color-tertiary)]">
          🔍
        </div>
      </div>

      {/* Dropdown des résultats */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {results.map((player, index) => (
            <div
              key={player.id}
              onClick={() => handlePlayerSelect(player)}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === highlightedIndex
                  ? 'bg-[var(--mvx-bg-accent-color)]'
                  : 'hover:bg-[var(--mvx-bg-accent-color)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-[var(--mvx-text-color-primary)]">
                    {player.name}
                  </div>
                  <div className="text-sm text-[var(--mvx-text-color-secondary)] mt-1">
                    {player.nftId}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {player.position && (
                    <span className="px-2 py-1 text-xs bg-[var(--mvx-text-accent-color)]/20 text-[var(--mvx-text-accent-color)] rounded">
                      {player.position}
                    </span>
                  )}
                  {player.rarity && (
                    <span className={`text-xs font-medium ${getRarityColor(player.rarity)}`}>
                      {player.rarity}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message si aucun résultat */}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg shadow-lg p-4">
          <div className="text-[var(--mvx-text-color-secondary)] text-center">
            Aucun joueur trouvé pour "{query}"
          </div>
        </div>
      )}
    </div>
  );
};
