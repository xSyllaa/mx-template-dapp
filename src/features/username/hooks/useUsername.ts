import { useState, useEffect, useCallback } from 'react';
import { canUpdateUsername, updateUsername as updateUsernameService } from '../services/usernameService';
import type { UsernameCooldown } from '../types';

interface UseUsernameOptions {
  userId: string | null;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useUsername = ({ userId, onSuccess, onError }: UseUsernameOptions) => {
  const [cooldown, setCooldown] = useState<UsernameCooldown>({ canUpdate: true });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckingCooldown, setIsCheckingCooldown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check cooldown status
  const checkCooldown = useCallback(async () => {
    if (!userId) return;

    setIsCheckingCooldown(true);
    try {
      const result = await canUpdateUsername(userId);
      setCooldown(result);
    } catch (err) {
      console.error('[useUsername] Error checking cooldown:', err);
      setError('username.error');
    } finally {
      setIsCheckingCooldown(false);
    }
  }, [userId]);

  // Initial cooldown check
  useEffect(() => {
    checkCooldown();
  }, [checkCooldown]);

  // Update username
  const updateUsernameHandler = useCallback(
    async (newUsername: string) => {
      if (!userId) {
        setError('No user ID provided');
        return;
      }

      setIsUpdating(true);
      setError(null);

      try {
        const result = await updateUsernameService(userId, newUsername);

        if (result.success) {
          // Success - refresh cooldown status
          await checkCooldown();
          onSuccess?.();
        } else {
          // Error
          setError(result.error || 'username.error');
          onError?.(result.error || 'username.error');
        }
      } catch (err) {
        console.error('[useUsername] Update error:', err);
        setError('username.error');
        onError?.('username.error');
      } finally {
        setIsUpdating(false);
      }
    },
    [userId, checkCooldown, onSuccess, onError]
  );

  return {
    canUpdate: cooldown.canUpdate,
    nextAvailableDate: cooldown.nextAvailableDate,
    daysRemaining: cooldown.daysRemaining,
    isUpdating,
    isCheckingCooldown,
    error,
    updateUsername: updateUsernameHandler,
    refreshCooldown: checkCooldown
  };
};

