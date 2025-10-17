/**
 * Username Management Types
 * GalacticX dApp
 */

export interface UsernameValidation {
  isValid: boolean;
  error?: string;
}

export interface UsernameUpdateResult {
  success: boolean;
  error?: string;
  nextAvailableDate?: Date;
}

export interface UsernameAvailability {
  isAvailable: boolean;
  error?: string;
}

export interface UsernameCooldown {
  canUpdate: boolean;
  nextAvailableDate?: Date;
  daysRemaining?: number;
}

