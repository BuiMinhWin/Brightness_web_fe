import React from "react";
import { useNavigate } from "react-router-dom";
import "./AppHeader.css";

const AppHeader: React.FC = () => {
  const navigate = useNavigate();

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
        <button className="login-btn" onClick={() => navigate("/signin")}>
          Log In
        </button>
        <button className="signup-btn" onClick={() => navigate("/signup")}>
          Sign Up
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
