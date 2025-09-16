import React, { useState } from "react";
import LandingPage from "../pages/LandingPage";
import Homepage from "../pages/Homepage";
import FitnessProfile from "../pages/FitnessProfile";
import AboutPage from "../pages/AboutPage";
import Dashboard from "../pages/Dashboard";
import Connect from "../pages/Connect";
import Schedule from "../pages/Schedule";
import Profile from "../pages/Profile";

const Router: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'homepage' | 'fitness' | 'about' | 'dashboard' | 'connect' | 'schedule' | 'profile'>('landing');

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'homepage':
        return <Homepage />;
      case 'fitness':
        return <FitnessProfile />;
      case 'about':
        return <AboutPage />;
      case 'dashboard':
        return <Dashboard />;
      case 'connect':
        return <Connect />;
      case 'schedule':
        return <Schedule />;
      case 'profile':
        return <Profile />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div>
      {/* Simple navigation for demo purposes */}
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        zIndex: 1000, 
        background: 'rgba(0,0,0,0.8)', 
        padding: '10px', 
        borderRadius: '8px' 
      }}>
        <button 
          onClick={() => setCurrentPage('landing')}
          style={{ 
            marginRight: '10px', 
            padding: '8px 16px', 
            background: currentPage === 'landing' ? '#066555' : 'white',
            color: currentPage === 'landing' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Landing
        </button>
        <button 
          onClick={() => setCurrentPage('profile')}
          style={{ 
            marginLeft: '10px',
            padding: '8px 16px', 
            background: currentPage === 'profile' ? '#066555' : 'white',
            color: currentPage === 'profile' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Profile
        </button>
        <button 
          onClick={() => setCurrentPage('schedule')}
          style={{ 
            marginLeft: '10px',
            padding: '8px 16px', 
            background: currentPage === 'schedule' ? '#066555' : 'white',
            color: currentPage === 'schedule' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Schedule
        </button>
        <button 
          onClick={() => setCurrentPage('connect')}
          style={{ 
            marginLeft: '10px',
            padding: '8px 16px', 
            background: currentPage === 'connect' ? '#066555' : 'white',
            color: currentPage === 'connect' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Connect
        </button>
        <button 
          onClick={() => setCurrentPage('dashboard')}
          style={{ 
            marginLeft: '10px',
            padding: '8px 16px', 
            background: currentPage === 'dashboard' ? '#066555' : 'white',
            color: currentPage === 'dashboard' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setCurrentPage('about')}
          style={{ 
            marginLeft: '10px',
            padding: '8px 16px', 
            background: currentPage === 'about' ? '#066555' : 'white',
            color: currentPage === 'about' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          About
        </button>
        <button 
          onClick={() => setCurrentPage('homepage')}
          style={{ 
            padding: '8px 16px', 
            background: currentPage === 'homepage' ? '#066555' : 'white',
            color: currentPage === 'homepage' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Homepage
        </button>
        <button 
          onClick={() => setCurrentPage('fitness')}
          style={{ 
            marginLeft: '10px',
            padding: '8px 16px', 
            background: currentPage === 'fitness' ? '#066555' : 'white',
            color: currentPage === 'fitness' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Fitness
        </button>
      </div>
      
      {renderPage()}
    </div>
  );
};

export default Router;
