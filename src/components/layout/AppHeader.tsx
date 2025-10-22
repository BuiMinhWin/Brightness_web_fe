import React from "react";
import { useNavigate } from "react-router-dom";
import "./AppHeader.css";

const AppHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="app-header fixed top-0 left-0 right-0 z-50  px-6 py-2 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center gap-2 ml-[50px]">
        <img
          className="w-10 h-10"
          src="/assets/LogoWhite.png"
          alt="BRIGHTNEST Logo"
        />
        <div className="text-sm font-bold">
          <span className="text-white">BRIGHT</span>
          <span className="text-white">NEST</span>
        </div>
      </div>

      {/* Auth buttons
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/signin")}
          className="px-4 py-1 text-sm font-semibold text-[#0b3d33] border border-[#0b3d33] rounded-full hover:bg-[#0b3d33] hover:text-white transition"
        >
          Log In
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="px-4 py-1 text-sm font-bold text-white rounded-full bg-gradient-to-r from-[#066555] to-[#0a8d6c] shadow-md hover:opacity-90 transition"
        >
          Sign Up
        </button>
      </div> */}

      {/* Auth buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/auth?mode=signin")}
          className="px-4 py-1 text-sm font-semibold text-[#0b3d33] border border-[#0b3d33] rounded-full hover:bg-[#0b3d33] hover:text-white transition"
        >
          Log In
        </button>
        <button
          onClick={() => navigate("/auth?mode=signup")}
          className="px-4 py-1 text-sm font-bold text-white rounded-full bg-gradient-to-r from-[#066555] to-[#0a8d6c] shadow-md hover:opacity-90 transition"
        >
          Sign Up
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
