// import React, { useState } from "react";

// import SignInPage from "../pages/SignInPage";

// const Router: React.FC = () => {
//   const [currentPage, setCurrentPage] = useState<'landing' | 'homepage' | 'fitness' | 'signin'>('signin');

//   const renderPage = () => {
//     switch (currentPage) {
//       case 'signin':
//         return <SignInPage />;
//       default:
//         return <SignInPage />;
//     }
//   };

//   return (
//     <div>
//       {/* Simple navigation for demo purposes */}
      
//       {renderPage()}
//     </div>
//   );
// };

// export default Router;
import React, { useState } from "react";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";

const Router: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'homepage' | 'fitness' | 'signin' | 'signup'>('signin');

  const navigateToSignUp = () => {
    setCurrentPage('signup');
  };

  const navigateToSignIn = () => {
    setCurrentPage('signin');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'signin':
        return <SignInPage onNavigateToSignUp={navigateToSignUp} />;
      case 'signup':
        return <SignUpPage onNavigateToSignIn={navigateToSignIn} />;
      default:
        return <SignInPage onNavigateToSignUp={navigateToSignUp} />;
    }
  };

  return (
    <div>
      {/* Simple navigation for demo purposes */}
      {/* <div style={{ padding: '10px', background: '#f0f0f0', fontSize: '12px', color: '#666' }}>
        <button 
          onClick={() => setCurrentPage('signin')} 
          style={{ marginRight: '10px', padding: '5px 10px', fontSize: '12px' }}
        >
          Sign In
        </button>
        <button 
          onClick={() => setCurrentPage('signup')} 
          style={{ marginRight: '10px', padding: '5px 10px', fontSize: '12px' }}
        >
          Sign Up
        </button>
        <span>Current page: {currentPage}</span>
      </div> */}
      
      {renderPage()}
    </div>
  );
};

export default Router;