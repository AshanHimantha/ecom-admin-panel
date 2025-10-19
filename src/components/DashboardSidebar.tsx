// src/components/DashboardSidebar.tsx

import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useConfig } from "@/contexts/ConfigContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useDispatch, useSelector } from "react-redux";

// UI Components
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Redux and Config
import { AppDispatch, RootState } from "@/store/store";
import { logoutUser } from "@/store/slices/authSlice";
import { menuConfig, MenuItem } from "@/utils/menuConfig";// Import our new config

// Helper to get initials from a name or email
const getInitials = (name: string) => {
  if (!name) return "U";
  const parts = name.split(/[ @.]/);
  return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
};

export function DashboardSidebar() {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const config = useConfig();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Get user data from Redux
  const { roles: userRoles, userAttributes } = useSelector((state: RootState) => state.auth);

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // --- ROLE-BASED FILTERING LOGIC ---
  const canView = (item: MenuItem) => {
    if (!item.roles) return true; // If no roles are specified, everyone can see it
    return userRoles.some(userRole => item.roles?.includes(userRole));
  };
  
  const filteredMenuItems = menuConfig.filter(canView);

  const displayName = userAttributes?.name || userAttributes?.email || "User";
  const displayEmail = userAttributes?.email || "";
  const avatarFallback = getInitials(displayName);

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-6">
        <div className="flex items-center gap-3">
          <img src={theme === 'light' ? config.assets.logo.light : config.assets.logo.dark} alt="Logo" className="h-9 w-9" />
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">E-Commerce</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.subItems && item.subItems.filter(canView).length > 0 ? (
                    <>
                      <SidebarMenuButton onClick={() => toggleMenu(item.title)} className="hover:bg-accent/50">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${openMenus.includes(item.title) ? 'rotate-180' : ''}`} />
                      </SidebarMenuButton>
                      {openMenus.includes(item.title) && (
                        <SidebarMenuSub>
                          {item.subItems.filter(canView).map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <NavLink to={subItem.url} className={({ isActive }) => isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"}>
                                  <span>{subItem.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={({ isActive }) => isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center gap-3 hover:bg-accent/50 rounded-md p-2 cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAttributes?.picture} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" side="top">
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}