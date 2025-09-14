import React, { useState } from "react";
import LandingPage from "../pages/LandingPage";
import Homepage from "../pages/Homepage";
import FitnessProfile from "../pages/FitnessProfile";

const Router: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'homepage' | 'fitness'>('landing');

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'homepage':
        return <Homepage />;
      case 'fitness':
        return <FitnessProfile />;
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
