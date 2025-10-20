import { useTranslation } from 'react-i18next';
import type { BetType } from '../types';

interface BetTypeBadgeProps {
  betType: BetType;
  size?: 'sm' | 'md' | 'lg';
}

export const BetTypeBadge = ({ betType, size = 'md' }: BetTypeBadgeProps) => {
  const { t } = useTranslation();

  const configs = {
    result: {
      icon: '⚽',
      label: t('predictions.betTypes.result', { defaultValue: 'Match Result' }),
      colors: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    over_under: {
      icon: '🎯',
      label: t('predictions.betTypes.over_under', { defaultValue: 'Over/Under' }),
      colors: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    },
    scorer: {
      icon: '⭐',
      label: t('predictions.betTypes.scorer', { defaultValue: 'First Scorer' }),
      colors: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    },
    both_teams_score: {
      icon: '🔥',
      label: t('predictions.betTypes.both_teams_score', { defaultValue: 'Both Teams Score' }),
      colors: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    }
  };

  const config = configs[betType];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${config.colors} ${sizeClasses[size]}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
};

