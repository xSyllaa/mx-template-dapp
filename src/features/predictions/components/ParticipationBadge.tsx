import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ParticipationBadgeProps {
  hasParticipated: boolean;
  isAnimating?: boolean;
  className?: string;
}

export const ParticipationBadge = ({
  hasParticipated,
  isAnimating = false,
  className = ''
}: ParticipationBadgeProps) => {
  const { t } = useTranslation();
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Trigger animation when participation changes
  useEffect(() => {
    if (hasParticipated && isAnimating) {
      console.log('[ParticipationBadge] Starting animation');
      // Start the animation sequence
      const timer = setTimeout(() => {
        console.log('[ParticipationBadge] Showing checkmark');
        setShowCheckmark(true);
      }, 200);

      const completeTimer = setTimeout(() => {
        console.log('[ParticipationBadge] Animation complete');
        setAnimationComplete(true);
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearTimeout(completeTimer);
      };
    }
  }, [hasParticipated, isAnimating]);

  // Reset animation state when not animating
  useEffect(() => {
    if (!isAnimating && hasParticipated) {
      setShowCheckmark(true);
      setAnimationComplete(true);
    }
  }, [isAnimating, hasParticipated]);

  if (hasParticipated) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-500 ease-out ${
          animationComplete
            ? 'bg-green-500/20 text-[var(--mvx-text-color-primary)] border border-green-500/30'
            : 'bg-green-500/10 text-green-400 border border-green-500/20'
        } ${className}`}
      >
        <svg
          className={`w-4 h-4 transition-all duration-300 ${
            showCheckmark ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span
          className={`transition-all duration-300 ${
            showCheckmark ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
        >
          {t('predictions.participated')}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--mvx-bg-accent-color)] text-[var(--mvx-text-color-secondary)] transition-all duration-300 hover:bg-[var(--mvx-bg-accent-color)]/80 ${className}`}
    >
      {t('predictions.participate')}
    </span>
  );
};

