import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./HomepageHeader.css";

const HomepageHeader: React.FC = () => {
  const { pathname } = useLocation();
  const isActive = (path: string) => pathname === path;

  return (
    <header className="homepage-header">
      <div className="mx-auto max-w-[1200px] px-6 py-6 flex items-center justify-between text-white">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/de986a7279fe24b5c6a9695fbf1915b1da6131e9?width=162"
            alt="BRIGHTNEST logo"
            className="w-10 h-10"
          />
          <div className="brand-text text-xl tracking-wider">BRIGHTNEST</div>
        </div>

        {/* Nav and Actions grouped on the right */}
        <div className="flex items-center gap-8">
          {/* Nav */}
          <nav className="nav flex items-center text-white/90">
            <Link to="/home" className={`nav-link ${isActive("/home") ? "active" : ""}`}>
              Home
            </Link>
            <Link to="/blogs" className={`nav-link ${isActive("/blogs") ? "active" : ""}`}>
              Blogs
            </Link>
            <Link
              to="/gamification"
              className={`nav-link ${isActive("/gamification") ? "active" : ""}`}
            >
              Gamification
            </Link>
            <Link to="/first-aid" className={`nav-link ${isActive("/first-aid") ? "active" : ""}`}>
              First aid
            </Link>
            <Link to="/about" className={`nav-link ${isActive("/about") ? "active" : ""}`}>
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-5">
            {/* Bell icon */}
            <svg
              className="action-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* User icon */}
            <svg
              className="action-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HomepageHeader;
