import { useState, useEffect, useCallback } from 'react';
import type { UserPrediction } from '../types';
import {
  getUserPrediction,
  submitPrediction
} from '../services/predictionService';

interface UseUserPredictionReturn {
  userPrediction: UserPrediction | null;
  hasParticipated: boolean;
  loading: boolean;
  error: Error | null;
  submitting: boolean;
  isAnimating: boolean;
  submit: (optionId: string, pointsWagered: number) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Custom hook to manage user's prediction for a specific match
 * @param predictionId - Prediction UUID
 * @param userId - User's UUID (can be null if not logged in)
 */
export const useUserPrediction = (
  predictionId: string,
  userId: string | null
): UseUserPredictionReturn => {
  const [userPrediction, setUserPrediction] = useState<UserPrediction | null>(
    null
  );
  const [hasParticipated, setHasParticipated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch user's prediction
  const fetchUserPrediction = useCallback(async () => {
    if (!userId || !predictionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getUserPrediction(userId, predictionId);

      setUserPrediction(data);
      setHasParticipated(!!data);
    } catch (err) {
      console.error('[useUserPrediction] Error fetching user prediction:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, predictionId]);

  // Initial fetch - only when userId or predictionId changes
  useEffect(() => {
    if (userId && predictionId) {
      fetchUserPrediction();
    }
  }, [userId, predictionId]); // Remove fetchUserPrediction from dependencies

  // Submit prediction
  const submit = useCallback(
    async (optionId: string, pointsWagered: number) => {
      if (!userId) {
        throw new Error('User must be logged in to submit prediction');
      }

      if (hasParticipated) {
        throw new Error('User has already participated in this prediction');
      }

      try {
        setSubmitting(true);
        setError(null);

        const newPrediction = await submitPrediction(
          userId,
          predictionId,
          optionId,
          pointsWagered
        );

        setUserPrediction(newPrediction);
        setHasParticipated(true);
        
        // Trigger animation
        setIsAnimating(true);
        
        // Reset animation after completion
        setTimeout(() => {
          setIsAnimating(false);
        }, 1200);
      } catch (err) {
        console.error('[useUserPrediction] Error submitting prediction:', err);
        setError(err as Error);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [userId, predictionId, hasParticipated]
  );

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchUserPrediction();
  }, [fetchUserPrediction]);

  return {
    userPrediction,
    hasParticipated,
    loading,
    error,
    submitting,
    isAnimating,
    submit,
    refresh
  };
};

