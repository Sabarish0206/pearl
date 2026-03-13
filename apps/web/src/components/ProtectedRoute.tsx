import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { AuthUser } from '@pearl/common';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AuthUser['role'][];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, currentUser } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
