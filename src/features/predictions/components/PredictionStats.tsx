import { useTranslation } from 'react-i18next';

interface PredictionStatsProps {
  activeCount: number;
  historyCount: number;
  loading?: boolean;
}

export const PredictionStats = ({
  activeCount,
  historyCount,
  loading = false
}: PredictionStatsProps) => {
  const { t } = useTranslation();
  const totalCount = activeCount + historyCount;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[var(--mvx-bg-color-secondary)] rounded-lg p-6 border border-[var(--mvx-border-color-secondary)] animate-pulse"
          >
            <div className="h-4 bg-[var(--mvx-bg-accent-color)] rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-[var(--mvx-bg-accent-color)] rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: t('predictions.stats.active', { count: activeCount }),
      value: activeCount,
      icon: '⚡',
      color: 'text-[var(--mvx-text-accent-color)]',
    },
    {
      label: t('predictions.stats.historical', { count: historyCount }),
      value: historyCount,
      icon: '📜',
      color: 'text-[var(--mvx-text-color-primary)]',
    },
    {
      label: t('predictions.stats.total', { count: totalCount }),
      value: totalCount,
      icon: '📊',
      color: 'text-[var(--mvx-text-accent-color)]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-[var(--mvx-bg-color-secondary)] rounded-lg p-6 border border-[var(--mvx-border-color-secondary)] hover:border-[var(--mvx-text-accent-color)] transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
            <span className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </span>
          </div>
          <p className="text-sm text-[var(--mvx-text-color-secondary)] font-medium">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
};

