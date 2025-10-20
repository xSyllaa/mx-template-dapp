import { useState } from 'react';
import { NFTCard } from 'features/myNFTs';
import type { GalacticXNFT } from 'features/myNFTs';

interface VerticalNFTCardProps {
  nft: GalacticXNFT;
  isPlaced?: boolean;
  onDragStart?: (nft: GalacticXNFT) => void;
  onDragEnd?: () => void;
  onClick?: (nft: GalacticXNFT) => void;
}

export const VerticalNFTCard = ({ 
  nft, 
  isPlaced = false, 
  onDragStart, 
  onDragEnd, 
  onClick 
}: VerticalNFTCardProps) => {
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
