
import React, { useState } from "react";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import GamificationPage from "../pages/GamificationPage";
import YourGamificationPage from "../pages/YourGamificationPage";
import YourDetailPage from "../pages/YourDetailPage";
import EventDetailPage from "../pages/EventDetailPage";
import LeaderboardPage from "../pages/LeaderboardPage";
import PricingPage from "../pages/PricingPage";

const Router: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'homepage' | 'fitness' | 'signin' | 'signup' | 'gamification' | 'your-missions' | 'your-detail' | 'event-detail' | 'leaderboard' | 'pricing'>('gamification');
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);

  const navigateToSignUp = () => {
    setCurrentPage('signup');
  };

  const navigateToSignIn = () => {
    setCurrentPage('signin');
  };

  const navigateToGamification = () => {
    setCurrentPage('gamification');
  };

  const navigateToYourMissions = () => {
    setCurrentPage('your-missions');
  };

  const navigateToYourDetail = (missionId: number) => {
    setSelectedMissionId(missionId);
    setCurrentPage('your-detail');
  };

  const navigateBackToYourMissions = () => {
    setCurrentPage('your-missions');
  };

  const navigateToEventDetail = (eventId: number) => {
    setSelectedEventId(eventId);
    setCurrentPage('event-detail');
  };

  const navigateToLeaderboard = (missionId: number) => {
    setSelectedMissionId(missionId);
    setCurrentPage('leaderboard');
  };

  const navigateBackToYourDetail = () => {
    setCurrentPage('your-detail');
  };

  const navigateToPricing = () => {
    setCurrentPage('pricing');
  };

  const navigateBackFromPricing = () => {
    setCurrentPage('your-missions');
  };

  const handleNavigate = (page: string) => {
    if (page === 'your-missions') {
      navigateToYourMissions();
    } else if (page === 'your-detail') {
      // This would be called with a mission ID in real implementation
      navigateToYourDetail(1);
    } else if (page === 'leaderboard') {
      navigateToLeaderboard(selectedMissionId || 1);
    } else if (page === 'pricing') {
      navigateToPricing();
    } else {
      setCurrentPage(page as 'landing' | 'homepage' | 'fitness' | 'signin' | 'signup' | 'gamification' | 'your-missions' | 'your-detail' | 'event-detail' | 'leaderboard' | 'pricing');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'signin':
        return <SignInPage onNavigateToSignUp={navigateToSignUp} />;
      case 'signup':
        return <SignUpPage onNavigateToSignIn={navigateToSignIn} />;
      case 'gamification':
        return <GamificationPage onNavigate={handleNavigate} onViewEventDetail={navigateToEventDetail} />;
      case 'your-missions':
        return <YourGamificationPage onNavigate={handleNavigate} onViewEventDetail={navigateToYourDetail} onNavigateBackToGame={navigateToGamification} />;
      case 'your-detail':
        return (
          <YourDetailPage 
            onNavigateBack={navigateBackToYourMissions}
            onNavigateToLeaderboard={() => navigateToLeaderboard(selectedMissionId || 1)}
            missionId={selectedMissionId || undefined}
          />
        );
      case 'event-detail':
        return (
          <EventDetailPage 
            onNavigateBack={navigateToGamification} 
            eventId={selectedEventId || undefined}
          />
        );
      case 'leaderboard':
        return (
          <LeaderboardPage 
            onNavigateBack={navigateBackToYourDetail}
            missionId={selectedMissionId || undefined}
          />
        );
      case 'pricing':
        return (
          <PricingPage 
            onNavigateBack={navigateBackFromPricing}
          />
        );
      default:
        return <SignInPage onNavigateToSignUp={navigateToSignUp} />;
    }
  };

  return (
    <div>
      {renderPage()}
    </div>
  );
};

export default Router;