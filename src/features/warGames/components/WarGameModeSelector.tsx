import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/Button';

interface WarGameModeSelectorProps {
  onSelectCreate: () => void;
  onSelectJoin: () => void;
}

/**
 * Component to select between creating a new War Game or joining an existing one
 */
export const WarGameModeSelector = ({ onSelectCreate, onSelectJoin }: WarGameModeSelectorProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <h2 className="text-3xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
        ⚔️ {t('pages.warGames.mode.title')}
      </h2>
      <p className="text-[var(--mvx-text-color-secondary)] text-center mb-12 max-w-md">
        {t('pages.warGames.mode.subtitle')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Create War Game Card */}
        <div 
          className="bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-xl p-8 hover:border-[var(--mvx-text-accent-color)] transition-all cursor-pointer group"
          onClick={onSelectCreate}
        >
          <div className="text-5xl mb-4">🎮</div>
          <h3 className="text-2xl font-bold text-[var(--mvx-text-color-primary)] mb-3 group-hover:text-[var(--mvx-text-accent-color)] transition-colors">
            {t('pages.warGames.mode.create.title')}
          </h3>
          <p className="text-[var(--mvx-text-color-secondary)] mb-6">
            {t('pages.warGames.mode.create.description')}
          </p>
          <ul className="space-y-2 mb-6 text-[var(--mvx-text-color-secondary)] text-sm">
            <li className="flex items-start">
              <span className="text-[var(--mvx-text-accent-color)] mr-2">✓</span>
              <span>{t('pages.warGames.mode.create.features.selectTeam')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--mvx-text-accent-color)] mr-2">✓</span>
              <span>{t('pages.warGames.mode.create.features.setPoints')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--mvx-text-accent-color)] mr-2">✓</span>
              <span>{t('pages.warGames.mode.create.features.setDeadline')}</span>
            </li>
          </ul>
          <Button
            onClick={onSelectCreate}
            variant="primary"
            className="w-full"
          >
            {t('pages.warGames.mode.create.button')}
          </Button>
        </div>

        {/* Join War Game Card */}
        <div 
          className="bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-xl p-8 hover:border-[var(--mvx-text-accent-color)] transition-all cursor-pointer group"
          onClick={onSelectJoin}
        >
          <div className="text-5xl mb-4">🤝</div>
          <h3 className="text-2xl font-bold text-[var(--mvx-text-color-primary)] mb-3 group-hover:text-[var(--mvx-text-accent-color)] transition-colors">
            {t('pages.warGames.mode.join.title')}
          </h3>
          <p className="text-[var(--mvx-text-color-secondary)] mb-6">
            {t('pages.warGames.mode.join.description')}
          </p>
          <ul className="space-y-2 mb-6 text-[var(--mvx-text-color-secondary)] text-sm">
            <li className="flex items-start">
              <span className="text-[var(--mvx-text-accent-color)] mr-2">✓</span>
              <span>{t('pages.warGames.mode.join.features.browseGames')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--mvx-text-accent-color)] mr-2">✓</span>
              <span>{t('pages.warGames.mode.join.features.selectTeam')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--mvx-text-accent-color)] mr-2">✓</span>
              <span>{t('pages.warGames.mode.join.features.challengeOpponent')}</span>
            </li>
          </ul>
          <Button
            onClick={onSelectJoin}
            variant="secondary"
            className="w-full"
          >
            {t('pages.warGames.mode.join.button')}
          </Button>
        </div>
      </div>
    </div>
  );
};

