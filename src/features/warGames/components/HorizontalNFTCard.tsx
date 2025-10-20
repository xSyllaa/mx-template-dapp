import { useState } from 'react';
import type { GalacticXNFT } from 'features/myNFTs';

interface HorizontalNFTCardProps {
  nft: GalacticXNFT;
  isPlaced?: boolean;
  onDragStart?: (nft: GalacticXNFT) => void;
  onDragEnd?: () => void;
  onClick?: (nft: GalacticXNFT) => void;
}

// Rarity styles for horizontal cards
const rarityStyles: Record<GalacticXNFT['rarity'], { 
  border: string; 
  glow: string; 
  badge: string;
  badgeText: string;
}> = {
  Mythic: {
    border: 'border-red-500/50',
    glow: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]',
    badge: 'bg-gradient-to-r from-red-500 to-pink-500',
    badgeText: 'text-white'
  },
  Legendary: {
    border: 'border-yellow-500/50',
    glow: 'shadow-[0_0_10px_rgba(234,179,8,0.3)]',
    badge: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    badgeText: 'text-white'
  },
  Epic: {
    border: 'border-purple-500/50',
    glow: 'shadow-[0_0_10px_rgba(168,85,247,0.3)]',
    badge: 'bg-gradient-to-r from-purple-500 to-pink-500',
    badgeText: 'text-white'
  },
  Rare: {
    border: 'border-blue-500/50',
    glow: 'shadow-[0_0_10px_rgba(59,130,246,0.3)]',
    badge: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    badgeText: 'text-white'
  },
  Common: {
    border: 'border-gray-500/30',
    glow: 'shadow-lg',
    badge: 'bg-gradient-to-r from-gray-500 to-gray-600',
    badgeText: 'text-white'
  }
};

export const HorizontalNFTCard = ({ 
  nft, 
  isPlaced = false, 
  onDragStart, 
  onDragEnd, 
  onClick 
}: HorizontalNFTCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const style = rarityStyles[nft.rarity];

  const handleDragStart = (e: React.DragEvent) => {
    if (isPlaced) {
      e.preventDefault();
      return;
    }

    setIsDragging(true);
    
    // Store NFT data in dataTransfer
    e.dataTransfer.setData('application/json', JSON.stringify(nft));
    e.dataTransfer.effectAllowed = 'move';
    
    // Create custom drag image (just the NFT image)
    const dragImage = document.createElement('div');
    dragImage.className = 'w-16 h-16 rounded-lg overflow-hidden border-2 border-blue-500 bg-white shadow-lg';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    
    if (nft.imageUrl) {
      const img = document.createElement('img');
      img.src = nft.imageUrl;
      img.alt = nft.name;
      img.className = 'w-full h-full object-cover';
      dragImage.appendChild(img);
    } else {
      dragImage.innerHTML = '<div class="w-full h-full bg-gray-300 flex items-center justify-center text-lg">🎴</div>';
    }
    
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 32, 32);
    
    // Clean up after drag starts
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);
    
    // Notify parent
    onDragStart?.(nft);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  const handleClick = () => {
    if (!isDragging) {
      onClick?.(nft);
    }
  };

  return (
    <div
      draggable={!isPlaced}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`
        group relative overflow-hidden rounded-lg border-2 ${style.border}
        bg-gradient-to-r from-[var(--mvx-bg-color-secondary)] to-[var(--mvx-bg-color-primary)]
        backdrop-blur-md ${style.glow}
        transition-all duration-200 cursor-pointer
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isPlaced ? 'opacity-60 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
        ${!isPlaced ? 'hover:scale-105' : ''}
      `}
    >
      <div className="flex items-center p-3">
        {/* NFT Image */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 mr-3">
          {nft.imageUrl ? (
            <img
              src={nft.imageUrl}
              alt={nft.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-lg">
              🎴
            </div>
          )}
          
          {/* Rarity Badge */}
          <div className={`absolute -top-1 -right-1 ${style.badge} ${style.badgeText} px-1 py-0.5 rounded-full text-xs font-bold`}>
            {nft.rarity.charAt(0)}
          </div>
        </div>
        
        {/* NFT Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[var(--mvx-text-color-primary)] text-sm truncate">
            {nft.name}
          </h3>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-md bg-[var(--mvx-bg-accent-color)] text-[var(--mvx-text-color-primary)] text-xs font-semibold">
              {nft.position}
            </span>
            
            {nft.attributes.number && (
              <span className="px-2 py-0.5 rounded-md bg-[var(--mvx-bg-color-primary)] text-[var(--mvx-text-color-secondary)] text-xs">
                #{nft.attributes.number}
              </span>
            )}
          </div>
          
          {nft.attributes.nationality && (
            <p className="text-xs text-[var(--mvx-text-color-secondary)] mt-1">
              🌍 {nft.attributes.nationality}
            </p>
          )}
        </div>
      </div>
      
      {/* Hover Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_2s_infinite]" />
      </div>
    </div>
  );
};
