/**
 * Rarity Select Component - Premium dropdown for filtering NFTs by rarity
 */
import { useState } from 'react';

type FilterOption = 'all' | 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

interface RaritySelectProps {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
  counts: Record<FilterOption, number>;
  labels: Record<FilterOption, string>;
}

// Rarity colors
const rarityColors: Record<FilterOption, { text: string; bg: string }> = {
  all: { text: 'text-primary', bg: 'bg-tertiary' },
  Mythic: { text: 'text-red-400', bg: 'bg-red-500' },
  Legendary: { text: 'text-yellow-400', bg: 'bg-yellow-500' },
  Epic: { text: 'text-purple-400', bg: 'bg-purple-500' },
  Rare: { text: 'text-blue-400', bg: 'bg-blue-500' },
  Common: { text: 'text-gray-400', bg: 'bg-gray-500' }
};

export const RaritySelect = ({ value, onChange, counts, labels }: RaritySelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const options: FilterOption[] = ['all', 'Mythic', 'Legendary', 'Epic', 'Rare', 'Common'];
  
  const currentColor = rarityColors[value];
  
  return (
    <div className="relative inline-block w-full sm:w-64">
      {/* Select Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-3 sm:px-4 py-3 rounded-xl border-2 border-secondary bg-secondary text-primary font-medium shadow-lg hover:bg-tertiary transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary"
      >
        <div className="flex items-center gap-2">
          {value !== 'all' && (
            <span className={`w-3 h-3 rounded-full ${currentColor.bg}`}></span>
          )}
          <span className={currentColor.text}>{labels[value]}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-tertiary/20 text-xs font-semibold text-secondary">
            {counts[value]}
          </span>
          <svg
            className={`w-4 h-4 transition-transform text-secondary ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border-2 border-secondary bg-secondary shadow-2xl backdrop-blur-xl overflow-hidden">
            {options.map((option) => {
              const optionColor = rarityColors[option];
              const isSelected = value === option;
              
              return (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${
                    isSelected 
                      ? 'bg-tertiary/20 border-l-4 border-accent' 
                      : 'hover:bg-tertiary border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {option !== 'all' && (
                      <span className={`w-3 h-3 rounded-full ${optionColor.bg}`}></span>
                    )}
                    <span className={`font-medium ${optionColor.text}`}>
                      {labels[option]}
                    </span>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isSelected 
                      ? 'bg-accent/20 text-accent' 
                      : 'bg-tertiary/10 text-secondary'
                  }`}>
                    {counts[option]}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

