import { PropsWithChildren, useState } from 'react';

import { Sidebar } from 'components/Sidebar';
import { Header } from 'components/Header';
import { AuthRedirectWrapper } from 'wrappers';

// prettier-ignore
const styles = {
  layoutContainer: 'layout-container flex min-h-screen bg-primary transition-all duration-200 ease-out',
  mainContainer: 'main-container flex-1 flex flex-col md:ml-64 transition-all duration-300',
  headerContainer: 'header-container sticky top-0 z-30',
  contentContainer: 'content-container flex-1 p-4 md:p-6 lg:p-8 overflow-auto',
  hamburgerButton: 'hamburger-button fixed top-4 left-4 z-50 md:hidden bg-secondary text-primary p-3 rounded-lg shadow-lg hover:bg-accent transition-all',
  hamburgerIcon: 'text-2xl'
} satisfies Record<string, string>;

export const LayoutWithSidebar = ({ children }: PropsWithChildren) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={styles.layoutContainer}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Hamburger Menu (Mobile) */}
      <button
        className={styles.hamburgerButton}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <span className={styles.hamburgerIcon}>☰</span>
      </button>

      <div className={styles.mainContainer}>
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

