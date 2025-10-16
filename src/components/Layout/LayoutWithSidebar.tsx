import { PropsWithChildren, useState, useEffect } from 'react';

import { Sidebar } from 'components/Sidebar';
import { Header } from 'components/Header';
import { AuthRedirectWrapper } from 'wrappers';

// prettier-ignore
const styles = {
  layoutContainer: 'layout-container flex min-h-screen bg-primary transition-all duration-200 ease-out',
  mainContainer: 'main-container flex-1 flex flex-col transition-all duration-300 pt-16 md:pt-0',
  headerContainer: 'header-container sticky top-0 z-30',
  contentContainer: 'content-container flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto',
  
  // Hamburger Button (Mobile only)
  hamburgerButton: 'hamburger-button fixed top-4 left-4 z-50 md:hidden flex flex-col items-center justify-center gap-1.5 w-12 h-12 bg-secondary text-primary rounded-xl shadow-lg hover:shadow-xl hover:bg-accent transition-all duration-300 ease-in-out hover:scale-105 border border-[var(--mvx-border-color-secondary)]',
  hamburgerLine: 'hamburger-line w-6 h-0.5 bg-primary rounded-full transition-all duration-300 ease-in-out',
  hamburgerLineTop: 'origin-center',
  hamburgerLineMiddle: 'origin-center',
  hamburgerLineBottom: 'origin-center',
  hamburgerOpen: 'rotate-45 translate-y-2',
  hamburgerOpenMiddle: 'opacity-0 scale-0',
  hamburgerOpenBottom: '-rotate-45 -translate-y-2'
} satisfies Record<string, string>;

export const LayoutWithSidebar = ({ children }: PropsWithChildren) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCollapseChange = (isCollapsed: boolean) => {
    setIsSidebarCollapsed(isCollapsed);
  };

  return (
    <div className={styles.layoutContainer}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onCollapseChange={handleCollapseChange}
      />
      
      {/* Hamburger Menu (Mobile) - Animated - Hidden when sidebar is open */}
      {!isSidebarOpen && (
        <button
          className={styles.hamburgerButton}
          onClick={toggleSidebar}
          aria-label="Open menu"
          aria-expanded={false}
        >
          <span className={`${styles.hamburgerLine} ${styles.hamburgerLineTop}`} />
          <span className={`${styles.hamburgerLine} ${styles.hamburgerLineMiddle}`} />
          <span className={`${styles.hamburgerLine} ${styles.hamburgerLineBottom}`} />
        </button>
      )}

      <div 
        className={styles.mainContainer}
        style={{ 
          marginLeft: isDesktop ? (isSidebarCollapsed ? '80px' : '256px') : '0px' 
        }}
      >
        <div className={styles.headerContainer}>
          <Header />
        </div>
        
        <main className={styles.contentContainer}>
          <AuthRedirectWrapper>{children}</AuthRedirectWrapper>
        </main>
      </div>
    </div>
  );
};

