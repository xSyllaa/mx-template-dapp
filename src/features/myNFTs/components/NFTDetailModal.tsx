/**
 * NFT Detail Modal - Premium 3D modal with NFT details
 */
import { useEffect, useState } from 'react';
import type { GalacticXNFT } from '../types';

interface NFTDetailModalProps {
  nft: GalacticXNFT | null;
  isOpen: boolean;
  onClose: () => void;
}

// Rarity styles
const rarityStyles: Record<GalacticXNFT['rarity'], {
  gradient: string;
  glow: string;
  badge: string;
}> = {
  Mythic: {
    gradient: 'from-red-500/20 via-pink-500/20 to-red-500/20',
    glow: 'shadow-[0_0_50px_rgba(239,68,68,0.5)]',
    badge: 'bg-gradient-to-r from-red-500 to-pink-500'
  },
  Legendary: {
    gradient: 'from-yellow-500/20 via-orange-500/20 to-yellow-500/20',
    glow: 'shadow-[0_0_50px_rgba(234,179,8,0.5)]',
    badge: 'bg-gradient-to-r from-yellow-500 to-orange-500'
  },
  Epic: {
    gradient: 'from-purple-500/20 via-pink-500/20 to-purple-500/20',
    glow: 'shadow-[0_0_50px_rgba(168,85,247,0.5)]',
    badge: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  Rare: {
    gradient: 'from-blue-500/20 via-cyan-500/20 to-blue-500/20',
    glow: 'shadow-[0_0_50px_rgba(59,130,246,0.5)]',
    badge: 'bg-gradient-to-r from-blue-500 to-cyan-500'
  },
  Common: {
    gradient: 'from-gray-500/20 via-gray-400/20 to-gray-500/20',
    glow: 'shadow-2xl',
    badge: 'bg-gradient-to-r from-gray-500 to-gray-600'
  }
};

export const NFTDetailModal = ({ nft, isOpen, onClose }: NFTDetailModalProps) => {
  // Parallax effect state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  // Handle mouse move for parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setMousePosition({ x, y });
  };
  
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };
  
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen || !nft) return null;
  
  const style = rarityStyles[nft.rarity];
  
  // Get performance attributes
  const performanceAttributes = Object.entries(nft.attributes)
    .filter(([key]) => key.startsWith('performance_'))
    .map(([key, value]) => ({
      key: key.replace('performance_', 'Performance '),
      value: value as string
    }))
    .filter(item => item.value && item.value !== 'None');
  
  // Get other attributes (excluding performances and special fields)
  const otherAttributes = Object.entries(nft.attributes)
    .filter(([key]) => 
      !key.startsWith('performance_') && 
      !['name', 'number', 'position', 'nationality', 'special_perk', 'league', 'capacity'].includes(key)
    )
    .map(([key, value]) => ({
      key: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      value: value as string | number
    }))
    .filter(item => item.value);
  
  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]"
        onClick={onClose}
      />
      
      {/* Modal Container with 3D perspective */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto pointer-events-auto animate-[zoomIn3D_0.5s_cubic-bezier(0.34,1.56,0.64,1)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Card with 3D effect */}
          <div className={`
            relative rounded-3xl overflow-hidden
            bg-gradient-to-br ${style.gradient}
            backdrop-blur-xl ${style.glow}
            border-2 border-secondary
          `}>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all hover:scale-110 flex items-center justify-center"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Content Grid */}
            <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
              {/* Left: Image with Parallax */}
              <div 
                className="relative"
                style={{
                  perspective: '1000px'
                }}
              >
                {/* NFT Image with 3D Parallax */}
                <div 
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    transform: isHovering
                      ? `rotateY(${mousePosition.x * 15}deg) rotateX(${-mousePosition.y * 15}deg) scale(1.02)`
                      : 'rotateY(0deg) rotateX(0deg) scale(1)',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* Rarity Badge with Parallax - collé sur la carte */}
                  <div 
                    className={`absolute top-4 left-4 z-10 ${style.badge} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm`}
                    style={{
                      transform: isHovering
                        ? 'translateZ(40px)'
                        : 'translateZ(0)',
                      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {nft.rarity}
                  </div>
                  {nft.imageUrl ? (
                    <img
                      src={nft.imageUrl}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                      style={{
                        transform: isHovering
                          ? `translateZ(20px) scale(1.05)`
                          : 'translateZ(0) scale(1)',
                        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-8xl">
                      🎴
                    </div>
                  )}
                  
                  {/* Gradient Overlay with parallax depth */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                    style={{
                      transform: isHovering
                        ? 'translateZ(10px)'
                        : 'translateZ(0)',
                      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                  
                  {/* Subtle shine effect based on mouse position */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at ${(mousePosition.x + 0.5) * 100}% ${(mousePosition.y + 0.5) * 100}%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
                      transform: 'translateZ(30px)',
                      opacity: isHovering ? 1 : 0,
                      transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                </div>
              </div>
              
              {/* Right: Details */}
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div>
                  <h2 className="text-3xl font-bold text-primary mb-2">
                    {nft.name}
                  </h2>
                  <p className="text-sm text-tertiary">
                    ID: {nft.identifier}
                  </p>
                </div>
                
                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {nft.position && (
                    <div className="p-4 rounded-xl bg-secondary/50 backdrop-blur-sm">
                      <p className="text-xs text-secondary mb-1">Position</p>
                      <p className="text-xl font-bold text-primary">{nft.position}</p>
                    </div>
                  )}
                  
                  {nft.attributes.number && (
                    <div className="p-4 rounded-xl bg-secondary/50 backdrop-blur-sm">
                      <p className="text-xs text-secondary mb-1">Number</p>
                      <p className="text-xl font-bold text-primary">#{nft.attributes.number}</p>
                    </div>
                  )}
                  
                  {nft.attributes.nationality && (
                    <div className="p-4 rounded-xl bg-secondary/50 backdrop-blur-sm col-span-2">
                      <p className="text-xs text-secondary mb-1">Nationality</p>
                      <p className="text-lg font-bold text-primary">🌍 {nft.attributes.nationality}</p>
                    </div>
                  )}
                  
                  {nft.attributes.special_perk && (
                    <div className="p-4 rounded-xl bg-secondary/50 backdrop-blur-sm col-span-2">
                      <p className="text-xs text-secondary mb-1">Special Perk</p>
                      <p className="text-lg font-bold text-primary">✨ {nft.attributes.special_perk}</p>
                    </div>
                  )}
                  
                  {nft.attributes.league && (
                    <div className="p-4 rounded-xl bg-secondary/50 backdrop-blur-sm col-span-2">
                      <p className="text-xs text-secondary mb-1">League</p>
                      <p className="text-lg font-bold text-primary">🏆 {nft.attributes.league}</p>
                    </div>
                  )}
                  
                  {nft.attributes.capacity && (
                    <div className="p-4 rounded-xl bg-secondary/50 backdrop-blur-sm col-span-2">
                      <p className="text-xs text-secondary mb-1">Capacity</p>
                      <p className="text-lg font-bold text-primary">🏟️ {nft.attributes.capacity}</p>
                    </div>
                  )}
                </div>
                
                {/* Performance Achievements */}
                {performanceAttributes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                      🏅 Performances
                    </h3>
                    <div className="space-y-2">
                      {performanceAttributes.map((perf, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-gradient-to-r from-secondary to-tertiary border border-secondary"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">⭐</span>
                            <span className="text-sm font-medium text-primary">
                              {perf.value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Other Attributes */}
                {otherAttributes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                      📊 Other Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {otherAttributes.map((attr, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-secondary/50 backdrop-blur-sm"
                        >
                          <p className="text-xs text-secondary mb-1">{attr.key}</p>
                          <p className="text-sm font-semibold text-primary">{attr.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Metadata */}
                <div className="pt-4 border-t border-secondary">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {nft.score && (
                      <div>
                        <p className="text-secondary">Score</p>
                        <p className="font-semibold text-primary">{nft.score}</p>
                      </div>
                    )}
                    {nft.rank && (
                      <div>
                        <p className="text-secondary">Rank</p>
                        <p className="font-semibold text-primary">#{nft.rank}</p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <p className="text-secondary">Nonce</p>
                      <p className="font-semibold text-primary">{nft.nonce}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

