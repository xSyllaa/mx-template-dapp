import { css } from '@emotion/react';

export const dashboardStatsStyles = css`
  .dashboard-stats {
    padding: 1.5rem;
    background: var(--mvx-bg-color-secondary);
    border-radius: 12px;
    border: 1px solid var(--mvx-border-color-secondary);
    
    &.loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }
    
    &.error {
      text-align: center;
      color: var(--mvx-text-color-secondary);
    }
    
    &.no-data {
      text-align: center;
      color: var(--mvx-text-color-secondary);
    }
  }

  .user-info {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--mvx-border-color-secondary);
    
    .username {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--mvx-text-color-primary);
      margin: 0 0 0.5rem 0;
    }
    
    .wallet-address {
      font-size: 0.875rem;
      color: var(--mvx-text-color-secondary);
      font-family: monospace;
      margin: 0 0 0.5rem 0;
      word-break: break-all;
    }
    
    .total-points {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--mvx-text-accent-color);
      margin: 0;
    }
  }

  .rankings {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .rank-card {
    background: var(--mvx-bg-color-primary);
    border: 1px solid var(--mvx-border-color-secondary);
    border-radius: 8px;
    padding: 1.25rem;
    text-align: center;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: var(--mvx-text-accent-color);
      transform: translateY(-2px);
    }
    
    &.global {
      .rank-badge {
        background: linear-gradient(135deg, #ffd700, #ffed4e);
        color: #000;
      }
    }
    
    &.weekly {
      .rank-badge {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
      }
    }
    
    &.monthly {
      .rank-badge {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
      }
    }
  }

  .rank-header {
    margin-bottom: 1rem;
    
    h3 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--mvx-text-color-primary);
      margin: 0 0 0.5rem 0;
    }
    
    .rank-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }

  .rank-value {
    .rank-number {
      display: block;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--mvx-text-color-primary);
      margin-bottom: 0.25rem;
    }
    
    .rank-details {
      display: block;
      font-size: 0.875rem;
      color: var(--mvx-text-color-secondary);
    }
  }

  .actions {
    text-align: center;
    padding-top: 1rem;
    border-top: 1px solid var(--mvx-border-color-secondary);
  }

  .refresh-btn {
    background: var(--mvx-text-accent-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    
    &:active {
      transform: translateY(0);
    }
  }

  .loading-spinner {
    color: var(--mvx-text-color-secondary);
    font-size: 1rem;
  }
`;

export const compactDashboardStatsStyles = css`
  .compact-dashboard-stats {
    background: var(--mvx-bg-color-secondary);
    border: 1px solid var(--mvx-border-color-secondary);
    border-radius: 8px;
    padding: 1rem;
    
    .loading {
      text-align: center;
      color: var(--mvx-text-color-secondary);
      font-size: 0.875rem;
    }
  }

  .user-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--mvx-border-color-secondary);
    
    .username {
      font-weight: 600;
      color: var(--mvx-text-color-primary);
    }
    
    .points {
      font-weight: 500;
      color: var(--mvx-text-accent-color);
    }
  }

  .ranks-summary {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .rank-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .label {
      font-size: 0.875rem;
      color: var(--mvx-text-color-secondary);
    }
    
    .value {
      font-weight: 600;
      color: var(--mvx-text-color-primary);
    }
  }
`;

// Responsive styles
export const responsiveStyles = css`
  @media (max-width: 768px) {
    .dashboard-stats {
      padding: 1rem;
    }
    
    .rankings {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
    
    .rank-card {
      padding: 1rem;
    }
    
    .user-info {
      .username {
        font-size: 1.25rem;
      }
      
      .wallet-address {
        font-size: 0.75rem;
      }
    }
  }
`;
