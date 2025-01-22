// src/components/common/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../../core/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  allowedUserTypes?: ('provider' | 'customer')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresAuth = true,
  allowedUserTypes = ['provider', 'customer']
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !allowedUserTypes.includes(user.userType)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;