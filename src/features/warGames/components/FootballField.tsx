import type { TeamSlot } from '../types';
import type { GalacticXNFT } from 'features/myNFTs';
import { FieldSlot } from './FieldSlot';

interface FootballFieldProps {
  slots: TeamSlot[];
  draggedNFT: GalacticXNFT | null;
  onDropNFT: (slotId: string, nft: GalacticXNFT) => void;
  onRemoveNFT: (slotId: string) => void;
  canDropOnSlot?: (slotId: string) => boolean;
}

export const FootballField = ({ slots, draggedNFT, onDropNFT, onRemoveNFT, canDropOnSlot }: FootballFieldProps) => {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden min-h-0">
      {/* Grass stripes background */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={`h-[5%] w-full ${
              i % 2 === 0 ? 'bg-green-600' : 'bg-green-500'
            }`}
            style={{ top: `${i * 5}%` }}
          />
        ))}
      </div>
      
      
      {/* Field Slots */}
      {slots.map((slot) => (
        <FieldSlot
          key={slot.position.id}
          slot={slot}
          draggedNFT={draggedNFT}
          onDrop={onDropNFT}
          onRemove={onRemoveNFT}
          canDropOnSlot={canDropOnSlot}
        />
      ))}
      
      {/* Formation indicator */}
      <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold">
        4-4-2
      </div>
    </div>
  );
};
