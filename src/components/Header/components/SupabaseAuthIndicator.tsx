import { faCheckCircle, faExclamationTriangle, faSpinner, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { useSupabaseAuthStatus } from 'hooks';

interface SupabaseAuthIndicatorProps {
  className?: string;
}

export const SupabaseAuthIndicator = ({ className }: SupabaseAuthIndicatorProps) => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, error, canRetry, hasSigned, retryAuth } = useSupabaseAuthStatus();

  const handleRetryClick = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    retryAuth();
  };

  // Ne pas afficher si pas de wallet connecté
  if (!isAuthenticated && !error && !canRetry) {
    return null;
  }

  const getIcon = () => {
    if (isLoading) {
      return faSpinner;
    }
    if (isAuthenticated) {
      return faCheckCircle;
    }
    if (error && canRetry) {
      return faExclamationTriangle;
    }
    return faExclamationTriangle;
  };

  const getColor = () => {
    if (isLoading) {
      return 'text-yellow-500'; // Jaune : signature en cours
    }
    if (hasSigned && isAuthenticated) {
      return 'text-green-500'; // Vert : JWT reçu avec succès
    }
    if (error && canRetry) {
      return 'text-red-500'; // Rouge : échec Edge Function
    }
    return 'text-black'; // Noir : pas connecté
  };

  const getTooltip = () => {
    if (isLoading) {
      return t('header.supabaseAuth.authenticating', 'Signature en cours...');
    }
    if (hasSigned && isAuthenticated) {
      return t('header.supabaseAuth.signed', 'Message signé avec succès');
    }
    if (error && canRetry) {
      return t('header.supabaseAuth.retry', 'Cliquez pour signer le message');
    }
    return t('header.supabaseAuth.unknown', 'Statut de signature inconnu');
  };

  return (
    <div
      className={`${className} cursor-pointer transition-all duration-200 hover:scale-110`}
      onClick={canRetry ? handleRetryClick : undefined}
      title={getTooltip()}
    >
      <FontAwesomeIcon
        icon={getIcon()}
        className={`${getColor()} ${isLoading ? 'animate-spin' : ''} ${canRetry ? 'hover:text-blue-500' : ''}`}
        size="lg"
      />
    </div>
  );
};
