

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

// Import các page
import SignInPage from "../pages/SignInPage/SignInPage";
import SignUpPage from "../pages/SignUpPage/SignUpPage";
import GamificationPage from "../pages/GamificationPage/GamificationPage";
import YourGamificationPage from "../pages/YourGamificationPage/YourGamificationPage";
import YourDetailPage from "../pages/YourDetailPage/YourDetailPage";
import EventDetailPage from "../pages/EventDetailPage/EventDetailPage";
import LeaderboardPage from "../pages/LeaderboardPage/LeaderboardPage";
import PricingPage from "../pages/PricingPage/PricingPage";
import ReviewPostPage from "../pages/AdminReviewPostPage/ReviewPostPage";
import EventManagementPage from "../pages/EventManagementPage/EventManagementPage";
// import EventManagementPage from "../pages/EventManagementPage/EventManagementPage";

const App: React.FC = () => {
  return (
    <Router>
      {/* Navbar luôn hiển thị */}
 

      {/* Khu vực đổi trang */}
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/gamification" element={<GamificationPage />} />
        <Route path="/your-missions" element={<YourGamificationPage />} />
        <Route path="/your-detail/:missionId" element={<YourDetailPage />} />
        <Route path="/event-detail/:eventId" element={<EventDetailPage />} />
        <Route path="/leaderboard/:missionId" element={<LeaderboardPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/review-posts" element={<ReviewPostPage />} />
        <Route path="/event-management" element={<EventManagementPage />} />
      </Routes>
    </Router>
  );
};

export default App;
