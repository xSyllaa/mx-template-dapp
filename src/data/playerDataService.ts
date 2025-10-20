/**
 * Player Data Service - Maps NFT IDs to real player names
 */
import playersData from './playersData.json';

export interface PlayerData {
  ID: string;
  'Player Name': string;
  MAINSEASON: string;
  'MINT NR': number | string;
}

/**
 * Extract NFT ID from various formats
 * Supports: "Main Season #123", "#123", "MAINSEASON-3db9f8-0123"
 */
const extractNFTId = (input: string | number): string => {
  const inputStr = String(input);
  
  // If it's already in #123 format
  if (inputStr.startsWith('#')) {
    return inputStr;
  }
  
  // If it's "Main Season #123" or similar
  const hashMatch = inputStr.match(/#(\d+)/);
  if (hashMatch) {
    return `#${hashMatch[1]}`;
  }
  
  // If it's a nonce number (e.g., 123)
  if (/^\d+$/.test(inputStr)) {
    return `#${inputStr}`;
  }
  
  // If it's an identifier like "MAINSEASON-3db9f8-0123"
  const nonceMatch = inputStr.match(/MAINSEASON-[a-f0-9]+-([a-f0-9]+)$/i);
  if (nonceMatch) {
    // Convert hex to decimal
    const nonce = parseInt(nonceMatch[1], 16);
    return `#${nonce}`;
  }
  
  return inputStr;
};

/**
 * Get player data by NFT ID, nonce, or identifier
 */
export const getPlayerDataByNFT = (nftIdOrNonce: string | number): PlayerData | null => {
  const searchId = extractNFTId(nftIdOrNonce);
  
  const player = (playersData as PlayerData[]).find(
    (p) => p.ID === searchId
  );
  
  return player || null;
};

/**
 * Get player data by MAINSEASON identifier
 */
export const getPlayerDataByIdentifier = (identifier: string): PlayerData | null => {
  const player = (playersData as PlayerData[]).find(
    (p) => p.MAINSEASON && p.MAINSEASON === identifier
  );
  
  return player || null;
};

/**
 * Get real player name from any NFT identifier
 */
export const getRealPlayerName = (nftData: {
  identifier?: string;
  nonce?: number;
  name?: string;
}): string | null => {
  // Try by identifier first
  if (nftData.identifier) {
    const playerByIdentifier = getPlayerDataByIdentifier(nftData.identifier);
    if (playerByIdentifier) {
      return playerByIdentifier['Player Name'];
    }
  }
  
  // Try by nonce
  if (nftData.nonce) {
    const playerByNonce = getPlayerDataByNFT(nftData.nonce);
    if (playerByNonce) {
      return playerByNonce['Player Name'];
    }
  }
  
  // Try by name (if it contains #ID)
  if (nftData.name) {
    const playerByName = getPlayerDataByNFT(nftData.name);
    if (playerByName) {
      return playerByName['Player Name'];
    }
  }
  
  return null;
};

/**
 * Format player name for Transfermarkt URL
 * Example: "Ederson Santana de Moraes" -> "ederson-santana-de-moraes"
 */
export const formatPlayerNameForURL = (playerName: string): string => {
  return playerName
    .toLowerCase()
    .normalize('NFD') // Normalize accents
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Keep only alphanumeric, spaces, and hyphens
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
};

/**
 * Generate Transfermarkt search URL for a player
 */
export const getTransfermarktURL = (playerName: string): string => {
  const formattedName = formatPlayerNameForURL(playerName);
  return `https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(formattedName)}`;
};

export const playerDataService = {
  getPlayerDataByNFT,
  getPlayerDataByIdentifier,
  getRealPlayerName,
  formatPlayerNameForURL,
  getTransfermarktURL
};

