// src/components/ProtectedRoute.tsx
// Works with the roles array from Redux state.

import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RootState } from '../store/store';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, roles } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Log user roles and authentication status for debugging
  console.log('🔐 ProtectedRoute Check:', {
    path: location.pathname,
    isAuthenticated,
    userRoles: roles,
    allowedRoles,
    timestamp: new Date().toISOString()
  });

  if (!isAuthenticated) {
    console.log('❌ User not authenticated, redirecting to login');
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  const isAuthorized = roles.some(userRole => allowedRoles.includes(userRole));

  console.log('🔍 Authorization check details:', {
    userRoles: roles,
    allowedRoles: allowedRoles,
    matches: roles.filter(userRole => allowedRoles.includes(userRole)),
    isAuthorized: isAuthorized
  });

  if (!isAuthorized) {
    console.log('⛔ User not authorized for this route. User roles:', roles, 'Required roles:', allowedRoles);
  } else {
    console.log('✅ User authorized for', location.pathname);
  }

  return isAuthorized ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;