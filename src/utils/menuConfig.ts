// src/config/menuConfig.ts

import { LayoutDashboard, Package, ShoppingCart, Users, Settings, BarChart3 } from "lucide-react";
import { ROLES } from "@/constants/roles";

// Define the structure of a menu item
export interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles?: string[]; // Roles that can see this link
  subItems?: MenuItem[];
}

// Define the menu configuration
export const menuConfig: MenuItem[] = [
  { 
    title: "Overview", 
    url: "/dashboard", // Changed from "/" to match our routing
    icon: LayoutDashboard,
    roles: [ROLES.DATA_STEWARD, ROLES.SUPPLIER, ROLES.SUPER_ADMIN], // Everyone can see
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
    roles: [ROLES.DATA_STEWARD, ROLES.SUPPLIER, ROLES.SUPER_ADMIN], // Only editors and above
    subItems: [
      { title: "All Products", url: "/products", icon: Package },
      { title: "Categories", url: "/products/categories", icon: Package , roles: [ROLES.DATA_STEWARD, ROLES.SUPPLIER, ROLES.SUPER_ADMIN]},
      // You can add more specific routes and roles here later
      // { title: "Categories", url: "/products/categories", icon: Package, roles: [ROLES.ADMIN] },
    ]
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart,
    roles: [ROLES.DATA_STEWARD, ROLES.SUPPLIER, ROLES.SUPER_ADMIN], // Only editors and above
    subItems: [
      { title: "All Orders", url: "/orders", icon: ShoppingCart },
    ]
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
    roles: [ROLES.DATA_STEWARD, ROLES.SUPPLIER, ROLES.SUPER_ADMIN], // Only editors and above
  },
  { 
    title: "Analytics", 
    url: "/analytics", 
    icon: BarChart3,
    roles: [ROLES.DATA_STEWARD, ROLES.SUPPLIER, ROLES.SUPER_ADMIN], // Only admins can see
  },
  { 
    title: "Settings", 
    url: "/settings", 
    icon: Settings,
    roles: [ROLES.DATA_STEWARD, ROLES.SUPPLIER, ROLES.SUPER_ADMIN], // Only admins can see
  },
];