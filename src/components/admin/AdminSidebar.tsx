import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/ui/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { NavUser } from "../ui/nav-user";

const data = {
  user: {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://github.com/shadcn.png",
  },
};

export default function AdminSidebar() {
  const location = useLocation();

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter((segment) => segment !== "");
    const breadcrumbs = [];

    // Always start with Admin
    breadcrumbs.push({
      label: "Admin",
      href: "/admin",
      isLast: pathSegments.length === 1,
    });

    // Add other segments
    let currentPath = "/admin";
    for (let i = 1; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`;
      const isLast = i === pathSegments.length - 1;

      // Convert path segment to readable label
      const label = pathSegments[i]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      breadcrumbs.push({
        label,
        href: currentPath,
        isLast,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

          {/* 70% Left Section */}
          <div className="flex-[0.7] flex items-center gap-4">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={index} className="flex items-center">
                    <BreadcrumbItem>
                      {breadcrumb.isLast ? (
                        <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={breadcrumb.href}>{breadcrumb.label}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!breadcrumb.isLast && <BreadcrumbSeparator />}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* 30% Right Section */}
          <div className="flex-[0.3] flex items-center justify-end">
            <NavUser user={data.user} />
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
