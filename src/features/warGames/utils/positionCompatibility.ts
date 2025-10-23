import { Position } from '../types';

/**
 * Position compatibility mapping for flexible placement
 * Based on football tactical understanding
 */
export const POSITION_COMPATIBILITY: Record<Position, Position[]> = {
  // Goalkeepers - only goalkeepers
  [Position.GK]: [Position.GK],
  
  // Defenders - can play in defensive positions
  [Position.CB]: [Position.CB, Position.LB, Position.RB],
  [Position.LB]: [Position.LB, Position.CB, Position.LM],
  [Position.RB]: [Position.RB, Position.CB, Position.RM],
  
  // Defensive Midfielders - can play in defensive and central positions
  [Position.CDM]: [Position.CDM, Position.CM, Position.CB],
  
  // Central Midfielders - can play in most midfield positions
  [Position.CM]: [Position.CM, Position.CDM, Position.CAM, Position.LM, Position.RM],
  
  // Attacking Midfielders - can play in attacking and central positions
  [Position.CAM]: [Position.CAM, Position.CM, Position.CF, Position.LW, Position.RW],
  
  // Wide Midfielders - can play on wings and central positions
  [Position.LM]: [Position.LM, Position.LW, Position.CM],
  [Position.RM]: [Position.RM, Position.RW, Position.CM],
  
  // Wingers - can play on wings and attacking positions
  [Position.LW]: [Position.LW, Position.LM, Position.ST, Position.CAM],
  [Position.RW]: [Position.RW, Position.RM, Position.ST, Position.CAM],
  
  // Strikers - can play in attacking positions
  [Position.ST]: [Position.ST, Position.CF, Position.LW, Position.RW],
  [Position.CF]: [Position.CF, Position.ST, Position.CAM],
  
  // Coach - can only be placed in coach position
  [Position.COACH]: [Position.COACH],
  
  // Stadium - can only be placed in stadium position
  [Position.STADIUM]: [Position.STADIUM]
};

/**
 * Check if an NFT can be placed in a specific formation position
 * @param nftPosition - The NFT's position attribute
 * @param slotPosition - The formation slot's position
 * @returns true if the NFT can be placed in this slot
 */
export const canDropNFT = (nftPosition: string, slotPosition: Position): boolean => {
  // Convert string to Position enum
  const nftPos = nftPosition as Position;
  
  // If the position is not in our enum, default to false
  if (!Object.values(Position).includes(nftPos)) {
    return false;
  }
  
  // Get allowed positions for the slot
  const allowedPositions = POSITION_COMPATIBILITY[slotPosition] || [];
  
  // Check if NFT position is compatible
  return allowedPositions.includes(nftPos);
};

/**
 * Get all compatible positions for a given NFT position
 * @param nftPosition - The NFT's position
 * @returns Array of compatible formation positions
 */
export const getCompatiblePositions = (nftPosition: string): Position[] => {
  const nftPos = nftPosition as Position;
  
  if (!Object.values(Position).includes(nftPos)) {
    return [];
  }
  
  return POSITION_COMPATIBILITY[nftPos] || [];
};

/**
 * Get position category for styling
 * @param position - The position
 * @returns Category string
 */
export const getPositionCategory = (position: Position): string => {
  switch (position) {
    case Position.GK:
      return 'goalkeeper';
    case Position.CB:
    case Position.LB:
    case Position.RB:
      return 'defender';
    case Position.CDM:
    case Position.CM:
    case Position.CAM:
    case Position.LM:
    case Position.RM:
      return 'midfielder';
    case Position.LW:
    case Position.RW:
    case Position.ST:
    case Position.CF:
      return 'forward';
    case Position.COACH:
      return 'coach';
    case Position.STADIUM:
      return 'stadium';
    default:
      return 'unknown';
  }
};
