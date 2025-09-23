import React from "react";
import "./AppFooter.css";

const AppFooter: React.FC = () => {
  return (
    <footer className="footer app-footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img
            className="footer-logo-image"
            src="https://api.builder.io/api/v1/image/assets/TEMP/de986a7279fe24b5c6a9695fbf1915b1da6131e9?width=162"
            alt="BRIGHTNEST Logo"
          />
          <div className="footer-brand">BRIGHTNEST</div>
        </div>
        <div className="footer-contact">
          <h4 className="footer-contact-title">Contact us</h4>
          <div className="footer-contact-item">
            <div className="contact-icon">📞</div>
            <span className="footer-contact-text">0xxxxxxxxxx</span>
          </div>
          <div className="footer-contact-item">
            <div className="contact-icon">✉️</div>
            <span className="footer-contact-text">Contact us:</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
