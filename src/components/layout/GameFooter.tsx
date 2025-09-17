import React from "react";
import "./GameFooter.css";

const GameFooter: React.FC = () => {
  return (
    <footer className="gamification-footer">
      <div className="footer-content">
        <div className="footer-logo">
          <div className="footer-logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="2" />
              <circle cx="16" cy="16" r="8" stroke="white" strokeWidth="2" />
              <circle cx="16" cy="16" r="3" fill="white" />
            </svg>
          </div>
          <span className="footer-logo-text">BRIGHTNEST</span>
        </div>

        <div className="footer-contact">
          <h4>Contact us</h4>
          <div className="contact-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 16.92V19.92A2 2 0 0 1 20.02 21.92C8.91 21.92 0 13.01 0 1.92A2 2 0 0 1 2 -0.08H5A2 2 0 0 1 7 1.92"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>0xxxxxxxxxx</span>
          </div>
          <div className="contact-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <polyline
                points="22,6 12,13 2,6"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>Contact us:</span>
          </div>
          <div className="contact-item">
            <span>0xxxxxxxxxx</span>
          </div>
          <div className="contact-item">
            <span>Contact us:</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GameFooter;
