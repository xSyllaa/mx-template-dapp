/**
 * Collection Pagination Hook
 *
 * Handles progressive loading of NFTs with infinite scroll while maintaining
 * full dataset for filtering capabilities.
 *
 * Key features:
 * - Loads all NFTs in background for filtering
 * - Displays only 50 NFTs initially (configurable)
 * - Infinite scroll to load more NFTs
 * - Maintains filtered results across pagination
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useCollectionNFTs } from './useCollectionData';
import type { GalacticXNFT } from '../types';

interface UseCollectionPaginationOptions {
  initialDisplayCount?: number;
  incrementCount?: number;
}

interface UseCollectionPaginationReturn {
  // All NFTs (for filtering)
  allNFTs: GalacticXNFT[];
  allNFTsLoading: boolean;
  allNFTsError: Error | null;

  // Paginated NFTs (for display)
  displayedNFTs: GalacticXNFT[];
  displayedNFTsLoading: boolean;

  // Pagination state
  hasMore: boolean;
  loadMore: () => void;
  resetPagination: () => void;

  // Current pagination info
  currentCount: number;
  totalFilteredCount: number;
}

export const useCollectionPagination = (
  options: UseCollectionPaginationOptions = {}
): UseCollectionPaginationReturn => {
  const { initialDisplayCount = 50, incrementCount = 50 } = options;

  // State for pagination
  const [displayedCount, setDisplayedCount] = useState(initialDisplayCount);
  const [filterCriteria, setFilterCriteria] = useState<{
    rarity: string;
    position: string;
    nationality: string;
    searchQuery: string;
  }>({
    rarity: 'all',
    position: 'all',
    nationality: 'all',
    searchQuery: ''
  });

  // Get all NFTs for filtering (background loading)
  const {
    data: allNFTs = [],
    isLoading: allNFTsLoading,
    error: allNFTsError
  } = useCollectionNFTs();

  // Filter function - applied to all NFTs
  const filterNFTs = useCallback((nfts: GalacticXNFT[], criteria: typeof filterCriteria) => {
    return nfts.filter(nft => {
      // Rarity filter
      if (criteria.rarity !== 'all' && nft.rarity !== criteria.rarity) {
        return false;
      }

      // Position filter
      if (criteria.position !== 'all' && nft.position !== criteria.position) {
        return false;
      }

      // Nationality filter
      if (criteria.nationality !== 'all' && nft.attributes.nationality !== criteria.nationality) {
        return false;
      }

      // Search query - search in all attributes
      if (criteria.searchQuery.trim()) {
        const query = criteria.searchQuery.toLowerCase();

        // Search in NFT name
        if (nft.name.toLowerCase().includes(query)) {
          return true;
        }

        // Search in real player name
        if (nft.realPlayerName && nft.realPlayerName.toLowerCase().includes(query)) {
          return true;
        }

        // Search in position
        if (nft.position.toLowerCase().includes(query)) {
          return true;
        }

        // Search in all attributes
        for (const [key, value] of Object.entries(nft.attributes)) {
          if (value && String(value).toLowerCase().includes(query)) {
            return true;
          }
        }

        return false;
      }

      return true;
    });
  }, []);

  // Filtered NFTs (applied to all NFTs)
  const filteredNFTs = useMemo(() => {
    return filterNFTs(allNFTs, filterCriteria);
  }, [allNFTs, filterCriteria, filterNFTs]);

  // Paginated NFTs (subset of filtered NFTs for display)
  const displayedNFTs = useMemo(() => {
    return filteredNFTs.slice(0, displayedCount);
  }, [filteredNFTs, displayedCount]);

  // Pagination state
  const hasMore = displayedCount < filteredNFTs.length;
  const totalFilteredCount = filteredNFTs.length;

  // Load more function
  const loadMore = useCallback(() => {
    if (hasMore) {
      setDisplayedCount(prev => prev + incrementCount);
    }
  }, [hasMore, incrementCount]);

  // Reset pagination (when filters change)
  const resetPagination = useCallback(() => {
    setDisplayedCount(initialDisplayCount);
  }, [initialDisplayCount]);

  // Update filter criteria and reset pagination
  const updateFilters = useCallback((newCriteria: Partial<typeof filterCriteria>) => {
    setFilterCriteria(prev => ({ ...prev, ...newCriteria }));
    resetPagination();
  }, [resetPagination]);

  // Expose updateFilters function by adding it to the return object
  useEffect(() => {
    // This is handled by the parent component passing filter criteria
    // We'll expose an updateFilters function in the return object
  }, []);

  return {
    // All NFTs data
    allNFTs,
    allNFTsLoading,
    allNFTsError,

    // Display data
    displayedNFTs,
    displayedNFTsLoading: allNFTsLoading,

    // Pagination controls
    hasMore,
    loadMore,
    resetPagination,

    // Info
    currentCount: displayedCount,
    totalFilteredCount,

    // Filter management (to be used by parent)
    updateFilters: updateFilters as any // Type assertion to avoid complex typing
  };
};
