import classNames from 'classnames';
import styles from './statsCard.styles';

interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  change?: {
    value: string;
    positive: boolean;
  };
  variant?: 'default' | 'gold' | 'accent';
}

export const StatsCard = ({ icon, label, value, change, variant = 'default' }: StatsCardProps) => {
  return (
    <div className={classNames(styles.card, {
      [styles.cardGold]: variant === 'gold',
      [styles.cardAccent]: variant === 'accent'
    })}>
      <div className={styles.iconContainer}>
        <span className={styles.icon}>{icon}</span>
      </div>
      
      <div className={styles.content}>
        <p className={styles.label}>{label}</p>
        <h3 className={styles.value}>{value}</h3>
        
        {change && (
          <p className={classNames(styles.change, {
            [styles.changePositive]: change.positive,
            [styles.changeNegative]: !change.positive
          })}>
            {change.positive ? '↑' : '↓'} {change.value}
          </p>
        )}
      </div>
    </div>
  );
};

