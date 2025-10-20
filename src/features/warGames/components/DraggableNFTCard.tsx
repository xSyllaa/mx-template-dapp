import { useState } from 'react';
import { NFTCard } from 'features/myNFTs';
import type { GalacticXNFT } from 'features/myNFTs';

interface DraggableNFTCardProps {
  nft: GalacticXNFT;
  isPlaced?: boolean;
  onDragStart?: (nft: GalacticXNFT) => void;
  onDragEnd?: () => void;
  onClick?: (nft: GalacticXNFT) => void;
}

export const DraggableNFTCard = ({ 
  nft, 
  isPlaced = false, 
  onDragStart, 
  onDragEnd, 
  onClick 
}: DraggableNFTCardProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (isPlaced) {
      e.preventDefault();
      return;
    }

    setIsDragging(true);
    
    // Store NFT data in dataTransfer
    e.dataTransfer.setData('application/json', JSON.stringify(nft));
    e.dataTransfer.effectAllowed = 'move';
    
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
        transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isPlaced ? 'opacity-60 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
        ${!isPlaced ? 'hover:scale-105' : ''}
      `}
    >
      <NFTCard nft={nft} />
    </div>
  );
};
