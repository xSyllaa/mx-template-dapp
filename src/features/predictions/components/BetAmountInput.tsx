import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface BetAmountInputProps {
  minBet: number;
  maxBet: number;
  userPoints: number;
  value: number;
  onChange: (amount: number) => void;
  disabled?: boolean;
}

export const BetAmountInput = ({
  minBet,
  maxBet,
  userPoints,
  value,
  onChange,
  disabled = false
}: BetAmountInputProps) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  // Calculate effective max (user's points or bet limit)
  const effectiveMax = Math.min(maxBet, userPoints);

  // Validate amount
  useEffect(() => {
    if (value < minBet) {
      setError(t('predictions.errors.belowMinBet', { min: minBet }));
    } else if (value > maxBet) {
      setError(t('predictions.errors.aboveMaxBet', { max: maxBet }));
    } else if (value > userPoints) {
      setError(t('predictions.errors.insufficientPoints'));
    } else {
      setError(null);
    }
  }, [value, minBet, maxBet, userPoints, t]);

  // Handle increment
  const handleIncrement = () => {
    const newValue = Math.min(value + 10, effectiveMax);
    onChange(newValue);
  };

  // Handle decrement
  const handleDecrement = () => {
    const newValue = Math.max(value - 10, minBet);
    onChange(newValue);
  };

  // Handle quick select
  const handleQuickSelect = (percentage: number) => {
    let amount: number;
    if (percentage === 0) {
      amount = minBet;
    } else if (percentage === 100) {
      amount = effectiveMax;
    } else {
      amount = Math.floor(userPoints * (percentage / 100));
      amount = Math.max(minBet, Math.min(amount, effectiveMax));
    }
    onChange(amount);
  };

  // Handle manual input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(e.target.value) || 0;
    onChange(inputValue);
  };

  return (
    <div className="space-y-3">
      {/* Balance Display */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--mvx-text-color-secondary)]">
          {t('predictions.yourBalance')}:
        </span>
        <span className="text-[var(--mvx-text-color-primary)] font-semibold">
          {userPoints} {t('common.points')}
        </span>
      </div>

      {/* Input with +/- Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= minBet}
          className="w-10 h-10 flex items-center justify-center bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] hover:bg-[var(--mvx-bg-accent-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          −
        </button>
        
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          min={minBet}
          max={effectiveMax}
          className="flex-1 px-4 py-2 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] text-center font-semibold focus:outline-none focus:border-[var(--mvx-text-accent-color)] disabled:opacity-50"
        />
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= effectiveMax}
          className="w-10 h-10 flex items-center justify-center bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] hover:bg-[var(--mvx-bg-accent-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      {/* Min/Max Indicators */}
      <div className="flex items-center justify-between text-xs text-[var(--mvx-text-color-secondary)]">
        <span>
          {t('predictions.minBet')}: {minBet}
        </span>
        <span>
          {t('predictions.maxBet')}: {maxBet}
        </span>
      </div>

      {/* Quick Select Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => handleQuickSelect(0)}
          disabled={disabled}
          className="px-3 py-2 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] text-sm hover:bg-[var(--mvx-bg-accent-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Min
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect(25)}
          disabled={disabled}
          className="px-3 py-2 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] text-sm hover:bg-[var(--mvx-bg-accent-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          25%
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect(50)}
          disabled={disabled}
          className="px-3 py-2 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] text-sm hover:bg-[var(--mvx-bg-accent-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          50%
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect(100)}
          disabled={disabled}
          className="px-3 py-2 bg-[var(--mvx-bg-color-secondary)] border border-[var(--mvx-border-color-secondary)] rounded-lg text-[var(--mvx-text-color-primary)] text-sm hover:bg-[var(--mvx-bg-accent-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Max
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

