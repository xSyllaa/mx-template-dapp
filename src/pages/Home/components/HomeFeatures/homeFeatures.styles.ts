// prettier-ignore
const styles = {
  featuresContainer: 'features-container w-full max-w-7xl mx-auto px-4 py-16 md:py-24',
  
  featuresHeader: 'features-header text-center mb-12 md:mb-16',
  featuresTitle: 'features-title text-4xl md:text-5xl font-bold text-primary mb-4',
  featuresSubtitle: 'features-subtitle text-lg md:text-xl text-secondary max-w-3xl mx-auto',
  
  featuresGrid: 'features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8',
  
  featureCard: 'feature-card bg-secondary rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-[var(--mvx-border-color-secondary)]',
  featureEmoji: 'feature-emoji text-5xl md:text-6xl mb-4',
  featureTitle: 'feature-title text-xl md:text-2xl font-bold text-primary mb-3',
  featureDescription: 'feature-description text-sm md:text-base text-secondary leading-relaxed'
} satisfies Record<string, string>;

export default styles;

