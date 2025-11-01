import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FitnessCenter, Schedule, People, Person, Flag } from "@mui/icons-material";

const PageSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation items for sidebar
  const navItems = [
    // {
    //   title: "Connect",
    //   url: "/connect",
    //   icon: People,
    //   isActive: location.pathname === "/connect",
    // },
    {
      title: "Schedule",
      url: "/schedule",
      icon: Schedule,
      isActive: location.pathname === "/schedule",
    },
    {
      title: "Profile",
      url: "/profile",
      icon: Person,
      isActive: location.pathname === "/profile",
    },
    // {
    //   title: "Goal",
    //   url: "/goal",
    //   icon: Flag,
    //   isActive: location.pathname === "/goal",
    // },
  ];

  return (
    <aside
      className="rounded-3xl p-4 flex flex-col relative overflow-hidden h-full"
      style={{
        background: "linear-gradient(180deg, #8bd3b8 0%, #0a6a56 100%)",
      }}
    >
      {/* Logo/Brand */}
      <div className="mb-6 mt-2 flex justify-center">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <FitnessCenter style={{ color: "#0a6a56", fontSize: 24 }} />
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={() => navigate(item.url)}
              className="relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 bg-white hover:shadow-md"
              style={{
                color: "#0a6a56",
                boxShadow: item.isActive
                  ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                  : "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              {/* Orange Indicator - only show when active */}
              {item.isActive && (
                <div
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-r-full"
                  style={{ background: "#ff6b35" }}
                />
              )}

              {/* Icon - always visible */}
              <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
                <Icon fontSize="small" />
              </div>

              {/* Label - always visible */}
              <span className="text-sm font-medium whitespace-nowrap">{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="mt-auto mb-4 flex justify-center">
        <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
          <Person style={{ color: "white", fontSize: 20 }} />
        </div>
      </div>
    </aside>
  );
};

export default PageSidebar;
