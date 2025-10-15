import { NavLink, useNavigate } from 'react-router-dom';
import classNames from 'classnames';

import { RouteNamesEnum } from 'localConstants';
import { useGetAccount } from 'lib';
import { Logo } from 'components/Logo';

import styles from './sidebar.styles';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { path: RouteNamesEnum.dashboard, label: 'Dashboard', icon: '🏠' },
  { path: '/predictions', label: 'Predictions', icon: '⚽' },
  { path: '/war-games', label: 'War Games', icon: '⚔️' },
  { path: '/leaderboard', label: 'Leaderboards', icon: '🏆' },
  { path: '/streaks', label: 'Streaks', icon: '🔥' },
  { path: '/my-nfts', label: 'Mes NFTs', icon: '🖼️' },
  { path: '/team-of-week', label: 'Team of the Week', icon: '⭐' },
  { path: '/admin', label: 'Admin', icon: '👑', adminOnly: true }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const { address } = useGetAccount();
  
  // TODO: Replace with actual user data from context/hook
  const userRole = 'user'; // Will be 'king' for admin
  const userPoints = 1250;

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || userRole === 'king'
  );

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={classNames(styles.sidebar, {
        [styles.sidebarOpen]: isOpen
      })}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <Logo />
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Menu Items */}
        <nav className={styles.nav}>
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                classNames(styles.menuItem, {
                  [styles.menuItemActive]: isActive
                })
              }
              onClick={() => handleMenuClick(item.path)}
            >
              <span className={styles.menuIcon}>{item.icon}</span>
              <span className={styles.menuLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className={styles.userInfo}>
          <div className={styles.userPoints}>
            <span className={styles.pointsIcon}>⭐</span>
            <span className={styles.pointsValue}>{userPoints.toLocaleString()}</span>
            <span className={styles.pointsLabel}>points</span>
          </div>
          
          {address && (
            <div className={styles.userWallet}>
              <span className={styles.walletIcon}>👛</span>
              <span className={styles.walletAddress}>{formatAddress(address)}</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

