/**
 * Collection Filters Component - Modern Design
 *
 * Modern filter panel with smooth animations and adaptive layout.
 * Features:
 * - Always visible (no collapsible state for better UX)
 * - Smooth animations
 * - Modern glass-morphism design
 * - Responsive layout optimized for multiple languages
 * - Filter summary badges
 */
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import {
  RaritySelect,
  PositionSelect,
  NationalitySelect,
  SearchInput
} from 'features/myNFTs';

type FilterOption = 'all' | 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

interface CollectionFiltersProps {
  // Rarity filter
  filterRarity: FilterOption;
  onRarityChange: (rarity: FilterOption) => void;
  rarityCounts: Record<FilterOption, number>;
  
  // Position filter
  filterPosition: string;
  onPositionChange: (position: string) => void;
  positions: string[];
  positionCounts: Record<string, number>;
  
  // Nationality filter
  filterNationality: string;
  onNationalityChange: (nationality: string) => void;
  nationalities: string[];
  nationalityCounts: Record<string, number>;
  
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  
  // Refresh
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const CollectionFilters = ({
  filterRarity,
  onRarityChange,
  rarityCounts,
  filterPosition,
  onPositionChange,
  positions,
  positionCounts,
  filterNationality,
  onNationalityChange,
  nationalities,
  nationalityCounts,
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing = false
}: CollectionFiltersProps) => {
  const { t } = useTranslation();

  // Calculate active filters count for summary badges
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterRarity !== 'all') count++;
    if (filterPosition !== 'all') count++;
    if (filterNationality !== 'all') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [filterRarity, filterPosition, filterNationality, searchQuery]);

  // Filter labels for display badges
  const getFilterLabels = () => {
    const labels = [];
    if (filterRarity !== 'all') labels.push(t(`pages.myNFTs.filters.${filterRarity.toLowerCase()}`));
    if (filterPosition !== 'all') labels.push(filterPosition);
    if (filterNationality !== 'all') labels.push(filterNationality);
    if (searchQuery.trim()) labels.push(`"${searchQuery}"`);
    return labels;
  };
  
  // Labels for filter options
  const filterLabels: Record<FilterOption, string> = {
    all: t('pages.myNFTs.filters.all'),
    Mythic: t('pages.myNFTs.filters.mythic'),
    Legendary: t('pages.myNFTs.filters.legendary'),
    Epic: t('pages.myNFTs.filters.epic'),
    Rare: t('pages.myNFTs.filters.rare'),
    Common: t('pages.myNFTs.filters.common')
  };
  
  return (
    <div className="mb-8">
      {/* Modern Filter Panel - Always Visible */}
      <div className="bg-[var(--mvx-bg-color-secondary)]/80 backdrop-blur-sm rounded-2xl border border-[var(--mvx-border-color-secondary)] shadow-lg relative z-10">
        {/* Filter Summary Badges */}
        {activeFiltersCount > 0 && (
          <div className="px-6 py-3 border-b border-[var(--mvx-border-color-secondary)] bg-[var(--mvx-bg-color-primary)]/50">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-[var(--mvx-text-color-primary)]">
                {t('collection.filters.activeFilters')}:
              </span>
              <div className="flex flex-wrap gap-1">
                {getFilterLabels().map((label, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-[var(--mvx-text-accent-color)]/20 text-[var(--mvx-text-accent-color)] rounded-full border border-[var(--mvx-text-accent-color)]/30"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <button
                className="ml-auto px-3 py-1 text-sm bg-[var(--mvx-bg-color-secondary)] hover:bg-[var(--mvx-text-accent-color)]/20 text-[var(--mvx-text-color-secondary)] hover:text-[var(--mvx-text-accent-color)] rounded-lg transition-all duration-200"
                onClick={() => {
                  onRarityChange('all');
                  onPositionChange('all');
                  onNationalityChange('all');
                  onSearchChange('');
                }}
              >
                {t('collection.filters.clearAll')}
              </button>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="p-6 space-y-6">
          {/* Search Input Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--mvx-text-color-primary)] mb-2">
                {t('collection.filters.search')}
              </label>
              <SearchInput
                value={searchQuery}
                onChange={onSearchChange}
              />
            </div>

            {onRefresh && (
              <div className="flex-shrink-0">
                <button
                  className={`px-6 py-3 rounded-xl bg-gradient-to-r from-tertiary to-accent text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                    isRefreshing ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  onClick={onRefresh}
                  disabled={isRefreshing}
                >
                  <span className={`text-lg ${isRefreshing ? 'animate-spin' : ''}`}>
                    🔄
                  </span>
                  <span>{t('collection.refresh')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Filter Dropdowns Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Rarity Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--mvx-text-color-primary)]">
                {t('pages.myNFTs.filters.rarity')}
              </label>
              <div className="relative z-[60]">
                <RaritySelect
                  value={filterRarity}
                  onChange={onRarityChange}
                  counts={rarityCounts}
                  labels={filterLabels}
                />
              </div>
            </div>

            {/* Position Filter */}
            {positions.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--mvx-text-color-primary)]">
                  {t('pages.myNFTs.filters.position')}
                </label>
                <div className="relative z-[60]">
                  <PositionSelect
                    value={filterPosition}
                    onChange={onPositionChange}
                    positions={positions}
                    counts={positionCounts}
                  />
                </div>
              </div>
            )}

            {/* Nationality Filter */}
            {nationalities.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--mvx-text-color-primary)]">
                  {t('pages.myNFTs.filters.nationality')}
                </label>
                <div className="relative z-[60]">
                  <NationalitySelect
                    value={filterNationality}
                    onChange={onNationalityChange}
                    nationalities={nationalities}
                    counts={nationalityCounts}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

