import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { ProfileMenu } from "./ProfileMenu";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto">
          <div className="border-b bg-card w-full">
            <div className=" mx-auto px-6 lg:px-8 h-16 flex items-center justify-between bg">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 w-full md:w-[200px] lg:w-[300px]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <ProfileMenu />
              </div>
            </div>
          </div>
          <div className="container mx-auto p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
