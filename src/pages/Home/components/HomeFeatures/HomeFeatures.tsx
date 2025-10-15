import { useTranslation } from 'react-i18next';
import styles from './homeFeatures.styles';

interface FeatureCard {
  emoji: string;
  titleKey: string;
  descriptionKey: string;
}

export const HomeFeatures = () => {
  const { t } = useTranslation();
  
  const features: FeatureCard[] = [
    {
      emoji: '⚽',
      titleKey: 'home.features.predictions.title',
      descriptionKey: 'home.features.predictions.description'
    },
    {
      emoji: '⚔️',
      titleKey: 'home.features.warGames.title',
      descriptionKey: 'home.features.warGames.description'
    },
    {
      emoji: '🏆',
      titleKey: 'home.features.leaderboards.title',
      descriptionKey: 'home.features.leaderboards.description'
    },
    {
      emoji: '🔥',
      titleKey: 'home.features.streaks.title',
      descriptionKey: 'home.features.streaks.description'
    }
  ];

  return (
    <div className={styles.featuresContainer}>
      <div className={styles.featuresHeader}>
        <h2 className={styles.featuresTitle}>
          {t('home.whyGalacticx')}
        </h2>
        <p className={styles.featuresSubtitle}>
          {t('home.whySubtitle')}
        </p>
      </div>

      <div className={styles.featuresGrid}>
        {features.map((feature) => (
          <div key={feature.titleKey} className={styles.featureCard}>
            <div className={styles.featureEmoji}>{feature.emoji}</div>
            <h3 className={styles.featureTitle}>{t(feature.titleKey)}</h3>
            <p className={styles.featureDescription}>{t(feature.descriptionKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
