/**
 * Position Select Component - Dropdown for filtering NFTs by position
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type PositionFilter = 'all' | string;

interface PositionSelectProps {
  value: PositionFilter;
  onChange: (value: PositionFilter) => void;
  positions: string[];
  counts: Record<string, number>;
}

export const PositionSelect = ({ value, onChange, positions, counts }: PositionSelectProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Position icons mapping
  const positionIcons: Record<string, string> = {
    'GK': '🧤',
    'DEF': '🛡️',
    'MID': '⚡',
    'ATT': '⚔️',
    'all': '📋'
  };
  
  const getIcon = (pos: string) => positionIcons[pos] || '⚽';
  
  return (
    <div className="relative inline-block w-full sm:w-64">
      {/* Select Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-3 sm:px-4 py-3 rounded-xl border-2 border-secondary bg-secondary text-primary font-medium shadow-lg hover:bg-tertiary transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{getIcon(value)}</span>
          <span className="text-primary">
            {value === 'all' ? t('pages.myNFTs.filters.positions.all') : value}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-tertiary/20 text-xs font-semibold text-secondary">
            {value === 'all' ? counts['all'] || 0 : counts[value] || 0}
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
          <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border-2 border-secondary bg-secondary shadow-2xl backdrop-blur-xl overflow-hidden max-h-64 overflow-y-auto">
            {/* All option */}
            <button
              onClick={() => {
                onChange('all');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${
                value === 'all'
                  ? 'bg-tertiary/20 border-l-4 border-accent' 
                  : 'hover:bg-tertiary border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{getIcon('all')}</span>
                <span className="font-medium text-primary">
                  {t('pages.myNFTs.filters.positions.all')}
                </span>
              </div>
              
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                value === 'all'
                  ? 'bg-accent/20 text-accent' 
                  : 'bg-tertiary/10 text-secondary'
              }`}>
                {counts['all'] || 0}
              </span>
            </button>
            
            {/* Position options */}
            {positions.map((position) => {
              const isSelected = value === position;
              const count = counts[position] || 0;
              
              return (
                <button
                  key={position}
                  onClick={() => {
                    onChange(position);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${
                    isSelected 
                      ? 'bg-tertiary/20 border-l-4 border-accent' 
                      : 'hover:bg-tertiary border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getIcon(position)}</span>
                    <span className="font-medium text-primary">
                      {position}
                    </span>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isSelected 
                      ? 'bg-accent/20 text-accent' 
                      : 'bg-tertiary/10 text-secondary'
                  }`}>
                    {count}
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

