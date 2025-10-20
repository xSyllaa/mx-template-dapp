import { useState, useMemo, useCallback } from 'react';
import type { GalacticXNFT } from 'features/myNFTs';
import { Formation442, initializeSlots, type TeamSlot } from '../types';
import { canDropNFT } from '../utils/positionCompatibility';

/**
 * Hook for managing War Game team state
 */
export const useWarGameTeam = () => {
  const [slots, setSlots] = useState<TeamSlot[]>(() => initializeSlots(Formation442));
  const [draggedNFT, setDraggedNFT] = useState<GalacticXNFT | null>(null);

  /**
   * Place an NFT in a specific slot
   */
  const placeNFT = useCallback((slotId: string, nft: GalacticXNFT) => {
    setSlots(prevSlots => 
      prevSlots.map(slot => 
        slot.position.id === slotId 
          ? { ...slot, nft }
          : slot
      )
    );
  }, []);

  /**
   * Remove an NFT from a specific slot
   */
  const removeNFT = useCallback((slotId: string) => {
    setSlots(prevSlots => 
      prevSlots.map(slot => 
        slot.position.id === slotId 
          ? { ...slot, nft: null }
          : slot
      )
    );
  }, []);

  /**
   * Clear all NFTs from the team
   */
  const clearTeam = useCallback(() => {
    setSlots(prevSlots => 
      prevSlots.map(slot => ({ ...slot, nft: null }))
    );
  }, []);

  /**
   * Get identifiers of all placed NFTs
   */
  const getPlacedNFTs = useMemo(() => {
    return slots
      .filter(slot => slot.nft !== null)
      .map(slot => slot.nft!.identifier);
  }, [slots]);

  /**
   * Check if team is complete (all 11 positions filled)
   */
  const isTeamComplete = useMemo(() => {
    return slots.every(slot => slot.nft !== null);
  }, [slots]);

  /**
   * Get count of placed NFTs
   */
  const placedCount = useMemo(() => {
    return slots.filter(slot => slot.nft !== null).length;
  }, [slots]);

  /**
   * Get available slots (empty slots)
   */
  const getAvailableSlots = useMemo(() => {
    return slots.filter(slot => slot.nft === null);
  }, [slots]);

  /**
   * Get filled slots
   */
  const getFilledSlots = useMemo(() => {
    return slots.filter(slot => slot.nft !== null);
  }, [slots]);

  /**
   * Check if an NFT is already placed
   */
  const isNFTPlaced = useCallback((nftIdentifier: string) => {
    return getPlacedNFTs.includes(nftIdentifier);
  }, [getPlacedNFTs]);

  /**
   * Get NFT by slot ID
   */
  const getNFTBySlot = useCallback((slotId: string) => {
    const slot = slots.find(s => s.position.id === slotId);
    return slot?.nft || null;
  }, [slots]);

  /**
   * Check if a slot can accept the dragged NFT
   */
  const canDropOnSlot = useCallback((slotId: string) => {
    if (!draggedNFT) return false;
    
    const slot = slots.find(s => s.position.id === slotId);
    if (!slot) return false;
    
    // Use the imported compatibility function
    return canDropNFT(draggedNFT.position, slot.position.position);
  }, [draggedNFT, slots]);

  /**
   * Load a complete team into slots
   */
  const loadTeam = useCallback((teamSlots: any[], nfts: any[]) => {
    const updatedSlots = [...slots];
    
    teamSlots.forEach(teamSlot => {
      const nft = nfts.find(n => n.identifier === teamSlot.nftIdentifier);
      if (nft) {
        const slotIndex = updatedSlots.findIndex(slot => slot.position.id === teamSlot.slotId);
        if (slotIndex !== -1) {
          updatedSlots[slotIndex] = {
            ...updatedSlots[slotIndex],
            nft: nft
          };
        }
      }
    });
    
    setSlots(updatedSlots);
  }, [slots]);

  return {
    // State
    slots,
    draggedNFT,
    
    // Actions
    setDraggedNFT,
    placeNFT,
    removeNFT,
    clearTeam,
    loadTeam,
    
    // Computed values
    getPlacedNFTs,
    isTeamComplete,
    placedCount,
    getAvailableSlots,
    getFilledSlots,
    isNFTPlaced,
    getNFTBySlot,
    canDropOnSlot
  };
};
