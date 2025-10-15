// prettier-ignore
const styles = {
  card: 'stats-card bg-secondary rounded-2xl p-6 border border-[var(--mvx-border-color-secondary)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex items-start gap-4',
  cardGold: 'bg-[var(--galactic-gold)] bg-opacity-10 border-[var(--galactic-gold)]',
  cardAccent: 'bg-[var(--galactic-teal)] bg-opacity-10 border-[var(--galactic-teal)]',
  
  iconContainer: 'icon-container flex-shrink-0 w-12 h-12 bg-accent bg-opacity-10 rounded-xl flex items-center justify-center',
  icon: 'icon text-2xl',
  
  content: 'content flex-1',
  label: 'label text-sm text-secondary mb-1',
  value: 'value text-3xl font-bold text-primary',
  
  change: 'change text-xs mt-2 font-semibold',
  changePositive: 'text-[var(--mvx-green-success)]',
  changeNegative: 'text-[var(--mvx-red-error)]'
} satisfies Record<string, string>;

export default styles;

