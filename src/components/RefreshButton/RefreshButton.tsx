import { useState, useCallback } from 'react';
import { useToast } from 'hooks/useToast';
import { Button } from 'components/Button';

export interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void;
  cooldownMs?: number;
  minLoadingMs?: number;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'neutral';
  size?: 'small' | 'large';
  className?: string;
  disabled?: boolean;
  loadingText?: string;
  successText?: string;
  normalText?: string;
  toastTitle?: string;
  toastMessage?: (remainingSeconds: number) => string;
  showToasts?: boolean;
}

export const RefreshButton = ({
  onRefresh,
  cooldownMs = 30000, // 30 seconds default
  minLoadingMs = 1000, // 1 second minimum loading
  children,
  variant = 'primary',
  size = 'small',
  className = '',
  disabled = false,
  loadingText = 'Actualisation...',
  successText = 'Actualisé',
  normalText = 'Actualiser',
  toastTitle = 'Temps d\'attente',
  toastMessage = (remainingSeconds: number) =>
    `⏰ Veuillez attendre ${remainingSeconds} secondes avant de recharger`,
  showToasts = true,
}: RefreshButtonProps) => {
  const { toast } = useToast();

  // States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get cooldown status
  const getCooldownStatus = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime;
    const cooldownRemaining = Math.max(0, cooldownMs / 1000 - Math.floor(timeSinceLastRefresh / 1000));
    return {
      inCooldown: timeSinceLastRefresh < cooldownMs,
      remainingSeconds: cooldownRemaining
    };
  }, [lastRefreshTime, cooldownMs]);

  // Show cooldown toast
  const showCooldownToast = useCallback((remainingSeconds: number) => {
    if (showToasts) {
      toast.info(toastTitle, toastMessage(remainingSeconds));
    }
  }, [toast, toastTitle, toastMessage, showToasts]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    const { inCooldown, remainingSeconds } = getCooldownStatus();

    if (inCooldown) {
      showCooldownToast(remainingSeconds);
      return;
    }

    setIsRefreshing(true);
    setLastRefreshTime(Date.now());

    try {
      await onRefresh();

      // Ensure minimum loading time
      await new Promise(resolve => setTimeout(resolve, minLoadingMs));
    } finally {
      setIsRefreshing(false);

      // Show success message for 1 second
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);
    }
  }, [onRefresh, getCooldownStatus, showCooldownToast, minLoadingMs]);

  // Determine button state
  const getButtonState = () => {
    if (isRefreshing) {
      return {
        icon: '⏳',
        text: loadingText,
        className: 'animate-spin'
      };
    }

    if (showSuccess) {
      return {
        icon: '✓',
        text: successText,
        className: ''
      };
    }

    return {
      icon: '🔄',
      text: normalText,
      className: ''
    };
  };

  const buttonState = getButtonState();
  const { inCooldown } = getCooldownStatus();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={disabled || isRefreshing || inCooldown}
      className={`flex items-center gap-2 ${className}`}
    >
      <span className={buttonState.className}>
        {buttonState.icon}
      </span>
      {children || buttonState.text}
    </Button>
  );
};
