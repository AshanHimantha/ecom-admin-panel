import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Employees";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import ProtectedDashboardLayout from './components/ProtectedDashboardLayout';
import RoleBasedRoute from './components/RoleBasedRoute';
import { AuthInitializer } from './components/AuthInitializer';
import { ROLES } from './constants/ROLES';
import Users from "./pages/Users";
import { Toaster } from "@/components/ui/toaster";
import Categories from "./pages/Categories";
import CategoryTypes from "./pages/CategoryTypes";

function App() {
  return (
    <AuthInitializer>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes with Dashboard Layout */}
          <Route element={<ProtectedDashboardLayout />}>
            {/* Routes accessible to all authenticated users with basic roles */}
            <Route element={<RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.DATA_STEWARD]} />}>
              <Route path="/dashboard" element={<Index />} />
            </Route>
            
            {/* Routes for editors and above */}
            <Route element={<RoleBasedRoute allowedRoles={[ ROLES.SUPER_ADMIN, ROLES.DATA_STEWARD]} />}>
              <Route path="/products" element={<Products />} />
              <Route path="/products/categories" element={<Categories />} />
              <Route path="/products/category-types" element={<CategoryTypes />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/employees" element={<Customers />} />
            </Route>
            
            {/* Routes for admins only */}
            <Route element={<RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN]} />}>
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
          
          {/* Catch-all Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthInitializer>
  );
}

export default App;