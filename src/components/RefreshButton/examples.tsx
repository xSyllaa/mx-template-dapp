// Exemples d'utilisation du composant RefreshButton

import { RefreshButton } from './RefreshButton';

// Exemple 1: Actualisation simple
export const SimpleRefreshExample = () => {
  const handleRefresh = async () => {
    // Votre logique d'actualisation ici
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  return (
    <RefreshButton
      onRefresh={handleRefresh}
      normalText="Actualiser les données"
    />
  );
};

// Exemple 2: Actualisation avec paramètres personnalisés
export const CustomRefreshExample = () => {
  const handleRefresh = async () => {
    await fetch('/api/data').then(() => {});
  };

  return (
    <RefreshButton
      onRefresh={handleRefresh}
      cooldownMs={60000} // 1 minute de cooldown
      minLoadingMs={2000} // 2 secondes minimum de loading
      normalText="Synchroniser"
      loadingText="Synchronisation..."
      successText="Synchronisé !"
      toastMessage={(seconds) => `⏳ Attendez ${seconds}s avant de resynchroniser`}
      variant="secondary"
      size="medium"
    />
  );
};

// Exemple 3: Dans une page de paramètres
export const SettingsRefreshExample = () => {
  const handleRefresh = async () => {
    // Actualiser les paramètres utilisateur
    await updateUserSettings();
  };

  return (
    <RefreshButton
      onRefresh={handleRefresh}
      normalText="Recharger les paramètres"
      loadingText="Rechargement..."
      successText="Paramètres rechargés"
    />
  );
};

// Exemple 4: Avec du contenu personnalisé
export const CustomContentExample = () => {
  const handleRefresh = async () => {
    await refreshDashboard();
  };

  return (
    <RefreshButton onRefresh={handleRefresh}>
      <span>🔄</span>
      Actualiser le dashboard
    </RefreshButton>
  );
};
