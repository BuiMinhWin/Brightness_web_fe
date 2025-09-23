import React from "react";
import "./AppHeader.css";
import { Link } from "react-router-dom";

const AppHeader: React.FC = () => {
  return (
    <header className="header app-header">
      <div className="logo-container">
        <img
          className="logo-image"
          src="https://api.builder.io/api/v1/image/assets/TEMP/6baac292ed20ef5d5c64b4c24038dc8d93be59a6?width=170"
          alt="BRIGHTNEST Logo"
        />
        <div className="brand-text">
          <span className="brand-bright">BRIGHT</span>
          <span className="brand-nest">NEST</span>
        </div>
      </div>
      <div className="auth-buttons">
        <Link to="/signin" className="login-btn">
          Log In
        </Link>
        <Link to="/signup" className="signup-btn">
          Sign Up
        </Link>
      </div>
    </header>
  );
};

export default AppHeader;
