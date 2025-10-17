import { useTranslation } from 'react-i18next';

interface ParticipationBadgeProps {
  hasParticipated: boolean;
  className?: string;
}

export const ParticipationBadge = ({
  hasParticipated,
  className = ''
}: ParticipationBadgeProps) => {
  const { t } = useTranslation();

  if (hasParticipated) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-[var(--mvx-text-color-primary)] border border-green-500/30 ${className}`}
      >
        <svg
          className="w-4 h-4"
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
        {t('predictions.participated')}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--mvx-bg-accent-color)] text-[var(--mvx-text-color-secondary)] ${className}`}
    >
      {t('predictions.participate')}
    </span>
  );
};

