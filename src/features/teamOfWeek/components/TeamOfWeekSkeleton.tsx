import { useTranslation } from 'react-i18next';

interface TeamOfWeekSkeletonProps {
  playerCount?: number;
}

export const TeamOfWeekSkeleton = ({ playerCount = 11 }: TeamOfWeekSkeletonProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[var(--mvx-text-accent-color)] to-[var(--mvx-text-accent-color)]/70 rounded-full mb-6 animate-pulse">
          <span className="text-3xl">⭐</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full max-w-4xl mx-auto mb-6">
          <div className="flex flex-col items-center sm:items-start">
            <div className="h-10 w-64 bg-[var(--mvx-bg-color-secondary)] rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-[var(--mvx-bg-color-secondary)] rounded animate-pulse"></div>
          </div>

          {/* Refresh Button Skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-4 w-32 bg-[var(--mvx-bg-color-secondary)] rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-[var(--mvx-text-accent-color)]/20 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Week Selector Skeleton */}
        <div className="max-w-md mx-auto">
          <div className="w-full h-12 bg-[var(--mvx-bg-color-secondary)] rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Team Info Skeleton */}
      <div className="text-center">
        <div className="h-8 w-80 bg-[var(--mvx-bg-color-secondary)] rounded-lg animate-pulse mx-auto mb-2"></div>
        <div className="h-4 w-64 bg-[var(--mvx-bg-color-secondary)] rounded animate-pulse mx-auto mb-4"></div>
        <div className="flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <span>📅</span>
            <div className="h-4 w-32 bg-[var(--mvx-bg-color-secondary)] rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <span>👥</span>
            <div className="h-4 w-24 bg-[var(--mvx-bg-color-secondary)] rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Loading Message */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 text-[var(--mvx-text-color-secondary)]">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--mvx-text-accent-color)] border-t-transparent"></div>
          <span className="text-sm">{t('pages.teamOfWeek.loading.players')}</span>
        </div>
      </div>

      {/* Players Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {Array.from({ length: playerCount }).map((_, index) => (
          <div
            key={index}
            className="relative group bg-gradient-to-br from-[var(--mvx-bg-color-secondary)] to-[var(--mvx-bg-color-primary)] p-0.5 rounded-xl animate-pulse"
          >
            <div className="bg-[var(--mvx-bg-color-secondary)] rounded-xl overflow-hidden h-full">
              {/* NFT Image Skeleton - Enhanced placeholder */}
              <div className="relative aspect-square overflow-hidden flex items-center justify-center bg-gradient-to-br from-[var(--mvx-bg-color-secondary)] to-[var(--mvx-bg-color-primary)]">
                {/* Animated background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--mvx-text-accent-color)]/10 via-transparent to-[var(--mvx-text-accent-color)]/5 animate-pulse"></div>
                
                <div className="text-center flex flex-col items-center justify-center h-full relative z-10">
                  {/* Main icon with animation */}
                  <div className="text-5xl mb-3 opacity-60 animate-bounce">🎴</div>
                  
                  {/* Loading state skeleton */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--mvx-text-color-secondary)] border-t-[var(--mvx-text-accent-color)]"></div>
                    <div className="h-3 w-16 bg-[var(--mvx-text-color-secondary)]/50 rounded animate-pulse"></div>
                  </div>
                </div>
                
                {/* Badge overlays skeleton */}
                <div className="absolute top-2 right-2">
                  <div className="h-6 w-12 bg-[var(--mvx-text-color-secondary)]/30 rounded-full animate-pulse"></div>
                </div>
                <div className="absolute top-2 left-2">
                  <div className="h-6 w-16 bg-[var(--mvx-text-accent-color)]/30 rounded-full animate-pulse"></div>
                </div>
                
                {/* Subtle border animation */}
                <div className="absolute inset-0 border-2 border-[var(--mvx-text-accent-color)]/20 rounded-lg animate-pulse"></div>
              </div>

              {/* Player Info Skeleton */}
              <div className="p-3 space-y-2">
                <div className="h-4 w-20 bg-[var(--mvx-text-color-secondary)]/30 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-16 bg-[var(--mvx-text-color-secondary)]/20 rounded animate-pulse"></div>

                {/* Score and Rank skeleton */}
                <div className="flex items-center justify-between">
                  <div className="h-3 w-12 bg-[var(--mvx-text-color-secondary)]/20 rounded animate-pulse"></div>
                  <div className="h-3 w-10 bg-[var(--mvx-text-color-secondary)]/20 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-[var(--mvx-bg-color-secondary)] rounded-xl p-4 text-center border border-[var(--mvx-border-color-secondary)] animate-pulse">
            <div className="text-2xl mb-2 opacity-50">📊</div>
            <div className="h-6 w-8 bg-gray-600 rounded animate-pulse mx-auto mb-2"></div>
            <div className="h-3 w-16 bg-gray-700 rounded animate-pulse mx-auto"></div>
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
