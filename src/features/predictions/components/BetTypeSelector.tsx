import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { BetTypeOption, BetCategory, BetDropdownItem } from '../types';
import {
  BET_CATEGORIES,
  BET_TYPES,
  searchBetTypes,
  ALL_BET_DROPDOWN_ITEMS
} from '../betTypesData';

// Color scheme for different bet categories using theme-aware colors
const CATEGORY_COLORS: Record<string, string> = {
  'match-result': 'bg-gradient-to-r from-blue-500/40 to-blue-600/50 border-blue-400',
  'goals-markets': 'bg-gradient-to-r from-green-500/40 to-green-600/50 border-green-400',
  'time-based': 'bg-gradient-to-r from-purple-500/40 to-purple-600/50 border-purple-400',
  'player-bets': 'bg-gradient-to-r from-orange-500/40 to-orange-600/50 border-orange-400',
  'cards-bookings': 'bg-gradient-to-r from-red-500/40 to-red-600/50 border-red-400',
  'corners': 'bg-gradient-to-r from-yellow-500/40 to-yellow-600/50 border-yellow-400',
  'combination': 'bg-gradient-to-r from-indigo-500/40 to-indigo-600/50 border-indigo-400',
  'specials': 'bg-gradient-to-r from-pink-500/40 to-pink-600/50 border-pink-400',
  'outright': 'bg-gradient-to-r from-teal-500/40 to-teal-600/50 border-teal-400',
  'advanced': 'bg-gradient-to-r from-gray-500/40 to-gray-600/50 border-gray-400'
};

// Get color class for a category (background)
const getCategoryColor = (categoryId: string): string => {
  return CATEGORY_COLORS[categoryId] || 'bg-gradient-to-r from-gray-600 to-gray-700';
};

// Get border color for a bet type (based on its category)
const getBetTypeBorderColor = (betTypeId: string): string => {
  const betType = BET_TYPES.find(bt => bt.id === betTypeId);
  if (betType) {
    const colorMap: Record<string, string> = {
      'match-result': 'border-l-blue-500 hover:border-l-blue-600',
      'goals-markets': 'border-l-green-500 hover:border-l-green-600',
      'time-based': 'border-l-purple-500 hover:border-l-purple-600',
      'player-bets': 'border-l-orange-500 hover:border-l-orange-600',
      'cards-bookings': 'border-l-red-500 hover:border-l-red-600',
      'corners': 'border-l-yellow-500 hover:border-l-yellow-600',
      'combination': 'border-l-indigo-500 hover:border-l-indigo-600',
      'specials': 'border-l-pink-500 hover:border-l-pink-600',
      'outright': 'border-l-teal-500 hover:border-l-teal-600',
      'advanced': 'border-l-gray-500 hover:border-l-gray-600'
    };
    return colorMap[betType.category] || 'border-l-gray-500 hover:border-l-gray-600';
  }
  return 'border-l-gray-500 hover:border-l-gray-600';
};

interface BetTypeSelectorProps {
  value: string;
  onChange: (betTypeId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const BetTypeSelector = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = ''
}: BetTypeSelectorProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter bet types based on search query
  const filteredBetTypes = searchQuery.trim()
    ? searchBetTypes(searchQuery)
    : BET_TYPES;

  // Get current selected bet type
  const selectedBetType = BET_TYPES.find(bet => bet.id === value);

  // Display value for input field
  const displayValue = selectedBetType
    ? t(`betTypes.${selectedBetType.i18nKey}.name`, { ns: 'predictions' })
    : '';

  // Get category color for selected bet type (for input field indicator)
  const selectedCategoryColor = selectedBetType
    ? getBetTypeBorderColor(selectedBetType.id)
    : '';

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev =>
            prev < filteredBetTypes.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredBetTypes.length) {
            handleSelect(filteredBetTypes[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchQuery('');
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, filteredBetTypes]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (betType: BetTypeOption) => {
    onChange(betType.id);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setHighlightedIndex(-1);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onClick={handleInputFocus}
          placeholder={placeholder || t('predictions.admin.betType')}
          disabled={disabled}
          className={`w-full px-4 py-3 bg-[var(--mvx-bg-color-secondary)] border rounded-lg text-[var(--mvx-text-color-primary)] focus:outline-none focus:border-[var(--mvx-text-accent-color)] disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedBetType ? `border-l-4 ${getBetTypeBorderColor(selectedBetType.id)}` : 'border-[var(--mvx-border-color-secondary)]'
          }`}
        />
        {/* Category color indicator */}
        {selectedBetType && !isOpen && (
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${getBetTypeBorderColor(selectedBetType.id)} rounded-l-lg`} />
        )}
      </div>

      {/* Dropdown Arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className={`w-5 h-5 text-[var(--mvx-text-color-secondary)] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Search Results or Full List */}
          <div className="py-2">
            {filteredBetTypes.length === 0 ? (
              // No results
              <div className="px-4 py-3 text-[var(--mvx-text-color-secondary)] text-sm">
                {t('common:noResults')}
              </div>
            ) : (
              // Group bet types by category
              <div className="max-h-80 overflow-y-auto">
                {searchQuery.trim() ? (
                  // Show filtered results without categories when searching
                  <ul ref={listRef} className="py-1">
                    {filteredBetTypes.map((betType, index) => (
                      <li key={betType.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(betType)}
                          className={`w-full px-4 py-3 text-left hover:bg-[var(--mvx-bg-accent-color)] transition-all duration-200 border-l-4 ${
                            index === highlightedIndex
                              ? 'bg-[var(--mvx-text-accent-color)] text-white border-l-[var(--mvx-text-accent-color)]'
                              : `text-[var(--mvx-text-color-primary)] ${getBetTypeBorderColor(betType.id)}`
                          }`}
                        >
                          <div className="font-medium">
                            {t(`betTypes.${betType.i18nKey}.name`, { ns: 'predictions' })}
                          </div>
                          <div className={`text-xs mt-1 ${
                            index === highlightedIndex
                              ? 'text-white/80'
                              : 'text-[var(--mvx-text-color-secondary)]'
                          }`}>
                            {t(`betTypes.${betType.i18nKey}.desc`, { ns: 'predictions' })}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  // Show categorized view when no search
                  <>
                    {BET_CATEGORIES.map(category => {
                      const categoryBetTypes = BET_TYPES.filter(bet => bet.category === category.id);

                      if (categoryBetTypes.length === 0) return null;

                      return (
                        <div key={category.id}>
                          {/* Category Header (non-selectable) */}
                          <div className={`px-4 py-2 border-b border-[var(--mvx-border-color-secondary)] ${getCategoryColor(category.id)}`}>
                            <div className="font-semibold text-[var(--mvx-text-accent-color)] text-sm">
                              {t(`betCategories.${category.id}`, { ns: 'predictions' })}
                            </div>
                            {category.description && (
                              <div className="text-xs text-[var(--mvx-text-color-secondary)] mt-1">
                                {t(`betCategories.${category.id}Desc`, { ns: 'predictions' })}
                              </div>
                            )}
                          </div>

                          {/* Category Bet Types */}
                          <ul className="py-1">
                            {categoryBetTypes.map((betType, index) => (
                              <li key={betType.id}>
                                <button
                                  type="button"
                                  onClick={() => handleSelect(betType)}
                                  className={`w-full px-4 py-3 text-left hover:bg-[var(--mvx-bg-accent-color)] transition-all duration-200 border-l-4 ${
                                    betType.id === value
                                      ? 'bg-[var(--mvx-text-accent-color)] text-white border-l-[var(--mvx-text-accent-color)]'
                                      : `text-[var(--mvx-text-color-primary)] ${getBetTypeBorderColor(betType.id)}`
                                  }`}
                                >
                                  <div className="font-medium">
                                    {t(`betTypes.${betType.i18nKey}.name`, { ns: 'predictions' })}
                                  </div>
                                  <div className={`text-xs mt-1 ${
                                    betType.id === value
                                      ? 'text-white/80'
                                      : 'text-[var(--mvx-text-color-secondary)]'
                                  }`}>
                                    {t(`betTypes.${betType.i18nKey}.desc`, { ns: 'predictions' })}
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
