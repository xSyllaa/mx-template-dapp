import type { GalacticXNFT } from 'features/myNFTs';

/**
 * Football positions enum
 */
export enum Position {
  GK = 'GK',   // Goalkeeper
  CB = 'CB',   // Center Back
  LB = 'LB',   // Left Back
  RB = 'RB',   // Right Back
  CDM = 'CDM', // Central Defensive Midfielder
  CM = 'CM',   // Central Midfielder
  CAM = 'CAM', // Central Attacking Midfielder
  LM = 'LM',   // Left Midfielder
  RM = 'RM',   // Right Midfielder
  LW = 'LW',   // Left Winger
  RW = 'RW',   // Right Winger
  ST = 'ST',   // Striker
  CF = 'CF'    // Center Forward
}

/**
 * Formation position with coordinates and allowed positions
 */
export interface FormationPosition {
  id: string;
  position: Position;
  allowedPositions: Position[];
  x: number; // Percentage from left (0-100)
  y: number; // Percentage from top (0-100)
  label: string; // Display label (e.g., "ST", "CM")
}

/**
 * Team slot containing NFT and position info
 */
export interface TeamSlot {
  nft: GalacticXNFT | null;
  position: FormationPosition;
}

/**
 * Formation 4-4-2 with 11 positions
 */
export const Formation442: FormationPosition[] = [
  // Goalkeeper
  { id: 'gk', position: Position.GK, allowedPositions: [Position.GK], x: 50, y: 5, label: 'GK' },
  
  // Defense (4 players)
  { id: 'lb', position: Position.LB, allowedPositions: [Position.LB, Position.CB, Position.LM], x: 15, y: 20, label: 'LB' },
  { id: 'cb1', position: Position.CB, allowedPositions: [Position.CB, Position.LB, Position.RB], x: 35, y: 20, label: 'CB' },
  { id: 'cb2', position: Position.CB, allowedPositions: [Position.CB, Position.LB, Position.RB], x: 65, y: 20, label: 'CB' },
  { id: 'rb', position: Position.RB, allowedPositions: [Position.RB, Position.CB, Position.RM], x: 85, y: 20, label: 'RB' },
  
  // Midfield (4 players)
  { id: 'lm', position: Position.LM, allowedPositions: [Position.LM, Position.LW, Position.CM], x: 20, y: 45, label: 'LM' },
  { id: 'cm1', position: Position.CM, allowedPositions: [Position.CM, Position.CDM, Position.CAM, Position.LM, Position.RM], x: 40, y: 45, label: 'CM' },
  { id: 'cm2', position: Position.CM, allowedPositions: [Position.CM, Position.CDM, Position.CAM, Position.LM, Position.RM], x: 60, y: 45, label: 'CM' },
  { id: 'rm', position: Position.RM, allowedPositions: [Position.RM, Position.RW, Position.CM], x: 80, y: 45, label: 'RM' },
  
  // Attack (2 players)
  { id: 'st1', position: Position.ST, allowedPositions: [Position.ST, Position.CF, Position.LW, Position.RW], x: 40, y: 70, label: 'ST' },
  { id: 'st2', position: Position.ST, allowedPositions: [Position.ST, Position.CF, Position.LW, Position.RW], x: 60, y: 70, label: 'ST' }
];

/**
 * Initialize empty team slots
 */
export const initializeSlots = (formation: FormationPosition[]): TeamSlot[] => {
  return formation.map(position => ({
    nft: null,
    position
  }));
};

/**
 * War Game team state
 */
export interface WarGameTeam {
  slots: TeamSlot[];
  draggedNFT: GalacticXNFT | null;
  isComplete: boolean;
  placedNFTs: string[]; // NFT identifiers that are placed
}

/**
 * Position compatibility mapping
 */
export interface PositionCompatibility {
  [key: string]: Position[];
}

/**
 * Saved team slot data
 */
export interface SavedTeamSlot {
  slotId: string;
  nftIdentifier: string;
  position: Position;
}

/**
 * Saved team data
 */
export interface SavedTeam {
  id: string;
  userId: string;
  teamName: string;
  formation: string;
  slots: SavedTeamSlot[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Create team data
 */
export interface CreateTeamData {
  teamName: string;
  formation: string;
  slots: SavedTeamSlot[];
}

/**
 * Update team data
 */
export interface UpdateTeamData {
  teamName?: string;
  formation?: string;
  slots?: SavedTeamSlot[];
}

// ============================================================
// WAR GAME TYPES (1v1 Battles)
// ============================================================

/**
 * War Game Status
 */
export enum WarGameStatus {
  OPEN = 'open',           // Waiting for opponent
  IN_PROGRESS = 'in_progress', // Both players joined, waiting for result
  COMPLETED = 'completed',     // Result validated
  CANCELLED = 'cancelled'      // Cancelled by creator
}

/**
 * War Game data from database
 */
export interface WarGame {
  id: string;
  creatorId: string;
  creatorTeamId: string;
  opponentId: string | null;
  opponentTeamId: string | null;
  pointsStake: number;
  entryDeadline: string;
  status: WarGameStatus;
  winnerId: string | null;
  creatorScore: number | null;
  opponentScore: number | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}

/**
 * War Game with user details (for display)
 */
export interface WarGameWithDetails extends WarGame {
  creatorUsername?: string;
  creatorAvatarUrl?: string;
  creatorAddress?: string;
  opponentUsername?: string;
  opponentAvatarUrl?: string;
  opponentAddress?: string;
}

/**
 * Data to create a new War Game
 */
export interface CreateWarGameData {
  teamId: string;          // ID of the saved team to use
  pointsStake: number;     // Points at stake
  entryDeadline: string;   // ISO date string (deadline for opponents to join)
}

/**
 * Data to join an existing War Game
 */
export interface JoinWarGameData {
  warGameId: string;       // ID of the war game to join
  teamId: string;          // ID of the team to use
}
