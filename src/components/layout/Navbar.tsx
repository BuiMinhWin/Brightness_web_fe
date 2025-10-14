import React, { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import logo from "/assets/LogoWhite.png";
import { NavLink, useNavigate } from "react-router-dom";
import { User, LogOut, Settings, Bell } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUserInfo, selectIsAuthenticated, selectUserId, logoutUser, fetchUserInfo } from "@/store/slices/authSlice";

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
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user info if authenticated but userInfo is missing
  useEffect(() => {
    if (isAuthenticated && userId && !userInfo) {
      console.log("🔄 User is authenticated but userInfo is missing. Fetching...");
      // Add a small delay to ensure Redux Persist has fully rehydrated
      const timer = setTimeout(() => {
        dispatch(fetchUserInfo(userId));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, userId, userInfo, dispatch]);

  // Handle dropdown click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    debugger;
    try {
      await dispatch(logoutUser()).unwrap();
      setIsDropdownOpen(false);
      
      // Purge persisted state
      const { persistor } = await import('@/store/store');
      await persistor.purge();
      
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to auth even if logout fails
      setIsDropdownOpen(false);
      navigate('/auth');
    }
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
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
          <NavLink to="/home" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
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
            <div className="relative" ref={dropdownRef}>
              <button
                className="user-profile-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {userInfo.profilePicture ? (
                  <img
                    src={userInfo.profilePicture}
                    alt={userInfo.fullName || userInfo.userName}
                    className="user-avatar"
                  />
                ) : (
                  <div className="user-avatar-placeholder">
                    <User size={16} />
                  </div>
                )}
                <span className="user-name">{userInfo.fullName || userInfo.userName}</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="user-dropdown">
                  <button
                    className="dropdown-item"
                    onClick={handleProfileClick}
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </button>
                  
                  <button
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="login-btn"
              onClick={() => navigate('/auth')}
            >
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
