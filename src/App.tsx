import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { PageNotFound } from 'pages/PageNotFound/PageNotFound';
import { routes } from 'routes';
import { AdminGuard, AxiosInterceptors, BatchTransactionsContextProvider } from 'wrappers';
import { AuthProvider } from 'contexts';

import { Layout, LayoutWithSidebar } from './components';

const AppContent = () => {
  return (
    <Routes>
      {routes.map((route) => {
        const LayoutComponent = route.authenticatedRoute ? LayoutWithSidebar : Layout;
        
        // Wrap admin routes with AdminGuard
        const PageComponent = route.adminRoute ? (
          <AdminGuard>
            <route.component />
          </AdminGuard>
        ) : (
          <route.component />
        );
        
        return (
          <Route
            key={`route-key-${route.path}`}
            path={route.path}
            element={
              <LayoutComponent>
                {PageComponent}
              </LayoutComponent>
            }
          >
            {route.children?.map((child) => (
              <Route
                key={`route-key-${route.path}-${child.path}`}
                path={child.path}
                element={<child.component />}
              />
            ))}
          </Route>
        );
      })}
      <Route path='*' element={<PageNotFound />} />
    </Routes>
  );
};

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AxiosInterceptors>
          <BatchTransactionsContextProvider>
            <AppContent />
          </BatchTransactionsContextProvider>
        </AxiosInterceptors>
      </AuthProvider>
    </Router>
  );
};
