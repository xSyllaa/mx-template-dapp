import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { validateUsername, checkUsernameAvailability } from '../services/usernameService';
import { useUsername } from '../hooks/useUsername';
import { useToast } from 'hooks/useToast';

interface UsernameEditorProps {
  userId: string;
  currentUsername: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

// Debounce helper
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const UsernameEditor = ({
  userId,
  currentUsername,
  onClose,
  onSuccess
}: UsernameEditorProps) => {
  console.log('🎨 [UsernameEditor] Component mounted/rendered');
  console.log('🎨 [UsernameEditor] Props:', { userId, currentUsername });
  
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [input, setInput] = useState(currentUsername || '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const debouncedInput = useDebounce(input, 500);

  const {
    canUpdate,
    daysRemaining,
    isUpdating,
    updateUsername
  } = useUsername({
    userId,
    onSuccess: () => {
      toast.success(t('username.success'));
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(t(error));
    }
  });

  // Validate input on change
  useEffect(() => {
    if (!input.trim()) {
      setValidationError(null);
      setAvailabilityError(null);
      return;
    }

    const validation = validateUsername(input);
    if (!validation.isValid) {
      setValidationError(validation.error || null);
      setAvailabilityError(null);
      return;
    }

    setValidationError(null);
  }, [input]);

  // Check availability (debounced)
  useEffect(() => {
    const checkAvailability = async () => {
      if (!debouncedInput.trim() || validationError) {
        return;
      }

      // Don't check if it's the same as current username
      if (debouncedInput.trim() === currentUsername) {
        setAvailabilityError(null);
        return;
      }

      setIsCheckingAvailability(true);
      setAvailabilityError(null);

      try {
        const result = await checkUsernameAvailability(debouncedInput, userId);
        if (!result.isAvailable) {
          setAvailabilityError(result.error || null);
        }
      } catch (err) {
        console.error('Error checking availability:', err);
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [debouncedInput, userId, currentUsername, validationError]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!canUpdate || validationError || availabilityError || !input.trim()) {
        return;
      }

      await updateUsername(input);
    },
    [canUpdate, validationError, availabilityError, input, updateUsername]
  );

  const isValid =
    input.trim().length > 0 &&
    !validationError &&
    !availabilityError &&
    input.trim() !== currentUsername;

  const canSubmit = canUpdate && isValid && !isUpdating && !isCheckingAvailability;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-[var(--mvx-bg-color-secondary)] p-6 shadow-xl border border-[var(--mvx-border-color-secondary)]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--mvx-text-color-primary)]">
            {t('username.edit')}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--mvx-text-color-secondary)] hover:text-[var(--mvx-text-color-primary)] transition-colors"
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>

        {/* Cooldown Warning */}
        {!canUpdate && daysRemaining && (
          <div className="mb-4 rounded-lg bg-yellow-500/20 p-3 text-sm text-[var(--mvx-text-color-primary)]">
            {t('username.cooldown.active', { days: daysRemaining })}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username-input"
              className="mb-2 block text-sm font-medium text-[var(--mvx-text-color-primary)]"
            >
              {t('username.label')}
            </label>
            <input
              id="username-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('username.placeholder')}
              disabled={!canUpdate || isUpdating}
              className={classNames(
                'w-full rounded-lg border px-4 py-2 transition-colors',
                'bg-[var(--mvx-bg-color-primary)] text-[var(--mvx-text-color-primary)]',
                'placeholder:text-[var(--mvx-text-color-tertiary)]',
                'focus:outline-none focus:ring-2',
                {
                  'border-[var(--mvx-border-color-secondary)]': !validationError && !availabilityError,
                  'border-red-500': validationError || availabilityError,
                  'focus:ring-[var(--mvx-text-accent-color)]': !validationError && !availabilityError,
                  'opacity-50 cursor-not-allowed': !canUpdate || isUpdating
                }
              )}
              maxLength={20}
            />
            
            {/* Character Count */}
            <div className="mt-1 text-right text-xs text-[var(--mvx-text-color-secondary)]">
              {input.length}/20
            </div>

            {/* Validation Error */}
            {validationError && (
              <p className="mt-2 text-sm text-red-500">
                {t(validationError)}
              </p>
            )}

            {/* Availability Check */}
            {!validationError && isCheckingAvailability && (
              <p className="mt-2 text-sm text-[var(--mvx-text-color-secondary)]">
                {t('common.loading')}
              </p>
            )}

            {/* Availability Error */}
            {!validationError && availabilityError && !isCheckingAvailability && (
              <p className="mt-2 text-sm text-red-500">
                {t(availabilityError)}
              </p>
            )}

            {/* Success Indicator */}
            {!validationError && !availabilityError && !isCheckingAvailability && isValid && (
              <p className="mt-2 text-sm text-green-500">
                ✓ {t('username.validation.available')}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="flex-1 rounded-lg border border-[var(--mvx-border-color-secondary)] bg-transparent px-4 py-2 text-[var(--mvx-text-color-primary)] transition-colors hover:bg-[var(--mvx-bg-accent-color)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('username.cancel')}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={classNames(
                'flex-1 rounded-lg px-4 py-2 font-medium transition-all',
                {
                  'bg-[var(--mvx-text-accent-color)] text-white hover:opacity-90': canSubmit,
                  'bg-gray-500/20 text-[var(--mvx-text-color-tertiary)] cursor-not-allowed': !canSubmit
                }
              )}
            >
              {isUpdating ? t('common.loading') : t('username.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

