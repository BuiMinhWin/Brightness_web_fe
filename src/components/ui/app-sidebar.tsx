import * as React from "react";
import { useLocation, Link } from "react-router-dom";
import { BarChart3, Users, FileText, Calendar, Settings, LogOut } from "lucide-react";

import { SearchForm } from "@/components/ui/search-form";
import { VersionSwitcher } from "@/components/ui/version-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Summary Stats",
      url: "/admin/summary-stats",
      icon: BarChart3,
    },
    {
      title: "User Controls",
      url: "/admin/user-controls",
      icon: Users,
    },
    {
      title: "Post Management",
      url: "/admin/post-management",
      icon: FileText,
    },
    {
      title: "Event Management",
      url: "/admin/event-management",
      icon: Calendar,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  // Create navigation items with active state
  const navItems = data.navMain.map((item) => ({
    ...item,
    isActive: location.pathname === item.url,
  }));

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-center p-2">
          <img src="/assets/logo_wText.svg" alt="BRIGHTNEST" className="h-12 w-32" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <Link to={item.url}>
                        <Icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin/settings">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin/logout">
                <LogOut className="h-4 w-4" />
                Logout
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
