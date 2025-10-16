import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from 'hooks/useUserRole';
import { Loader } from 'components/Loader';
import { RouteNamesEnum } from 'localConstants';

export const AdminGuard = ({ children }: PropsWithChildren) => {
  const { isAdmin, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to={RouteNamesEnum.dashboard} replace />;
  }

  return <>{children}</>;
};

