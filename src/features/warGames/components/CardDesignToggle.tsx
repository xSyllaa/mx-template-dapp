import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type CardDesign = 'vertical' | 'horizontal';

interface CardDesignToggleProps {
  design: CardDesign;
  onDesignChange: (design: CardDesign) => void;
}

export const CardDesignToggle = ({ design, onDesignChange }: CardDesignToggleProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[var(--mvx-text-color-secondary)]">
        {t('pages.warGames.cardDesign.label')}:
      </span>
      
      <div className="flex bg-[var(--mvx-bg-color-primary)] rounded-lg p-1 border border-[var(--mvx-border-color-secondary)]">
        <button
          onClick={() => onDesignChange('vertical')}
          className={`px-3 py-1 rounded text-sm transition-all ${
            design === 'vertical'
              ? 'bg-[var(--mvx-text-accent-color)] text-white'
              : 'text-[var(--mvx-text-color-secondary)] hover:text-[var(--mvx-text-color-primary)]'
          }`}
        >
          📄 {t('pages.warGames.cardDesign.vertical')}
        </button>
        
        <button
          onClick={() => onDesignChange('horizontal')}
          className={`px-3 py-1 rounded text-sm transition-all ${
            design === 'horizontal'
              ? 'bg-[var(--mvx-text-accent-color)] text-white'
              : 'text-[var(--mvx-text-color-secondary)] hover:text-[var(--mvx-text-color-primary)]'
          }`}
        >
          📋 {t('pages.warGames.cardDesign.horizontal')}
        </button>
      </div>
    </div>
  );
};


