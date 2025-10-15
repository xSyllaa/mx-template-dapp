// prettier-ignore
const styles = {
  // Overlay (mobile)
  overlay: 'fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden',
  
  // Sidebar
  sidebar: 'fixed top-0 left-0 h-full w-64 bg-secondary border-r border-[var(--mvx-border-color-secondary)] z-50 transform -translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col',
  sidebarOpen: 'translate-x-0',
  
  // Logo
  logoContainer: 'logo-container flex items-center justify-between p-6 border-b border-[var(--mvx-border-color-secondary)]',
  closeButton: 'close-button md:hidden text-2xl text-primary hover:text-accent transition-colors',
  
  // Navigation
  nav: 'nav flex-1 overflow-y-auto py-4 px-3',
  
  menuItem: 'menu-item flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-secondary hover:bg-accent hover:text-primary transition-all duration-200 cursor-pointer',
  menuItemActive: 'bg-accent text-primary font-semibold shadow-md',
  menuIcon: 'menu-icon text-xl w-6 flex-shrink-0',
  menuLabel: 'menu-label text-sm md:text-base',
  
  // User Info
  userInfo: 'user-info p-4 border-t border-[var(--mvx-border-color-secondary)] space-y-3',
  
  userPoints: 'user-points flex items-center gap-2 bg-[var(--galactic-gold)] bg-opacity-10 rounded-lg p-3',
  pointsIcon: 'points-icon text-xl',
  pointsValue: 'points-value text-xl font-bold text-[var(--galactic-gold)]',
  pointsLabel: 'points-label text-xs text-secondary',
  
  userWallet: 'user-wallet flex items-center gap-2 bg-primary bg-opacity-5 rounded-lg p-2',
  walletIcon: 'wallet-icon text-sm',
  walletAddress: 'wallet-address text-xs text-secondary font-mono'
} satisfies Record<string, string>;

export default styles;

