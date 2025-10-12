import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import PageSidebar from "@/components/layout/PageSidebar";

const NavbarLayout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Navbar - takes only the space it needs */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      {/* Content Area with Sidebar and Page Content */}
      <div className="flex-1 overflow-hidden flex p-3 gap-3">
        {/* Sidebar - fixed width */}
        <div className="w-[200px] flex-shrink-0">
          <PageSidebar />
        </div>

        {/* Page Content - takes remaining space with padding and rounded corners */}
        <div className="flex-1 overflow-hidden rounded-3xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default NavbarLayout;
