// prettier-ignore
const styles = {
  featuresContainer: 'features-container max-w-7xl mx-auto py-16 px-6',
  featuresHeader: 'features-header text-center mb-12',
  featuresTitle: 'features-title text-4xl md:text-5xl font-bold text-primary mb-4',
  featuresSubtitle: 'features-subtitle text-lg text-secondary max-w-3xl mx-auto',
  
  featuresGrid: 'features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8',
  
  featureCard: 'feature-card bg-secondary rounded-2xl p-8 border border-[var(--mvx-border-color-secondary)] hover:border-accent transition-all duration-300 hover:scale-105 cursor-pointer',
  featureEmoji: 'feature-emoji text-5xl mb-4',
  featureTitle: 'feature-title text-xl font-bold text-primary mb-3',
  featureDescription: 'feature-description text-secondary leading-relaxed'
} satisfies Record<string, string>;

export default styles;
