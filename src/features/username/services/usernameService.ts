import { supabase } from 'lib/supabase/client';
import { usersAPI } from 'api/users';
import type {
  UsernameValidation,
  UsernameAvailability,
  UsernameCooldown,
  UsernameUpdateResult
} from '../types';

/**
 * Validates username format (client-side)
 * Rules: 3-20 characters, alphanumeric + hyphens only
 */
export const validateUsername = (username: string): UsernameValidation => {
  if (!username || username.trim().length === 0) {
    return {
      isValid: false,
      error: 'username.validation.required'
    };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: 'username.validation.tooShort'
    };
  }

  if (trimmed.length > 20) {
    return {
      isValid: false,
      error: 'username.validation.tooLong'
    };
  }

  // Only alphanumeric and hyphens (no spaces, no special chars)
  const validPattern = /^[a-zA-Z0-9-]+$/;
  if (!validPattern.test(trimmed)) {
    return {
      isValid: false,
      error: 'username.validation.invalidChars'
    };
  }

  // Cannot start or end with hyphen
  if (trimmed.startsWith('-') || trimmed.endsWith('-')) {
    return {
      isValid: false,
      error: 'username.validation.invalidChars'
    };
  }

  return { isValid: true };
};

/**
 * Checks if username is available (not taken by another user)
 */
export const checkUsernameAvailability = async (
  username: string,
  currentUserId: string
): Promise<UsernameAvailability> => {
  try {
    const trimmed = username.trim().toLowerCase();

    // Query for existing username (case-insensitive)
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .ilike('username', trimmed)
      .neq('id', currentUserId)
      .maybeSingle();

    if (error) {
      console.error('[UsernameService] Error checking availability:', error);
      return {
        isAvailable: false,
        error: 'username.error'
      };
    }

    // If data exists, username is taken
    if (data) {
      return {
        isAvailable: false,
        error: 'username.validation.taken'
      };
    }

    return { isAvailable: true };
  } catch (error) {
    console.error('[UsernameService] Unexpected error:', error);
    return {
      isAvailable: false,
      error: 'username.error'
    };
  }
};

/**
 * Checks if user can update their username (7 days cooldown)
 */
export const canUpdateUsername = async (
  userId: string
): Promise<UsernameCooldown> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username_last_modified')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[UsernameService] Error checking cooldown:', error);
      throw error;
    }

    // If never modified, can update
    if (!data.username_last_modified) {
      return { canUpdate: true };
    }

    const lastModified = new Date(data.username_last_modified);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // If last modified more than 7 days ago, can update
    if (lastModified < sevenDaysAgo) {
      return { canUpdate: true };
    }

    // Calculate next available date
    const nextAvailableDate = new Date(
      lastModified.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    const daysRemaining = Math.ceil(
      (nextAvailableDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
    );

    return {
      canUpdate: false,
      nextAvailableDate,
      daysRemaining
    };
  } catch (error) {
    console.error('[UsernameService] Error checking cooldown:', error);
    throw error;
  }
};

/**
 * Updates user's username
 * Server-side validation via RLS policies ensures security
 */
export const updateUsername = async (
  userId: string,
  newUsername: string
): Promise<UsernameUpdateResult> => {
  try {
    const trimmed = newUsername.trim();

    // Client-side validation
    const validation = validateUsername(trimmed);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Check cooldown
    const cooldown = await canUpdateUsername(userId);
    if (!cooldown.canUpdate) {
      return {
        success: false,
        error: 'username.cooldown.active',
        nextAvailableDate: cooldown.nextAvailableDate
      };
    }

    // Check availability
    const availability = await checkUsernameAvailability(trimmed, userId);
    if (!availability.isAvailable) {
      return {
        success: false,
        error: availability.error
      };
    }

    // Update username via backend API
    try {
      const response = await usersAPI.updateUsername(trimmed);
      console.log('[UsernameService] Username updated successfully:', trimmed);
      return { success: true };
    } catch (error: any) {
      console.error('[UsernameService] Update error:', error);

      // Check error message for specific issues
      if (error.message?.includes('taken') || error.message?.includes('exists')) {
        return {
          success: false,
          error: 'username.validation.taken'
        };
      }

      return {
        success: false,
        error: 'username.error'
      };
    }
  } catch (error) {
    console.error('[UsernameService] Unexpected error:', error);
    return {
      success: false,
      error: 'username.error'
    };
  }
};

