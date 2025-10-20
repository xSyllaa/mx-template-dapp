import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const Admin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const adminActions = [
    {
      title: t('predictions.admin.createPrediction'),
      description: 'Créer une nouvelle prédiction de match',
      icon: '⚽',
      path: '/admin/create-prediction',
      color: 'bg-blue-500/20 border-blue-500/30 hover:border-blue-500'
    },
    {
      title: t('predictions.admin.managePredictions'),
      description: 'Gérer, valider ou supprimer des prédictions',
      icon: '📊',
      path: '/admin/manage-predictions',
      color: 'bg-green-500/20 border-green-500/30 hover:border-green-500'
    },
    {
      title: 'Gérer les War Games',
      description: 'Créer et gérer les war games',
      icon: '⚔️',
      path: '/admin/war-games',
      color: 'bg-red-500/20 border-red-500/30 hover:border-red-500',
      disabled: true
    },
    {
      title: 'Gérer les Leaderboards',
      description: 'Configurer les classements et récompenses',
      icon: '🏆',
      path: '/admin/leaderboards',
      color: 'bg-yellow-500/20 border-yellow-500/30 hover:border-yellow-500',
      disabled: true
    },
    {
      title: 'Select Team of the Week',
      description: 'Sélectionner l\'équipe de la semaine et récupérer les holders',
      icon: '⭐',
      path: '/admin/select-team-of-week',
      color: 'bg-purple-500/20 border-purple-500/30 hover:border-purple-500'
    }
  ];

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--mvx-text-color-primary)] mb-4">
          👑 {t('pages.admin.title')}
        </h1>
        <p className="text-lg text-[var(--mvx-text-color-secondary)]">
          {t('pages.admin.subtitle')}
        </p>
      </div>

      {/* Admin Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminActions.map((action) => (
          <button
            key={action.path}
            onClick={() => !action.disabled && navigate(action.path)}
            disabled={action.disabled}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              action.color
            } ${
              action.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer transform hover:scale-105'
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{action.icon}</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[var(--mvx-text-color-primary)] mb-2">
                  {action.title}
                </h3>
                <p className="text-[var(--mvx-text-color-secondary)]">
                  {action.description}
                </p>
                {action.disabled && (
                  <span className="inline-block mt-2 text-sm text-[var(--mvx-text-color-secondary)] italic">
                    {t('common.comingSoon')}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>


      {/* Info Box */}
      <div className="mt-8 p-6 bg-[var(--mvx-bg-accent-color)] rounded-xl border border-[var(--mvx-border-color-secondary)]">
        <p className="text-[var(--mvx-text-color-primary)]">
          <strong>ℹ️ Note:</strong> En tant qu'administrateur, vous avez accès aux
          fonctionnalités de gestion. Toutes les actions sont sécurisées par RLS
          au niveau de la base de données.
        </p>
      </div>
    </div>
  );
};

