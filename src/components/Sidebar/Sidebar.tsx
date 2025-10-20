import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import { RouteNamesEnum } from 'localConstants';
import { useGetAccount } from 'lib';
import { useUserRole } from 'hooks';
import { useToast } from 'hooks/useToast';
import { Logo } from 'components/Logo';
import { ToastContainer } from 'components/Toast';
import { UsernameEditor } from 'features/username';

// prettier-ignore
const styles = {
  // Overlay (mobile)
  overlay: 'fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ease-in-out',
  
  // Sidebar - Mobile: full screen | Desktop: normal width
  sidebar: 'fixed top-0 left-0 h-full w-full bg-secondary border-r border-[var(--mvx-border-color-secondary)] z-50 transform -translate-x-full transition-all duration-300 ease-in-out flex flex-col',
  sidebarOpen: 'translate-x-0',
  sidebarDesktop: 'md:w-64 md:translate-x-0',
  sidebarCollapsed: 'md:w-20',
  
  // Logo
  logoContainer: 'logo-container flex items-center justify-between gap-2 p-6 border-b border-[var(--mvx-border-color-secondary)] relative',
  collapsedLogo: 'collapsed-logo text-3xl font-bold text-primary mx-auto',
  
  // Toggle/Close Button - Unified design
  toggleButton: 'toggle-button flex items-center justify-center w-9 h-9 rounded-lg bg-accent bg-opacity-10 hover:bg-opacity-20 text-primary hover:text-accent transition-all duration-200 cursor-pointer hover:scale-105 border border-[var(--mvx-border-color-secondary)] hover:border-accent',
  toggleIcon: 'transition-transform duration-200',
  
  // Navigation
  nav: 'nav flex-1 overflow-y-auto py-4 px-3',
  
  menuItem: 'menu-item flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-secondary hover:bg-accent hover:text-primary transition-all duration-200 cursor-pointer justify-start',
  menuItemActive: 'bg-accent text-primary font-semibold shadow-md',
  menuIcon: 'menu-icon text-xl w-6 flex-shrink-0',
  menuLabel: 'menu-label text-sm md:text-base whitespace-nowrap overflow-hidden',
  
  // User Info (Expanded)
  userInfo: 'user-info p-4 border-t border-[var(--mvx-border-color-secondary)] space-y-3',
  
  userPoints: 'user-points flex items-center gap-2 bg-[var(--galactic-gold)] bg-opacity-10 rounded-lg p-3',
  pointsIcon: 'points-icon text-xl',
  pointsValue: 'points-value text-xl font-bold text-[var(--galactic-gold)]',
  pointsLabel: 'points-label text-xs text-secondary',
  
  userWallet: 'user-wallet flex items-center gap-2 bg-primary bg-opacity-5 rounded-lg p-2 justify-between',
  walletIcon: 'wallet-icon text-sm',
  walletAddress: 'wallet-address text-xs text-secondary font-mono flex-1 truncate',
  username: 'username text-sm font-medium text-primary flex-1 truncate',
  editButton: 'edit-button text-xs hover:scale-110 transition-transform cursor-pointer opacity-70 hover:opacity-100',
  
  // User Info (Collapsed)
  userInfoCollapsed: 'user-info-collapsed p-4 border-t border-[var(--mvx-border-color-secondary)] flex justify-center',
  collapsedPoints: 'collapsed-points text-2xl cursor-pointer hover:scale-110 transition-transform'
} satisfies Record<string, string>;

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { path: RouteNamesEnum.dashboard, label: 'nav.dashboard', icon: '🏠' },
  { path: '/predictions', label: 'nav.predictions', icon: '⚽' },
  { path: '/war-games', label: 'nav.warGames', icon: '⚔️' },
  { path: '/leaderboard', label: 'nav.leaderboards', icon: '🏆' },
  { path: '/streaks', label: 'nav.streaks', icon: '🔥' },
  { path: '/my-nfts', label: 'nav.myNFTs', icon: '🖼️' },
  { path: '/team-of-week', label: 'nav.teamOfWeek', icon: '⭐' },
  { path: '/admin', label: 'nav.admin', icon: '👑', adminOnly: true }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export const Sidebar = ({ isOpen, onClose, onCollapseChange }: SidebarProps) => {
  const navigate = useNavigate();
  const { address } = useGetAccount();
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showUsernameEditor, setShowUsernameEditor] = useState(false);
  const { userProfile, isAdmin, refreshProfile } = useUserRole();
  const { toasts, removeToast } = useToast();
  
  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const userRole = isAdmin ? 'admin' : 'user';
  const userPoints = userProfile?.total_points ?? 0;

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || userRole === 'admin'
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

  const handleEditUsername = () => {
    console.log('🖊️ [Sidebar] Click on edit username button');
    console.log('🖊️ [Sidebar] Current userProfile:', userProfile);
    console.log('🖊️ [Sidebar] showUsernameEditor BEFORE:', showUsernameEditor);
    setShowUsernameEditor(true);
    console.log('🖊️ [Sidebar] showUsernameEditor AFTER: true');
  };

  const handleUsernameSuccess = () => {
    console.log('✅ [Sidebar] Username updated successfully');
    console.log('🔄 [Sidebar] Refreshing user profile...');
    // Refresh the user profile to get the updated username
    refreshProfile();
  };

  const toggleCollapse = () => {
    // Only allow collapse on desktop
    if (!isMobile) {
      const newCollapsed = !isCollapsed;
      setIsCollapsed(newCollapsed);
      onCollapseChange?.(newCollapsed);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside 
        className={classNames(styles.sidebar, {
          [styles.sidebarOpen]: isOpen,
          [styles.sidebarDesktop]: !isMobile,
          [styles.sidebarCollapsed]: isCollapsed && !isMobile
        })}
        style={{
          width: isMobile ? '100%' : (isCollapsed ? '80px' : '256px')
        }}
      >
        {/* Logo & Buttons */}
        <div className={styles.logoContainer}>
          {/* Logo */}
          <div className="flex items-center flex-1">
            {(!isCollapsed || isMobile) && <Logo />}
            {isCollapsed && !isMobile && (
              <div className={styles.collapsedLogo}>G</div>
            )}
          </div>
          
          {/* Mobile: Close Button (X) */}
          {isMobile && (
            <button 
              className={styles.toggleButton}
              onClick={onClose}
              title={t('common.close')}
              type="button"
              aria-label={t('common.close')}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={styles.toggleIcon}
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
          
          {/* Desktop: Toggle Button (Arrow) */}
          {!isMobile && (
            <button 
              className={styles.toggleButton}
              onClick={toggleCollapse}
              title={isCollapsed ? 'Expand Menu' : 'Collapse Menu'}
              type="button"
              aria-label={isCollapsed ? 'Expand Menu' : 'Collapse Menu'}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={styles.toggleIcon}
                style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className={styles.nav}>
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                classNames(styles.menuItem, {
                  [styles.menuItemActive]: isActive
                })
              }
              onClick={() => handleMenuClick(item.path)}
              title={(isCollapsed && !isMobile) ? t(item.label) : ''}
            >
              <span className={styles.menuIcon}>{item.icon}</span>
              {(!isCollapsed || isMobile) && <span className={styles.menuLabel}>{t(item.label)}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        {(!isCollapsed || isMobile) && (
          <div className={styles.userInfo}>
            <div className={styles.userPoints}>
              <span className={styles.pointsIcon}>⭐</span>
              <span className={styles.pointsValue}>{userPoints.toLocaleString()}</span>
              <span className={styles.pointsLabel}>{t('common.points')}</span>
            </div>
            
            {address && (
              <div className={styles.userWallet}>
                <span className={styles.walletIcon}>
                  {userProfile?.username ? '👤' : '👛'}
                </span>
                <span className={userProfile?.username ? styles.username : styles.walletAddress}>
                  {userProfile?.username ? `@${userProfile.username}` : formatAddress(address)}
                </span>
                <button
                  onClick={handleEditUsername}
                  className={styles.editButton}
                  title={t('username.edit')}
                  type="button"
                  aria-label={t('username.edit')}
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* User Info (Collapsed - Desktop only) */}
        {isCollapsed && !isMobile && (
          <div className={styles.userInfoCollapsed}>
            <div className={styles.collapsedPoints} title={`${userPoints} points`}>
              ⭐
            </div>
          </div>
        )}
      </aside>

      {/* Username Editor Modal */}
      {showUsernameEditor && userProfile && (
        <UsernameEditor
          userId={userProfile.id}
          currentUsername={userProfile.username}
          onClose={() => {
            console.log('❌ [Sidebar] Closing username editor');
            setShowUsernameEditor(false);
          }}
          onSuccess={handleUsernameSuccess}
        />
      )}

      {/* Toast Container for Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

