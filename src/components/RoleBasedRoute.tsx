// src/components/RoleBasedRoute.tsx
// Checks roles only (assumes user is already authenticated)

import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RootState } from '../store/store';

interface RoleBasedRouteProps {
  allowedRoles: string[];
}

const RoleBasedRoute = ({ allowedRoles }: RoleBasedRouteProps) => {
  const { roles } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  const isAuthorized = roles.some(userRole => allowedRoles.includes(userRole));

  console.log('🔍 Role check for', location.pathname, {
    userRoles: roles,
    allowedRoles: allowedRoles,
    matches: roles.filter(userRole => allowedRoles.includes(userRole)),
    isAuthorized: isAuthorized
  });

  if (!isAuthorized) {
    console.log('⛔ User not authorized for', location.pathname);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('✅ User authorized for', location.pathname);
  return <Outlet />;
};

export default RoleBasedRoute;
