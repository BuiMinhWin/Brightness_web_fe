import React, { useEffect } from "react";
import "./Navbar.css";
import logo from "/assets/LogoWhite.png";
import { NavLink, useNavigate } from "react-router-dom";
import { User, Bell } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectUserInfo,
  selectIsAuthenticated,
  selectUserId,
  logoutUser,
  fetchUserInfo,
} from "@/store/slices/authSlice";
import { NavUser } from "@/components/ui/nav-user";

interface NavbarProps {
  currentPage?: string; // giữ lại nếu bạn muốn highlight
}

const Navbar: React.FC<NavbarProps> = ({ currentPage = "home" }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get user data from Redux
  const userInfo = useAppSelector(selectUserInfo);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userId = useAppSelector(selectUserId);

  // Fetch user info if authenticated but userInfo is missing
  useEffect(() => {
    if (isAuthenticated && userId && !userInfo) {
      dispatch(fetchUserInfo(userId));
    }
  }, [isAuthenticated, userId, userInfo, dispatch]);

  const handleLogout = async () => {
    debugger;
    try {
      await dispatch(logoutUser()).unwrap();

      // Purge persisted state
      const { persistor } = await import("@/store/store");
      await persistor.purge();

      navigate("/auth");
    } catch (error) {
      // Handle logout error silently
      navigate("/auth");
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

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
          <NavLink
            to="/home"
            className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
          >
            Home
          </NavLink>

          <NavLink
            to="/blogs"
            className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
          >
            Blogs
          </NavLink>

          <NavLink
            to="/gamification-feature"
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

        {/* User Profile */}
        <div className="navbar-actions">
          {/* Notification Icon */}
          {isAuthenticated && (
            <button className="navbar-icon-btn" title="Notifications">
              <Bell size={20} />
            </button>
          )}

          {isAuthenticated && userInfo ? (
            <NavUser
              variant="navbar"
              user={{
                name: userInfo.fullName || userInfo.userName || "User",
                email: userInfo.email || "user@brightnest.com",
                avatar: userInfo.profilePicture || "https://github.com/shadcn.png",
                onLogout: handleLogout,
                onProfile: handleProfileClick,
              }}
            />
          ) : (
            <button className="login-btn" onClick={() => navigate("/auth")}>
              <User size={16} />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
