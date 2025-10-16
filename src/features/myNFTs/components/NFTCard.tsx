/**
 * NFT Card Component - Premium card display for NFTs
 */
import type { GalacticXNFT } from '../types';

interface NFTCardProps {
  nft: GalacticXNFT;
  onClick?: (nft: GalacticXNFT) => void;
}

// Rarity styles with modern gradients and glows
const rarityStyles: Record<GalacticXNFT['rarity'], { 
  border: string; 
  glow: string; 
  badge: string;
  badgeText: string;
}> = {
  Mythic: {
    border: 'border-red-500/50',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]',
    badge: 'bg-gradient-to-r from-red-500 to-pink-500',
    badgeText: 'text-white'
  },
  Legendary: {
    border: 'border-yellow-500/50',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]',
    badge: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    badgeText: 'text-white'
  },
  Epic: {
    border: 'border-purple-500/50',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]',
    badge: 'bg-gradient-to-r from-purple-500 to-pink-500',
    badgeText: 'text-white'
  },
  Rare: {
    border: 'border-blue-500/50',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]',
    badge: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    badgeText: 'text-white'
  },
  Common: {
    border: 'border-gray-500/30',
    glow: 'shadow-lg hover:shadow-xl',
    badge: 'bg-gradient-to-r from-gray-500 to-gray-600',
    badgeText: 'text-white'
  }
};

export const NFTCard = ({ nft, onClick }: NFTCardProps) => {
  const style = rarityStyles[nft.rarity];
  
  const handleClick = () => {
    if (onClick) {
      onClick(nft);
    }
  };
  
  return (
      <div
      onClick={handleClick}
      className={`
        group relative overflow-hidden rounded-2xl border-2 ${style.border}
        bg-gradient-to-br from-secondary to-tertiary
        backdrop-blur-md ${style.glow}
        transition-all duration-300 hover:-translate-y-2 cursor-pointer
      `}
    >
      {/* NFT Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {nft.imageUrl ? (
          <>
            <img
              src={nft.imageUrl}
              alt={nft.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-6xl">
            🎴
          </div>
        )}
        
        {/* Rarity Badge (top-right) */}
        <div className={`absolute top-3 right-3 ${style.badge} ${style.badgeText} px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm`}>
          {nft.rarity}
        </div>
      </div>
      
      {/* NFT Info */}
      <div className="p-4">
        {/* Name */}
        <h3 className="font-bold text-primary text-base mb-2 truncate">
          {nft.name}
        </h3>
        
        {/* Position & Number */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 rounded-md bg-tertiary/20 text-primary text-xs font-semibold">
            {nft.position}
          </span>
          {nft.attributes.number && (
            <span className="px-2 py-1 rounded-md bg-tertiary/10 text-secondary text-xs font-medium">
              #{nft.attributes.number}
            </span>
          )}
        </div>
        
        {/* Nationality */}
        {nft.attributes.nationality && (
          <p className="text-xs text-secondary mb-2">
            🌍 {nft.attributes.nationality}
          </p>
        )}
        
        {/* NFT ID */}
        <p className="text-[10px] text-tertiary truncate">
          ID: {nft.nonce}
        </p>
      </div>
      
      {/* Hover Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_2s_infinite]" />
      </div>
    </div>
  );
};

