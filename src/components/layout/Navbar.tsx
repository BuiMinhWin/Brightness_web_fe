import React from "react";
import "./Navbar.css";
import logo from "../../assets/images/LogoWhite.png";
import { NavLink, useNavigate } from "react-router-dom";

interface NavbarProps {
  currentPage?: string; // giữ lại nếu bạn muốn highlight
}

const Navbar: React.FC<NavbarProps> = ({ currentPage = "home" }) => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div
          className="navbar-logo"
          onClick={() => navigate("/")} // click logo về Home
          style={{ cursor: "pointer" }}
        >
          <div className="navbar-logo-icon" style={{ backgroundImage: `url(${logo})` }} />
          <span className="navbar-logo-text">BRIGHTNEST</span>
        </div>

        {/* Navigation Links */}
        <div className="navbar-nav">
          <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
            Home
          </NavLink>

          <NavLink
            to="/blogs"
            className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
          >
            Blogs
          </NavLink>

          <NavLink
            to="/gamification"
            className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
          >
            Gamification
          </NavLink>

          <NavLink
            to="/first-aid"
            className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
          >
            First aid
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
          >
            About
          </NavLink>
        </div>

        {/* Right side icons */}
        <div className="navbar-actions">
          <button className="navbar-icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21A2 2 0 0 1 10.27 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button className="navbar-icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
