// src/components/ProtectedDashboardLayout.tsx
// Combines authentication check with dashboard layout

import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RootState } from '../store/store';
import { DashboardLayout } from './DashboardLayout';

const ProtectedDashboardLayout = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  console.log('🔐 ProtectedDashboardLayout check:', {
    path: location.pathname,
    isAuthenticated,
    timestamp: new Date().toISOString()
  });

  if (!isAuthenticated) {
    console.log('❌ User not authenticated, redirecting to login');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  console.log('✅ User authenticated, rendering DashboardLayout with Outlet');
  return <DashboardLayout />;
};

export default ProtectedDashboardLayout;
