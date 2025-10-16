/**
 * NFT Stats Component - Displays collection statistics
 */
import type { GalacticXNFT } from '../types';

interface NFTStatsProps {
  nfts: GalacticXNFT[];
  totalCount: number;
}

// Rarity colors for badges
const rarityColors: Record<GalacticXNFT['rarity'], { bg: string; text: string; border: string }> = {
  Mythic: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  Legendary: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  Epic: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  Rare: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  Common: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' }
};

export const NFTStats = ({ nfts, totalCount }: NFTStatsProps) => {
  // Count NFTs by rarity
  const rarityCounts = {
    Mythic: nfts.filter(n => n.rarity === 'Mythic').length,
    Legendary: nfts.filter(n => n.rarity === 'Legendary').length,
    Epic: nfts.filter(n => n.rarity === 'Epic').length,
    Rare: nfts.filter(n => n.rarity === 'Rare').length,
    Common: nfts.filter(n => n.rarity === 'Common').length
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {/* Total NFTs */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--mvx-border)] bg-gradient-to-br from-[var(--mvx-bg-secondary)] to-[var(--mvx-bg-tertiary)] p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[var(--mvx-text-secondary)] mb-1">Total NFTs</span>
          <span className="text-3xl font-bold text-[var(--mvx-text-primary)]">{totalCount}</span>
        </div>
        <div className="absolute -right-4 -bottom-4 text-6xl opacity-10">🎴</div>
      </div>
      
      {/* Mythic */}
      {rarityCounts.Mythic > 0 && (
        <div className={`relative overflow-hidden rounded-xl border ${rarityColors.Mythic.border} ${rarityColors.Mythic.bg} p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl hover:scale-105`}>
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${rarityColors.Mythic.text} mb-1`}>Mythic</span>
            <span className={`text-3xl font-bold ${rarityColors.Mythic.text}`}>{rarityCounts.Mythic}</span>
          </div>
          <div className="absolute -right-2 -bottom-2 text-4xl opacity-20">💎</div>
        </div>
      )}
      
      {/* Legendary */}
      {rarityCounts.Legendary > 0 && (
        <div className={`relative overflow-hidden rounded-xl border ${rarityColors.Legendary.border} ${rarityColors.Legendary.bg} p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl hover:scale-105`}>
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${rarityColors.Legendary.text} mb-1`}>Legendary</span>
            <span className={`text-3xl font-bold ${rarityColors.Legendary.text}`}>{rarityCounts.Legendary}</span>
          </div>
          <div className="absolute -right-2 -bottom-2 text-4xl opacity-20">⭐</div>
        </div>
      )}
      
      {/* Epic */}
      {rarityCounts.Epic > 0 && (
        <div className={`relative overflow-hidden rounded-xl border ${rarityColors.Epic.border} ${rarityColors.Epic.bg} p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl hover:scale-105`}>
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${rarityColors.Epic.text} mb-1`}>Epic</span>
            <span className={`text-3xl font-bold ${rarityColors.Epic.text}`}>{rarityCounts.Epic}</span>
          </div>
          <div className="absolute -right-2 -bottom-2 text-4xl opacity-20">✨</div>
        </div>
      )}
      
      {/* Rare */}
      {rarityCounts.Rare > 0 && (
        <div className={`relative overflow-hidden rounded-xl border ${rarityColors.Rare.border} ${rarityColors.Rare.bg} p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl hover:scale-105`}>
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${rarityColors.Rare.text} mb-1`}>Rare</span>
            <span className={`text-3xl font-bold ${rarityColors.Rare.text}`}>{rarityCounts.Rare}</span>
          </div>
          <div className="absolute -right-2 -bottom-2 text-4xl opacity-20">💠</div>
        </div>
      )}
      
      {/* Common */}
      {rarityCounts.Common > 0 && (
        <div className={`relative overflow-hidden rounded-xl border ${rarityColors.Common.border} ${rarityColors.Common.bg} p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl hover:scale-105`}>
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${rarityColors.Common.text} mb-1`}>Common</span>
            <span className={`text-3xl font-bold ${rarityColors.Common.text}`}>{rarityCounts.Common}</span>
          </div>
          <div className="absolute -right-2 -bottom-2 text-4xl opacity-20">⚪</div>
        </div>
      )}
    </div>
  );
};

