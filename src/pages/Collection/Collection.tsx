/**
 * Collection Page - Public Overview with Infinite Scroll
 *
 * Displays the GalacticX NFT collection with:
 * - Collection statistics
 * - Modern filter panel (collapsible)
 * - Infinite scroll for better performance
 * - Search functionality across all NFTs
 * - NFT details modal
 */
import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCollectionPagination,
  useCollectionNFTCount,
  useRefreshCollection,
  CollectionStats,
  CollectionFilters,
  CollectionGrid,
  CollectionSkeleton
} from 'features/collection';
import { NFTDetailModal } from 'features/myNFTs';
import type { GalacticXNFT } from 'features/collection';

type FilterOption = 'all' | 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export const Collection = () => {
  const { t } = useTranslation();

  // Fetch collection data for stats
  const { data: totalCount } = useCollectionNFTCount();
  const refreshCollection = useRefreshCollection();

  // Filter state - will be managed by the pagination hook
  const [filterRarity, setFilterRarity] = useState<FilterOption>('all');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [filterNationality, setFilterNationality] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Use pagination hook for efficient data management
  const {
    allNFTs,
    allNFTsLoading,
    allNFTsError,
    displayedNFTs,
    displayedNFTsLoading,
    hasMore,
    loadMore,
    resetPagination,
    totalFilteredCount,
    updateFilters
  } = useCollectionPagination({
    initialDisplayCount: 50,
    incrementCount: 50
  });

  // Modal state
  const [selectedNFT, setSelectedNFT] = useState<GalacticXNFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract unique positions and nationalities from all NFTs (for filter options)
  const uniquePositions = useMemo(() => {
    const positions = new Set<string>();
    allNFTs.forEach(nft => {
      if (nft.position) {
        positions.add(nft.position);
      }
    });
    return Array.from(positions).sort();
  }, [allNFTs]);

  const uniqueNationalities = useMemo(() => {
    const nationalities = new Set<string>();
    allNFTs.forEach(nft => {
      if (nft.attributes.nationality) {
        nationalities.add(nft.attributes.nationality as string);
      }
    });
    return Array.from(nationalities).sort();
  }, [allNFTs]);

  // Update filters in pagination hook when local state changes
  const handleFilterChange = useCallback((type: string, value: string) => {
    switch (type) {
      case 'rarity':
        setFilterRarity(value as FilterOption);
        updateFilters({ rarity: value });
        break;
      case 'position':
        setFilterPosition(value);
        updateFilters({ position: value });
        break;
      case 'nationality':
        setFilterNationality(value);
        updateFilters({ nationality: value });
        break;
      case 'search':
        setSearchQuery(value);
        updateFilters({ searchQuery: value });
        break;
    }
  }, [updateFilters]);

  // Count by rarity for dropdown (based on all NFTs)
  const rarityCounts: Record<FilterOption, number> = useMemo(() => ({
    all: allNFTs.length,
    Common: allNFTs.filter(n => n.rarity === 'Common').length,
    Rare: allNFTs.filter(n => n.rarity === 'Rare').length,
    Epic: allNFTs.filter(n => n.rarity === 'Epic').length,
    Legendary: allNFTs.filter(n => n.rarity === 'Legendary').length,
    Mythic: allNFTs.filter(n => n.rarity === 'Mythic').length
  }), [allNFTs]);

  // Count by position (based on all NFTs)
  const positionCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = { all: allNFTs.length };
    uniquePositions.forEach((pos: string) => {
      counts[pos] = allNFTs.filter(n => n.position === pos).length;
    });
    return counts;
  }, [allNFTs, uniquePositions]);

  // Count by nationality (based on all NFTs)
  const nationalityCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = { all: allNFTs.length };
    uniqueNationalities.forEach((nat: string) => {
      counts[nat] = allNFTs.filter(n => n.attributes.nationality === nat).length;
    });
    return counts;
  }, [allNFTs, uniqueNationalities]);
  
  // Handle NFT click
  const handleNFTClick = (nft: GalacticXNFT) => {
    setSelectedNFT(nft);
    if (!isModalOpen) {
      setIsModalOpen(true);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedNFT(null), 500);
  };

  // Handle refresh
  const handleRefresh = async () => {
    await refreshCollection();
    resetPagination();
  };

  // Handle load more
  const handleLoadMore = () => {
    loadMore();
  };
  
  // Show skeleton while loading initial data or when no NFTs are available yet
  if (allNFTsLoading || allNFTs.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <CollectionSkeleton nftCount={20} />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--mvx-text-color-primary)] to-[var(--mvx-text-accent-color)] bg-clip-text text-transparent">
          🌌 {t('collection.title')}
        </h1>
        <p className="text-lg text-[var(--mvx-text-color-secondary)]">
          {t('collection.subtitle')}
          {totalFilteredCount > 0 && (
            <span className="ml-2 text-sm text-[var(--mvx-text-color-secondary)] opacity-75">
              • {totalFilteredCount.toLocaleString()} {t('collection.nftsFiltered', { count: totalFilteredCount })}
            </span>
          )}
        </p>
      </div>

      {/* Stats Section */}
      {!allNFTsError && allNFTs.length > 0 && (
        <CollectionStats nfts={allNFTs} totalCount={totalCount} />
      )}

      {/* Filters Section */}
      {!allNFTsError && allNFTs.length > 0 && (
        <CollectionFilters
          filterRarity={filterRarity}
          onRarityChange={(value) => handleFilterChange('rarity', value)}
          rarityCounts={rarityCounts}
          filterPosition={filterPosition}
          onPositionChange={(value) => handleFilterChange('position', value)}
          positions={uniquePositions}
          positionCounts={positionCounts}
          filterNationality={filterNationality}
          onNationalityChange={(value) => handleFilterChange('nationality', value)}
          nationalities={uniqueNationalities}
          nationalityCounts={nationalityCounts}
          searchQuery={searchQuery}
          onSearchChange={(value) => handleFilterChange('search', value)}
          onRefresh={handleRefresh}
          isRefreshing={false} // We don't use React Query's isRefetching here
        />
      )}

      {/* Results Summary */}
      {totalFilteredCount > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-[var(--mvx-text-color-secondary)]">
            <span>
              {t('collection.showingResults', {
                shown: displayedNFTs.length,
                total: totalFilteredCount
              })}
            </span>
            {hasMore && (
              <span className="opacity-75">
                {t('collection.scrollToLoadMore')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* NFT Grid with Infinite Scroll */}
      <CollectionGrid
        nfts={displayedNFTs}
        onNFTClick={handleNFTClick}
        loading={displayedNFTsLoading}
        error={allNFTsError}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        isLoadingMore={displayedNFTsLoading && displayedNFTs.length > 0}
      />

      {/* NFT Detail Modal */}
      <NFTDetailModal
        nft={selectedNFT}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

