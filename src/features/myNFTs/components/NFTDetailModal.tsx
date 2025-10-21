/**
 * NFT Detail Modal - Premium 3D modal with NFT details
 */
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { GalacticXNFT } from '../types';
import { getTransfermarktURL } from '../../../data/playerDataService';

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
  const { t } = useTranslation();
  
  // Parallax effect state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  // Animation state - simplifié
  const [isClosing, setIsClosing] = useState(false);
  
  // Ref pour tracker les timeouts et éviter les bugs de changements rapides
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset states when NFT changes
  useEffect(() => {
    if (nft && isOpen) {
      // Clear any pending close timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      // Reset closing state
      setIsClosing(false);
      // Reset parallax
      setMousePosition({ x: 0, y: 0 });
      setIsHovering(false);
    }
  }, [nft?.identifier, isOpen]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);
  
  // Handle close with animation
  const handleClose = () => {
    // Clear any existing timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      setIsClosing(false);
      closeTimeoutRef.current = null;
      onClose();
    }, 300); // Animation rapide et fluide
  };
  
  // Handle mouse move for parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };
  
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };
  
  // Close on ESC key and prevent background scroll
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Prevent background scroll while keeping scrollbar space
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Add smooth animations (only if not already added)
      if (!document.getElementById('nft-modal-animations')) {
        const style = document.createElement('style');
        style.id = 'nft-modal-animations';
        style.textContent = `
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes fadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }
          
          @keyframes smoothZoomIn {
            0% {
              opacity: 0;
              transform: scale(0.92) translateY(10px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          
          @keyframes smoothZoomOut {
            0% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
            100% {
              opacity: 0;
              transform: scale(0.92) translateY(10px);
            }
          }
          
          /* Prevent animation glitches */
          .nft-modal-animated {
            will-change: transform, opacity;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
        `;
        document.head.appendChild(style);
      }
      
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = 'unset';
        document.body.style.paddingRight = '0px';
        // Ne pas retirer le style pour éviter les bugs de changements rapides
      };
    }
  }, [isOpen]);
  
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
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-md nft-modal-animated ${
          isClosing 
            ? 'animate-[fadeOut_0.3s_ease-out_forwards]' 
            : 'animate-[fadeIn_0.3s_ease-out_forwards]'
        }`}
        onClick={handleClose}
      />
      
       {/* Modal Container with smooth animations */}
       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
         <div
           className={`relative w-full max-w-4xl max-h-[90vh] pointer-events-auto nft-modal-animated ${
             isClosing 
               ? 'animate-[smoothZoomOut_0.3s_cubic-bezier(0.4,0,0.2,1)_forwards]' 
               : 'animate-[smoothZoomIn_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]'
           }`}
           onClick={(e) => e.stopPropagation()}
           key={nft.identifier}
         >
           {/* Card with 3D effect */}
           <div className={`
             relative rounded-3xl overflow-hidden
             backdrop-blur-xl ${style.glow}
             border-2 border-[var(--mvx-border-color-secondary)]
           `}>
             {/* Background with proper rounding */}
             <div className={`
               absolute inset-0 rounded-3xl
               bg-gradient-to-br ${style.gradient}
             `} />
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all hover:scale-110 flex items-center justify-center"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
             
            {/* Content Grid */}
            <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8 items-center max-h-[90vh] overflow-y-auto relative z-0">
              {/* Left: Image with Parallax */}
              <div 
                className="relative flex items-center justify-center"
                style={{
                  perspective: '1000px'
                }}
              >
                {/* NFT Image with 3D Parallax */}
                <div 
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--mvx-bg-color-secondary)] max-w-sm w-full"
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
                    className={`absolute top-4 left-4 z-10 ${style.badge} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm pointer-events-none`}
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
              <div className="flex flex-col gap-6 relative z-10">
                {/* Header */}
                <div>
                  <h2 className="text-3xl font-bold text-[var(--mvx-text-color-primary)] mb-2">
                    {nft.realPlayerName || nft.name}
                  </h2>
                  
                  {/* Show original name if we have a real player name */}
                  {nft.realPlayerName && nft.name !== nft.realPlayerName && (
                    <p className="text-sm text-[var(--mvx-text-color-secondary)] mb-2">
                      {nft.name}
                    </p>
                  )}
                  
                  {/* NFT ID with Explorer Link and Transfermarkt */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    {/* Explorer Link - Full width hover */}
                    <a
                      href={`https://explorer.multiversx.com/nfts/${nft.identifier}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm text-[var(--mvx-text-color-secondary)] hover:text-[var(--mvx-text-accent-color)] transition-colors flex items-center gap-1 group cursor-pointer px-2 py-1 -mx-2 rounded-lg hover:bg-[var(--mvx-bg-accent-color)]"
                    >
                      <span className="font-mono">{nft.identifier}</span>
                      <svg 
                        className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                        />
                      </svg>
                    </a>
                    
                    {/* Transfermarkt button */}
                    {nft.realPlayerName && (
                      <a
                        href={getTransfermarktURL(nft.realPlayerName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--mvx-bg-color-secondary)] hover:bg-[var(--mvx-bg-accent-color)] border border-[var(--mvx-border-color-secondary)] hover:border-[var(--mvx-text-accent-color)] text-[var(--mvx-text-color-primary)] hover:text-[var(--mvx-text-accent-color)] text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {t('pages.myNFTs.detail.viewOnTransfermarkt')}
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {nft.position && (
                    <div className="p-4 rounded-xl bg-[var(--mvx-bg-color-secondary)] backdrop-blur-sm">
                      <p className="text-xs text-[var(--mvx-text-color-secondary)] mb-1">Position</p>
                      <p className="text-xl font-bold text-[var(--mvx-text-color-primary)]">{nft.position}</p>
                    </div>
                  )}
                  
                  {nft.attributes.nationality && (
                    <div className="p-4 rounded-xl bg-[var(--mvx-bg-color-secondary)] backdrop-blur-sm col-span-2">
                      <p className="text-xs text-[var(--mvx-text-color-secondary)] mb-1">Nationality</p>
                      <p className="text-lg font-bold text-[var(--mvx-text-color-primary)]">🌍 {nft.attributes.nationality}</p>
                    </div>
                  )}
                  
                  {nft.attributes.special_perk && (
                    <div className="p-4 rounded-xl bg-[var(--mvx-bg-color-secondary)] backdrop-blur-sm col-span-2">
                      <p className="text-xs text-[var(--mvx-text-color-secondary)] mb-1">Special Perk</p>
                      <p className="text-lg font-bold text-[var(--mvx-text-color-primary)]">✨ {nft.attributes.special_perk}</p>
                    </div>
                  )}
                  
                  {nft.attributes.league && (
                    <div className="p-4 rounded-xl bg-[var(--mvx-bg-color-secondary)] backdrop-blur-sm col-span-2">
                      <p className="text-xs text-[var(--mvx-text-color-secondary)] mb-1">League</p>
                      <p className="text-lg font-bold text-[var(--mvx-text-color-primary)]">🏆 {nft.attributes.league}</p>
                    </div>
                  )}
                  
                  {nft.attributes.capacity && (
                    <div className="p-4 rounded-xl bg-[var(--mvx-bg-color-secondary)] backdrop-blur-sm col-span-2">
                      <p className="text-xs text-[var(--mvx-text-color-secondary)] mb-1">Capacity</p>
                      <p className="text-lg font-bold text-[var(--mvx-text-color-primary)]">🏟️ {nft.attributes.capacity}</p>
                    </div>
                  )}
                </div>
                
                {/* Performance Achievements */}
                {performanceAttributes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-[var(--mvx-text-color-primary)] mb-3 flex items-center gap-2">
                      🏅 Performances
                    </h3>
                    <div className="space-y-2">
                      {performanceAttributes.map((perf, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">⭐</span>
                            <span className="text-sm font-medium text-[var(--mvx-text-color-primary)]">
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
                    <h3 className="text-lg font-bold text-[var(--mvx-text-color-primary)] mb-3 flex items-center gap-2">
                      📊 Other Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {otherAttributes.map((attr, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-[var(--mvx-bg-color-secondary)] backdrop-blur-sm"
                        >
                          <p className="text-xs text-[var(--mvx-text-color-secondary)] mb-1">{attr.key}</p>
                          <p className="text-sm font-semibold text-[var(--mvx-text-color-primary)]">{attr.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Metadata */}
                <div className="pt-4 border-t border-[var(--mvx-border-color-secondary)]">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {nft.score && (
                      <div>
                        <p className="text-[var(--mvx-text-color-secondary)]">Score</p>
                        <p className="font-semibold text-[var(--mvx-text-color-primary)]">{nft.score}</p>
                      </div>
                    )}
                    {nft.rank && (
                      <div>
                        <p className="text-[var(--mvx-text-color-secondary)]">Rank</p>
                        <p className="font-semibold text-[var(--mvx-text-color-primary)]">#{nft.rank}</p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <p className="text-[var(--mvx-text-color-secondary)]">Nonce</p>
                      <p className="font-semibold text-[var(--mvx-text-color-primary)]">{nft.nonce}</p>
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

