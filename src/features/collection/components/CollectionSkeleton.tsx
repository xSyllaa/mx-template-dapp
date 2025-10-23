import { useTranslation } from 'react-i18next';

interface CollectionSkeletonProps {
  nftCount?: number;
}

export const CollectionSkeleton = ({ nftCount = 20 }: CollectionSkeletonProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="mb-12">
        <div className="h-12 w-80 bg-[var(--mvx-bg-color-secondary)] rounded-lg animate-pulse mb-4"></div>
        <div className="h-6 w-96 bg-[var(--mvx-bg-color-secondary)] rounded animate-pulse"></div>
      </div>

      {/* Stats Section Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-[var(--mvx-bg-color-secondary)] rounded-xl p-6 text-center border border-[var(--mvx-border-color-secondary)] animate-pulse">
            <div className="text-3xl mb-3 opacity-50">📊</div>
            <div className="h-8 w-16 bg-gray-600 rounded animate-pulse mx-auto mb-2"></div>
            <div className="h-4 w-20 bg-gray-700 rounded animate-pulse mx-auto"></div>
          </div>
        ))}
      </div>

      {/* Filters Section Skeleton */}
      <div className="bg-[var(--mvx-bg-color-secondary)] rounded-xl p-6 border border-[var(--mvx-border-color-secondary)] mb-8 animate-pulse">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Input Skeleton */}
          <div className="flex-1 max-w-md">
            <div className="h-12 w-full bg-gray-600 rounded-lg animate-pulse"></div>
          </div>

          {/* Filter Dropdowns Skeleton */}
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-12 w-32 bg-gray-600 rounded-lg animate-pulse"></div>
            ))}
          </div>

          {/* Refresh Button Skeleton */}
          <div className="h-12 w-24 bg-[var(--mvx-text-accent-color)]/20 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Loading Message */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 text-[var(--mvx-text-color-secondary)]">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--mvx-text-accent-color)] border-t-transparent"></div>
          <span className="text-sm">{t('collection.loading.nfts')}</span>
        </div>
      </div>

      {/* NFT Grid Skeleton */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: nftCount }).map((_, index) => (
          <div
            key={index}
            className="relative group bg-gradient-to-br from-[var(--mvx-bg-color-secondary)] to-[var(--mvx-bg-color-primary)] p-0.5 rounded-xl animate-pulse"
          >
            <div className="bg-[var(--mvx-bg-color-secondary)] rounded-xl overflow-hidden h-full">
              {/* NFT Image Skeleton */}
              <div className="relative aspect-square overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                <div className="text-center flex flex-col items-center justify-center h-full">
                  <div className="text-4xl mb-2 opacity-50">🎴</div>
                  <div className="h-3 w-16 bg-gray-600 rounded animate-pulse"></div>
                </div>

                {/* Badge overlays skeleton */}
                <div className="absolute top-2 right-2">
                  <div className="h-6 w-12 bg-gray-600/90 rounded-full animate-pulse"></div>
                </div>
                <div className="absolute top-2 left-2">
                  <div className="h-6 w-16 bg-[var(--mvx-text-accent-color)]/90 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* NFT Info Skeleton */}
              <div className="p-3 space-y-2">
                <div className="h-4 w-20 bg-gray-600 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-16 bg-gray-700 rounded animate-pulse"></div>

                {/* Score and Rank skeleton */}
                <div className="flex items-center justify-between">
                  <div className="h-3 w-12 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-3 w-10 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="text-center text-sm text-[var(--mvx-text-color-tertiary)] border-t border-[var(--mvx-border-color-secondary)] pt-6">
        <div className="h-4 w-64 bg-[var(--mvx-bg-color-secondary)] rounded animate-pulse mx-auto"></div>
      </div>
    </div>
  );
};
