// src/App.tsx
// --- KEY UPDATE: Wraps the application in AuthInitializer.

import { BrowserRouter, Routes, Route } from "react-router-dom";
// ... other imports like Toaster, ThemeProvider, etc.
import Index from "./pages/Index";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import { DashboardLayout } from "./components/DashboardLayout"; 
import ProtectedRoute from './components/ProtectedRoute';
import { AuthInitializer } from './components/AuthInitializer';
import { ROLES } from './constants/roles';

// Assume providers like ThemeProvider, QueryClientProvider etc. are here
function App() {
  return (
    <AuthInitializer>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes Layout */}
        
            <Route element={<ProtectedRoute allowedRoles={[ROLES.VIEWER, ROLES.EDITOR, ROLES.ADMIN, ROLES.SUPER_ADMIN]} />}>
              <Route path="/dashboard" element={<Index />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={[ROLES.EDITOR, ROLES.ADMIN, ROLES.SUPER_ADMIN]} />}>
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/customers" element={<Customers />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} />}>
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
         
          
          {/* Catch-all Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthInitializer>
  );
}

export default App;