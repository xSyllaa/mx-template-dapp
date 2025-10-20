import { useEffect, useRef } from 'react';
import type { GalacticXNFT } from 'features/myNFTs';

interface DragPreviewProps {
  nft: GalacticXNFT;
  isDragging: boolean;
}

export const DragPreview = ({ nft, isDragging }: DragPreviewProps) => {
  const dragImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDragging && dragImageRef.current) {
      // Set the drag image to be just the NFT image
      const dragImage = dragImageRef.current;
      document.body.appendChild(dragImage);
      
      // This will be used as the drag image
      return () => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage);
        }
      };
    }
  }, [isDragging]);

  if (!isDragging) return null;

  return (
    <div
      ref={dragImageRef}
      className="fixed top-0 left-0 pointer-events-none z-50 opacity-0"
      style={{ transform: 'translate(-100%, -100%)' }}
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-blue-500 bg-white shadow-lg">
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
    </div>
  );
};


