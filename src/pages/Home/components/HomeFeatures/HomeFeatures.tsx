import styles from './homeFeatures.styles';

interface FeatureCard {
  emoji: string;
  title: string;
  description: string;
}

const features: FeatureCard[] = [
  {
    emoji: '⚽',
    title: 'Prédictions de matchs',
    description: 'Parie sur les résultats et gagne des points à chaque bonne prédiction'
  },
  {
    emoji: '⚔️',
    title: 'Combats d\'équipes NFT',
    description: 'Affronte d\'autres joueurs avec tes 11 NFTs dans des war games épiques'
  },
  {
    emoji: '🏆',
    title: 'Classements',
    description: 'Grimpe au sommet du leaderboard et remporte des récompenses exclusives'
  },
  {
    emoji: '🔥',
    title: 'Streaks hebdomadaires',
    description: 'Claim quotidien pour des bonus progressifs et des multiplicateurs de points'
  }
];

export const HomeFeatures = () => {
  return (
    <div className={styles.featuresContainer}>
      <div className={styles.featuresHeader}>
        <h2 className={styles.featuresTitle}>
          Pourquoi GalacticX ?
        </h2>
        <p className={styles.featuresSubtitle}>
          Une expérience football gamifiée complète sur la blockchain MultiversX
        </p>
      </div>

      <div className={styles.featuresGrid}>
        {features.map((feature) => (
          <div key={feature.title} className={styles.featureCard}>
            <div className={styles.featureEmoji}>{feature.emoji}</div>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDescription}>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

