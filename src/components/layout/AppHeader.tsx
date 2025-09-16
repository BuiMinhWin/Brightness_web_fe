import React from "react";
import "./AppHeader.css";

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
        <button className="login-btn">Log in</button>
        <button className="signup-btn">Sign Up</button>
      </div>
    </header>
  );
};

export default AppHeader;

