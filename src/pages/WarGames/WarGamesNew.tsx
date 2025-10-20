import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'contexts/AuthContext';
import { 
  WarGameModeSelector, 
  CreateWarGameModal, 
  JoinWarGameModal 
} from 'features/warGames';
import { Button } from 'components/Button';

type ViewMode = 'selector' | 'create' | 'join';

export const WarGamesNew = () => {
  const { t } = useTranslation();
  const { isAuthenticated, supabaseUserId, signIn } = useAuth();
  
  const [viewMode, setViewMode] = useState<ViewMode>('selector');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Handle authentication
  if (!isAuthenticated) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
              ⚔️ {t('pages.warGames.title')}
            </h1>
            <p className="text-[var(--mvx-text-color-secondary)] mb-8">
              {t('pages.warGames.notConnected.subtitle')}
            </p>
            <Button onClick={signIn} variant="primary" size="large">
              {t('common.connect')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateSuccess = () => {
    setViewMode('selector');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  const handleJoinSuccess = () => {
    setViewMode('selector');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--mvx-text-color-primary)] to-[var(--mvx-text-accent-color)] bg-clip-text text-transparent">
              ⚔️ {t('pages.warGames.title')}
            </h1>
            <p className="text-lg text-[var(--mvx-text-color-secondary)]">
              {t('pages.warGames.subtitle')}
            </p>
          </div>
          {viewMode !== 'selector' && (
            <Button
              onClick={() => setViewMode('selector')}
              variant="secondary"
            >
              ← {t('common.back')}
            </Button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-6 bg-green-500/20 border border-green-500 rounded-lg p-4">
          <p className="text-green-500 font-semibold">
            ✓ {t('common.success')}
          </p>
        </div>
      )}

      {/* Mode Selector */}
      {viewMode === 'selector' && (
        <WarGameModeSelector
          onSelectCreate={() => setViewMode('create')}
          onSelectJoin={() => setViewMode('join')}
        />
      )}

      {/* Create War Game Modal */}
      {viewMode === 'create' && (
        <CreateWarGameModal
          userId={supabaseUserId!}
          onClose={() => setViewMode('selector')}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Join War Game Modal */}
      {viewMode === 'join' && (
        <JoinWarGameModal
          userId={supabaseUserId!}
          onClose={() => setViewMode('selector')}
          onSuccess={handleJoinSuccess}
        />
      )}
    </div>
  );
};

