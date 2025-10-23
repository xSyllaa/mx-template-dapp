import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Prediction } from 'features/predictions/types';

interface ActionMenuProps {
  prediction: Prediction;
  isHistorical: boolean;
  onViewDetails: (prediction: Prediction) => void;
  onValidate: (prediction: Prediction) => void;
  onClose: (predictionId: string) => void;
  onCancel: (predictionId: string) => void;
}

export const ActionMenu = ({
  prediction,
  isHistorical,
  onViewDetails,
  onValidate,
  onClose,
  onCancel
}: ActionMenuProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleActionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-[var(--mvx-bg-accent-color)] rounded-lg transition-colors"
        aria-label={t('common.actions', { defaultValue: 'Actions' })}
      >
        <svg
          className="w-5 h-5 text-[var(--mvx-text-color-secondary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-1 w-48 bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)] rounded-lg shadow-lg z-[9999]">
          <div className="py-1">
            {/* View Details - Always available */}
            <button
              onClick={() => handleActionClick(() => onViewDetails(prediction))}
              className="w-full px-4 py-2 text-left text-[var(--mvx-text-color-primary)] hover:bg-[var(--mvx-bg-accent-color)] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {t('common.viewDetails', { defaultValue: 'View Details' })}
            </button>

            {/* Historical predictions - Only view details available */}
            {isHistorical ? (
              // For historical predictions, only show the view details button (already shown above)
              null
            ) : (
              <>
                {/* Validate Result - Available for open/closed predictions */}
                {(prediction.status === 'open' || prediction.status === 'closed') && (
                  <button
                    onClick={() => handleActionClick(() => onValidate(prediction))}
                    className="w-full px-4 py-2 text-left text-green-400 hover:bg-green-500/20 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('predictions.admin.validateResult')}
                  </button>
                )}

                {/* Close Prediction - Available for open predictions */}
                {prediction.status === 'open' && (
                  <button
                    onClick={() => handleActionClick(() => onClose(prediction.id))}
                    className="w-full px-4 py-2 text-left text-orange-400 hover:bg-orange-500/20 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {t('toasts.admin.actions.close')}
                  </button>
                )}

                {/* Cancel Prediction - Available for non-resulted predictions */}
                {prediction.status !== 'resulted' && prediction.status !== 'cancelled' && (
                  <button
                    onClick={() => handleActionClick(() => onCancel(prediction.id))}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('predictions.admin.cancel')}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
