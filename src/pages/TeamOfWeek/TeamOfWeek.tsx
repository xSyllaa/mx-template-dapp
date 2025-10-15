// prettier-ignore
const styles = {
  container: 'container max-w-7xl mx-auto',
  header: 'header mb-8',
  title: 'title text-4xl md:text-5xl font-bold text-primary mb-4',
  subtitle: 'subtitle text-lg text-secondary',
  comingSoon: 'coming-soon text-center py-16',
  comingSoonText: 'text-2xl text-accent font-semibold'
} satisfies Record<string, string>;

export const TeamOfWeek = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>⭐ Team of the Week</h1>
        <p className={styles.subtitle}>
          Découvre la meilleure équipe de la semaine
        </p>
      </div>

      <div className={styles.comingSoon}>
        <p className={styles.comingSoonText}>🚧 Coming Soon 🚧</p>
      </div>
    </div>
  );
};

