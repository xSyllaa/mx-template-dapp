import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { PageNotFound } from 'pages/PageNotFound/PageNotFound';
import { routes } from 'routes';
import { AxiosInterceptors, BatchTransactionsContextProvider } from 'wrappers';

import { Layout, LayoutWithSidebar } from './components';

export const App = () => {
  return (
    <Router>
      <AxiosInterceptors>
        <BatchTransactionsContextProvider>
          <Routes>
            {routes.map((route) => {
              const LayoutComponent = route.authenticatedRoute ? LayoutWithSidebar : Layout;
              
              return (
                <Route
                  key={`route-key-${route.path}`}
                  path={route.path}
                  element={
                    <LayoutComponent>
                      <route.component />
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
        </BatchTransactionsContextProvider>
      </AxiosInterceptors>
    </Router>
  );
};
