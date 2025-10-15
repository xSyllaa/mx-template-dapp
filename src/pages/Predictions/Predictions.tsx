import { useTranslation } from 'react-i18next';

// prettier-ignore
const styles = {
  container: 'container max-w-7xl mx-auto',
  header: 'header mb-8',
  title: 'title text-4xl md:text-5xl font-bold text-primary mb-4',
  subtitle: 'subtitle text-lg text-secondary',
  comingSoon: 'coming-soon text-center py-16',
  comingSoonText: 'text-2xl text-accent font-semibold'
} satisfies Record<string, string>;

export const Predictions = () => {
  const { t } = useTranslation();
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>⚽ {t('pages.predictions.title')}</h1>
        <p className={styles.subtitle}>
          {t('pages.predictions.subtitle')}
        </p>
      </div>

      <div className={styles.comingSoon}>
        <p className={styles.comingSoonText}>🚧 {t('common.comingSoon')} 🚧</p>
      </div>
    </div>
  );
};

