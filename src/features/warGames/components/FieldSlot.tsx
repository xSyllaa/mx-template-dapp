import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TeamSlot, FormationPosition } from '../types';
import type { GalacticXNFT } from 'features/myNFTs';
import { canDropNFT } from '../utils/positionCompatibility';

interface FieldSlotProps {
  slot: TeamSlot;
  draggedNFT: GalacticXNFT | null;
  onDrop: (slotId: string, nft: GalacticXNFT) => void;
  onRemove: (slotId: string) => void;
  canDropOnSlot?: (slotId: string) => boolean;
}

export const FieldSlot = ({ slot, draggedNFT, onDrop, onRemove, canDropOnSlot }: FieldSlotProps) => {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  
  const { position, nft } = slot;
  const isEmpty = nft === null;
  const isFilled = nft !== null;
  
  // Check if current dragged NFT can be dropped here
  const canDrop = draggedNFT ? (canDropOnSlot ? canDropOnSlot(position.id) : canDropNFT(draggedNFT.position, position.position)) : false;
  const isValidTarget = isDragOver && canDrop;
  const isInvalidTarget = isDragOver && !canDrop;
  
  // Show overlay when dragging (even without hover)
  const showOverlay = draggedNFT && !isDragOver;
  const showValidOverlay = showOverlay && canDrop;
  const showInvalidOverlay = showOverlay && !canDrop;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedNFT) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (draggedNFT && canDrop) {
      onDrop(position.id, draggedNFT);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(position.id);
  };

  return (
    <div
      className={`
        absolute transform -translate-x-1/2 -translate-y-1/2
        transition-all duration-200 cursor-pointer
        ${isEmpty ? 'w-16 h-16 rounded-full border-2 border-dashed border-gray-400 bg-gray-100/20 flex items-center justify-center' : ''}
        ${isFilled ? 'w-20 h-20' : ''}
        ${isValidTarget ? 'scale-110' : ''}
        ${isInvalidTarget ? 'scale-110' : ''}
        ${showValidOverlay ? 'scale-105' : ''}
        ${showInvalidOverlay ? 'scale-105' : ''}
        hover:scale-105
      `}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isEmpty && (
        <div className="text-center">
          <div className="text-xs font-bold text-gray-600">
            {t(`pages.warGames.field.positions.${position.position}`, position.label)}
          </div>
        </div>
      )}
      
      {isFilled && nft && (
        <div className="relative w-full h-full">
          {/* NFT Card - Direct display without circle */}
          <div className="w-full h-full rounded-lg overflow-hidden border-2 border-blue-500 bg-white shadow-lg">
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
          </div>
          
          {/* Remove button */}
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
            title="Remove NFT"
          >
            ×
          </button>
          
          {/* Position label */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-black/70 px-2 py-1 rounded">
            {t(`pages.warGames.field.positions.${position.position}`, position.label)}
          </div>
        </div>
      )}
      
      {/* Drag overlay indicators */}
      {(isDragOver || showOverlay) && (
        <div className={`
          absolute inset-0 rounded-lg flex items-center justify-center
          ${(isDragOver && canDrop) || showValidOverlay ? 'bg-green-500/50 text-white' : 'bg-red-500/50 text-white'}
        `}>
          <div className="text-sm font-bold">
            {canDrop ? '✓' : '✗'}
          </div>
        </div>
      )}
    </div>
  );
};
