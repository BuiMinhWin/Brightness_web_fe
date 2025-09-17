import React from 'react';
import './Navbar.css';

interface NavbarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage = 'home', onNavigate }) => {
  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <div className="navbar-logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="2"/>
              <circle cx="16" cy="16" r="8" stroke="white" strokeWidth="2"/>
              <circle cx="16" cy="16" r="3" fill="white"/>
            </svg>
          </div>
          <span className="navbar-logo-text">BRIGHTNEST</span>
        </div>

        {/* Navigation Links */}
        <div className="navbar-nav">
          <button 
            className={`navbar-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigation('home')}
          >
            Home
          </button>
          <button 
            className={`navbar-link ${currentPage === 'blogs' ? 'active' : ''}`}
            onClick={() => handleNavigation('blogs')}
          >
            Blogs
          </button>
          <button 
            className={`navbar-link ${currentPage === 'gamification' ? 'active' : ''}`}
            onClick={() => handleNavigation('gamification')}
          >
            Gamification
          </button>
          <button 
            className={`navbar-link ${currentPage === 'first-aid' ? 'active' : ''}`}
            onClick={() => handleNavigation('first-aid')}
          >
            First aid
          </button>
          <button 
            className={`navbar-link ${currentPage === 'about' ? 'active' : ''}`}
            onClick={() => handleNavigation('about')}
          >
            About
          </button>
        </div>

        {/* Right side icons */}
        <div className="navbar-actions">
          <button className="navbar-icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21A2 2 0 0 1 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="navbar-icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;