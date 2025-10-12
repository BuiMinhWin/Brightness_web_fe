import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
