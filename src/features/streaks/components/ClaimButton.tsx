import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DayClaimState, DayOfWeek, ClaimRewardResponse } from '../types';
import { ClaimStatus } from '../types';

interface ClaimButtonProps {
  todaysClaim: DayClaimState | null;
  canClaimToday: boolean;
  onClaim: (day: DayOfWeek) => Promise<ClaimRewardResponse>;
  disabled?: boolean;
}

const styles = {
  container: 'w-full max-w-md mx-auto',
  button: 'w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed',
  buttonAvailable: 'bg-[var(--mvx-text-accent-color)] hover:bg-[var(--mvx-hover-color-primary)] text-white shadow-lg hover:shadow-xl',
  buttonDisabled: 'bg-[var(--mvx-bg-color-secondary)] text-[var(--mvx-text-color-tertiary)] cursor-not-allowed opacity-50',
  buttonLoading: 'bg-[var(--mvx-text-accent-color)] text-white cursor-wait opacity-80',
  message: 'text-center mt-4 text-sm text-[var(--mvx-text-color-secondary)]',
  messageSuccess: 'text-center mt-4 text-sm font-semibold bg-green-500/20 px-4 py-2 rounded-lg text-white',
  messageError: 'text-center mt-4 text-sm font-semibold bg-red-500/20 px-4 py-2 rounded-lg text-white'
} satisfies Record<string, string>;

export const ClaimButton = ({
  todaysClaim,
  canClaimToday,
  onClaim,
  disabled = false
}: ClaimButtonProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const handleClaim = async () => {
    if (!todaysClaim || !canClaimToday || loading || disabled) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await onClaim(todaysClaim.day);
      setMessage({
        type: 'success',
        text: t('pages.streaks.claim.success', { points: response.points_earned })
      });
    } catch (error) {
      console.error('[ClaimButton] Error claiming:', error);
      setMessage({
        type: 'error',
        text: t('pages.streaks.claim.error')
      });
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = (): string => {
    if (loading) {
      return t('common.loading');
    }

    if (!todaysClaim) {
      return t('pages.streaks.claim.locked');
    }

    if (todaysClaim.status === ClaimStatus.CLAIMED) {
      return t('pages.streaks.claim.claimed');
    }

    if (todaysClaim.status === ClaimStatus.AVAILABLE && canClaimToday) {
      return t('pages.streaks.claim.button', { points: todaysClaim.points });
    }

    return t('pages.streaks.claim.mustWait');
  };

  const getButtonClass = (): string => {
    if (loading) {
      return `${styles.button} ${styles.buttonLoading}`;
    }

    if (canClaimToday && !disabled) {
      return `${styles.button} ${styles.buttonAvailable}`;
    }

    return `${styles.button} ${styles.buttonDisabled}`;
  };

  const getMessageClass = (): string => {
    if (!message) return styles.message;
    
    switch (message.type) {
      case 'success':
        return styles.messageSuccess;
      case 'error':
        return styles.messageError;
      default:
        return styles.message;
    }
  };

  return (
    <div className={styles.container}>
      <button
        onClick={handleClaim}
        disabled={!canClaimToday || loading || disabled}
        className={getButtonClass()}
      >
        {getButtonText()}
      </button>

      {message && (
        <p className={getMessageClass()}>
          {message.text}
        </p>
      )}

      {todaysClaim?.status === ClaimStatus.CLAIMED && (
        <p className={styles.message}>
          {t('pages.streaks.claim.mustWait')}
        </p>
      )}
    </div>
  );
};

