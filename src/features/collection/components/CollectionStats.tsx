/**
 * Collection Stats Component - Collapsible Design
 *
 * Displays statistics about the entire NFT collection with collapsible sections:
 * - Total NFTs
 * - Rarity distribution
 * - Position distribution (with full position names)
 * - Top nationalities
 */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GalacticXNFT, CollectionStats as CollectionStatsType } from '../types';

interface CollectionStatsProps {
  nfts: GalacticXNFT[];
  totalCount?: number;
}

// Position mapping from abbreviations to full names
const POSITION_NAMES: Record<string, string> = {
  GK: 'Goalkeeper',
  CB: 'Centre Back',
  RB: 'Right Back',
  LB: 'Left Back',
  CDM: 'Central Defensive Midfielder',
  CM: 'Central Midfielder',
  CAM: 'Central Attacking Midfielder',
  AM: 'Attacking Midfielder',
  CF: 'Centre Forward',
  ST: 'Striker',
  LW: 'Left Wing',
  RW: 'Right Wing',
  LM: 'Left Midfielder',
  RM: 'Right Midfielder',
  DM: 'Defensive Midfielder',
  SW: 'Sweeper',
  LWB: 'Left Wing Back',
  RWB: 'Right Wing Back',
  Unknown: 'Unknown',
  'Team Emblem': 'Team Emblem',
  'Europa L.Card': 'Europa League Card',
  'Champions L. Card': 'Champions League Card',
  Manager: 'Manager',
  Stadium: 'Stadium',
  JO: 'Joker',
  MH: 'Midfield Holder'
};

/**
 * Compute collection statistics from NFT data
 */
const computeStats = (nfts: GalacticXNFT[]): CollectionStatsType => {
  const stats: CollectionStatsType = {
    totalNFTs: nfts.length,
    rarityDistribution: {
      Common: 0,
      Rare: 0,
      Epic: 0,
      Legendary: 0,
      Mythic: 0
    },
    positionDistribution: {},
    nationalityDistribution: {},
    topNationalities: []
  };
  
  // Count rarity, position, and nationality
  nfts.forEach(nft => {
    // Rarity
    if (nft.rarity) {
      stats.rarityDistribution[nft.rarity] = 
        (stats.rarityDistribution[nft.rarity] || 0) + 1;
    }
    
    // Position
    if (nft.position) {
      stats.positionDistribution[nft.position] = 
        (stats.positionDistribution[nft.position] || 0) + 1;
    }
    
    // Nationality
    if (nft.attributes.nationality) {
      const nationality = nft.attributes.nationality as string;
      stats.nationalityDistribution[nationality] = 
        (stats.nationalityDistribution[nationality] || 0) + 1;
    }
  });
  
  // Get top 10 nationalities
  stats.topNationalities = Object.entries(stats.nationalityDistribution)
    .map(([nationality, count]) => ({ nationality, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return stats;
};

export const CollectionStats = ({ nfts, totalCount }: CollectionStatsProps) => {
  const { t } = useTranslation();

  // Collapsible state
  const [isExpanded, setIsExpanded] = useState(true);

  const stats = useMemo(() => computeStats(nfts), [nfts]);
  
  // Rarity colors
  const rarityColors: Record<string, string> = {
    Mythic: 'from-purple-500 to-pink-500',
    Legendary: 'from-yellow-500 to-orange-500',
    Epic: 'from-purple-400 to-blue-500',
    Rare: 'from-blue-400 to-cyan-500',
    Common: 'from-gray-400 to-gray-500'
  };
  
  return (
    <div className="mb-8">
      {/* Collapsible Stats Panel */}
      <div className="bg-[var(--mvx-bg-color-secondary)]/80 backdrop-blur-sm rounded-2xl border border-[var(--mvx-border-color-secondary)] shadow-lg overflow-hidden">
        {/* Collapsible Header */}
        <div
          className="p-6 cursor-pointer select-none transition-all duration-300 hover:bg-[var(--mvx-bg-color-secondary)]/60"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-[var(--mvx-text-accent-color)]/20 text-[var(--mvx-text-accent-color)]">
                <span className="text-lg">📊</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--mvx-text-color-primary)]">
                  Collection Statistics
                </h2>
                <p className="text-sm text-[var(--mvx-text-color-secondary)]">
                  {stats.totalNFTs.toLocaleString()} NFTs • {Object.keys(stats.positionDistribution).length} positions • {stats.topNationalities.length} nationalities
                </p>
              </div>
            </div>

            <div className={`p-2 rounded-xl bg-[var(--mvx-bg-color-secondary)] transition-all duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}>
              <span className="text-lg text-[var(--mvx-text-color-secondary)]">▼</span>
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        <div className={`transition-all duration-300 overflow-hidden ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="p-6 pt-0 space-y-6">
            {/* Rarity Distribution */}
      <div className="bg-[var(--mvx-bg-color-secondary)] rounded-xl p-6 border border-[var(--mvx-border-color-secondary)]">
        <h3 className="text-xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
          {t('collection.stats.rarityDistribution')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {(['Mythic', 'Legendary', 'Epic', 'Rare', 'Common'] as const).map(rarity => (
            <div
              key={rarity}
              className="text-center p-4 rounded-lg bg-[var(--mvx-bg-color-primary)]"
            >
              <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${rarityColors[rarity]} text-white text-sm font-bold mb-2`}>
                {t(`pages.myNFTs.filters.${rarity.toLowerCase()}`)}
              </div>
              <p className="text-2xl font-bold text-[var(--mvx-text-color-primary)]">
                {stats.rarityDistribution[rarity]}
              </p>
              <p className="text-xs text-[var(--mvx-text-color-secondary)]">
                {((stats.rarityDistribution[rarity] / stats.totalNFTs) * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

            {/* Position Distribution */}
            <div className="bg-[var(--mvx-bg-color-secondary)] rounded-xl p-6 border border-[var(--mvx-border-color-secondary)]">
              <h3 className="text-xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
                {t('collection.stats.positionDistribution')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Object.entries(stats.positionDistribution)
                  .sort((a, b) => b[1] - a[1])
                  .map(([position, count]) => (
                    <div
                      key={position}
                      className="text-center p-4 rounded-lg bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)] hover:border-[var(--mvx-text-accent-color)]/30 transition-colors"
                    >
                      <div className="space-y-2">
                        {/* Position name in large text */}
                        <p className="text-sm font-bold text-[var(--mvx-text-color-primary)] leading-tight">
                          {POSITION_NAMES[position] || position}
                        </p>
                        {/* Abbreviation in small text below */}
                        <p className="text-xs text-[var(--mvx-text-color-secondary)] font-medium">
                          {position}
                        </p>
                        {/* Count and percentage side by side */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-[var(--mvx-text-accent-color)]">
                            {count}
                          </span>
                          <span className="text-[var(--mvx-text-color-secondary)]">
                            {((count / stats.totalNFTs) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Top Nationalities */}
            <div className="bg-[var(--mvx-bg-color-secondary)] rounded-xl p-6 border border-[var(--mvx-border-color-secondary)]">
              <h3 className="text-xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
                {t('collection.stats.topNationalities')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {stats.topNationalities.map(({ nationality, count }, index) => (
                  <div
                    key={nationality}
                    className="p-3 rounded-lg bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)]"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-[var(--mvx-text-accent-color)]">
                        #{index + 1}
                      </span>
                      <span className="text-sm text-[var(--mvx-text-color-primary)] truncate">
                        {nationality}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-[var(--mvx-text-color-primary)]">
                      {count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

