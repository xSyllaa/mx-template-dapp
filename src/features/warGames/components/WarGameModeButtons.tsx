import { useTranslation } from 'react-i18next';

interface WarGameModeButtonsProps {
  activeWarGamesCount: number;
  onCreateClick: () => void;
  onJoinClick: () => void;
}

export const WarGameModeButtons = ({ 
  activeWarGamesCount, 
  onCreateClick, 
  onJoinClick 
}: WarGameModeButtonsProps) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Active War Games Counter */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-full">
          <span className="text-2xl">⚔️</span>
          <span className="text-[var(--mvx-text-color-primary)] font-semibold">
            {t('pages.warGames.activeCount', { count: activeWarGamesCount })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Create War Game */}
        <div className="relative group">
          <button
            onClick={onCreateClick}
            className="w-full bg-[var(--mvx-bg-color-secondary)] border-2 border-[var(--mvx-border-color-secondary)] hover:border-[var(--mvx-text-accent-color)] rounded-xl p-8 transition-all cursor-pointer"
          >
            <div className="text-5xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-[var(--mvx-text-color-primary)] mb-3 group-hover:text-[var(--mvx-text-accent-color)] transition-colors">
              {t('pages.warGames.mode.create.title')}
            </h3>
            <p className="text-[var(--mvx-text-color-secondary)]">
              {t('pages.warGames.mode.create.description')}
            </p>
          </button>
        </div>

        {/* Join War Game */}
        <div className="relative group">
          <button
            onClick={() => activeWarGamesCount > 0 && onJoinClick()}
            className={`w-full bg-[var(--mvx-bg-color-secondary)] border-2 rounded-xl p-8 transition-all ${
              activeWarGamesCount > 0
                ? 'border-[var(--mvx-border-color-secondary)] hover:border-[var(--mvx-text-accent-color)] cursor-pointer'
                : 'border-[var(--mvx-border-color-secondary)] opacity-50 cursor-not-allowed'
            }`}
            disabled={activeWarGamesCount === 0}
          >
            <div className="text-5xl mb-4">🤝</div>
            <h3 className={`text-2xl font-bold text-[var(--mvx-text-color-primary)] mb-3 transition-colors ${
              activeWarGamesCount > 0 ? 'group-hover:text-[var(--mvx-text-accent-color)]' : ''
            }`}>
              {t('pages.warGames.mode.join.title')}
            </h3>
            <p className="text-[var(--mvx-text-color-secondary)]">
              {t('pages.warGames.mode.join.description')}
            </p>
            {activeWarGamesCount === 0 && (
              <p className="text-yellow-500 text-sm mt-2">
                {t('pages.warGames.mode.join.noGamesAvailable')}
              </p>
            )}
          </button>
          {/* Tooltip on hover */}
          {activeWarGamesCount === 0 && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-text-accent-color)] rounded-lg p-3 shadow-lg max-w-xs">
                <p className="text-sm text-[var(--mvx-text-color-primary)] text-center">
                  {t('pages.warGames.mode.join.noGamesTooltip')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

