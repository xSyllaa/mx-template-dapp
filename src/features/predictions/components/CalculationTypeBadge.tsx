import { useTranslation } from 'react-i18next';
import type { BetCalculationType } from '../types';

interface CalculationTypeBadgeProps {
  calculationType: BetCalculationType;
  size?: 'sm' | 'md' | 'lg';
}

export const CalculationTypeBadge = ({
  calculationType,
  size = 'md'
}: CalculationTypeBadgeProps) => {
  const { t } = useTranslation();

  const configs = {
    fixed_odds: {
      icon: '🎯',
      label: t('predictions.calculationTypes.fixedOdds', { defaultValue: 'Fixed Odds' }),
      colors: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    pool_ratio: {
      icon: '📊',
      label: t('predictions.calculationTypes.poolRatio', { defaultValue: 'Pool Ratio' }),
      colors: 'bg-violet-500/20 text-violet-400 border-violet-500/30'
    }
  };

  const config = configs[calculationType];
  
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

