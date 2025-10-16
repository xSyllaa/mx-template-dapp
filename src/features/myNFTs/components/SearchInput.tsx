/**
 * Search Input Component - Search NFTs by attributes
 */
import { useTranslation } from 'react-i18next';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = ({ value, onChange, placeholder }: SearchInputProps) => {
  const { t } = useTranslation();
  
  const handleClear = () => {
    onChange('');
  };
  
  return (
    <div className="relative flex-1 min-w-full sm:min-w-[200px] max-w-full sm:max-w-md">
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg 
            className="w-5 h-5 text-secondary" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        {/* Input Field */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || t('pages.myNFTs.filters.search.placeholder')}
          className="w-full pl-12 pr-10 py-3 rounded-xl border-2 border-secondary bg-secondary text-primary placeholder-secondary font-medium shadow-lg hover:bg-tertiary focus:bg-tertiary transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary"
        />
        
        {/* Clear Button */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-secondary hover:text-primary transition-colors"
            aria-label={t('pages.myNFTs.filters.search.clear')}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>
      
      {/* Search hint */}
      {value && (
        <div className="absolute top-full left-0 right-0 mt-1 px-2">
          <p className="text-xs text-secondary">
            {t('pages.myNFTs.filters.search.hint')}
          </p>
        </div>
      )}
    </div>
  );
};

