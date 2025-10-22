/**
 * Collection Grid Component
 *
 * Displays NFTs in a responsive grid with infinite scroll support
 * Reuses NFTCard from myNFTs feature
 */
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useCallback } from 'react';
import { NFTCard } from 'features/myNFTs';
import type { GalacticXNFT } from '../types';

interface CollectionGridProps {
  nfts: GalacticXNFT[];
  onNFTClick: (nft: GalacticXNFT) => void;
  loading?: boolean;
  error?: Error | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export const CollectionGrid = ({
  nfts,
  onNFTClick,
  loading = false,
  error = null,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false
}: CollectionGridProps) => {
  const { t } = useTranslation();

  // Refs for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Infinite scroll intersection observer
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && onLoadMore && !isLoadingMore) {
      onLoadMore();
    }
  }, [hasMore, onLoadMore, isLoadingMore]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [handleIntersection, hasMore]);
  
  // Loading state
  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin inline-block w-16 h-16 border-4 border-[var(--mvx-border-color-secondary)] border-t-[var(--mvx-text-accent-color)] rounded-full mb-4"></div>
        <p className="text-[var(--mvx-text-color-secondary)] text-lg">
          {t('collection.loading')}
        </p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">❌</div>
        <p className="text-2xl mb-4 text-[var(--mvx-text-color-primary)] font-bold">
          {t('collection.error.title')}
        </p>
        <p className="text-sm mb-6 text-[var(--mvx-text-color-secondary)]">
          {error.message}
        </p>
      </div>
    );
  }
  
  // Empty state
  if (nfts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-xl text-[var(--mvx-text-color-secondary)]">
          {t('pages.myNFTs.noResults')}
        </p>
      </div>
    );
  }
  
  // NFT Grid with infinite scroll
  return (
    <div className="space-y-6">
      {/* NFT Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        {nfts.map((nft: GalacticXNFT) => (
          <NFTCard
            key={nft.identifier}
            nft={nft}
            onClick={onNFTClick}
          />
        ))}
      </div>

      {/* Infinite scroll trigger and loading indicator */}
      {hasMore && (
        <div ref={loadMoreRef} className="text-center py-8">
          {isLoadingMore ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-[var(--mvx-border-color-secondary)] border-t-[var(--mvx-text-accent-color)] rounded-full"></div>
              <span className="text-[var(--mvx-text-color-secondary)]">
                {t('collection.loadingMore')}
              </span>
            </div>
          ) : (
            <div className="text-[var(--mvx-text-color-secondary)] opacity-60">
              {t('collection.scrollForMore')}
            </div>
          )}
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && nfts.length > 0 && (
        <div className="text-center py-8">
          <div className="text-[var(--mvx-text-color-secondary)] opacity-60">
            {t('collection.endOfResults')}
          </div>
        </div>
      )}
    </div>
  );
};

