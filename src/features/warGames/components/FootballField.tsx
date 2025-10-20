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
      
      {/* SVG Football Field Background */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 140"
        preserveAspectRatio="xMidYMid meet"
      >
        
        {/* Field lines */}
        <g stroke="white" strokeWidth="0.5" fill="none">
          {/* Center line */}
          <line x1="0" y1="70" x2="100" y2="70" />
          
          {/* Center circle */}
          <circle cx="50" cy="70" r="8" />
          
          {/* Center spot */}
          <circle cx="50" cy="70" r="0.5" fill="white" />
          
          {/* Left penalty area */}
          <rect x="0" y="45" width="12" height="50" />
          <rect x="0" y="55" width="6" height="30" />
          <circle cx="6" cy="70" r="2" />
          
          {/* Right penalty area */}
          <rect x="88" y="45" width="12" height="50" />
          <rect x="94" y="55" width="6" height="30" />
          <circle cx="94" cy="70" r="2" />
          
          {/* Corner arcs */}
          <path d="M 0 0 Q 2 0 2 2" />
          <path d="M 100 0 Q 98 0 98 2" />
          <path d="M 0 140 Q 2 140 2 138" />
          <path d="M 100 140 Q 98 140 98 138" />
        </g>
        
        {/* Goal posts */}
        <g stroke="white" strokeWidth="1">
          {/* Left goal */}
          <line x1="0" y1="60" x2="0" y2="80" />
          <line x1="0" y1="60" x2="2" y2="60" />
          <line x1="0" y1="80" x2="2" y2="80" />
          
          {/* Right goal */}
          <line x1="100" y1="60" x2="100" y2="80" />
          <line x1="100" y1="60" x2="98" y2="60" />
          <line x1="100" y1="80" x2="98" y2="80" />
        </g>
      </svg>
      
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
