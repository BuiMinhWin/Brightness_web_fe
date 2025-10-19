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
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectUserInfo,
  selectIsAuthenticated,
  selectUserId,
  logoutUser,
  fetchUserInfo,
} from "@/store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { resolveApiAssetUrl } from "@/utils/media";

export default function AdminSidebar() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get authenticated user info from Redux
  const userInfo = useAppSelector(selectUserInfo);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userId = useAppSelector(selectUserId);

  // Fetch user info if authenticated but userInfo is missing
  useEffect(() => {
    if (isAuthenticated && userId && !userInfo) {
      dispatch(fetchUserInfo(userId));
    }
  }, [isAuthenticated, userId, userInfo, dispatch]);

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

      // Purge persisted state
      const { persistor } = await import("@/store/store");
      await persistor.purge();

      navigate("/auth");
    } catch (error) {
      // Handle logout error silently or show user notification
    }
  };

  const userData = {
    name:
      userInfo?.fullName ||
      userInfo?.userName ||
      (isAuthenticated && userId ? "Loading..." : "Admin User"),
    email: userInfo?.email || (isAuthenticated && userId ? "Loading..." : "admin@brightnest.com"),
    avatar: resolveApiAssetUrl(userInfo?.profilePicture) || "https://github.com/shadcn.png",
    onLogout: handleLogout, // Pass logout handler to NavUser
    onProfile: () => navigate("/profile"), // Add profile handler
  };

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
            {isAuthenticated ? (
              <NavUser
                user={{
                  name: userData.name,
                  email: userData.email,
                  avatar: userData.avatar,
                  onLogout: userData.onLogout,
                }}
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </div>
            )}
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
