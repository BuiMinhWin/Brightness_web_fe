// src/routes/Router.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScrollProvider } from "../components/utils/ScrollProvider";
import LandingPage from "../pages/LandingPage/LandingPage";
import Homepage from "../pages/Homepage/Homepage";
import FitnessProfile from "../pages/FitnessProfile/FitnessProfile";
import AboutPage from "../pages/AboutPage/AboutPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import Connect from "../pages/Connect/Connect";
import Schedule from "../pages/Schedule/Schedule";
import Profile from "../pages/Profile/Profile";
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
import Blogs from "../pages/Blogs/Blog";
import FirstAidPage from "@/pages/FirstAid/FirstAidPage";
import VideoPage from "@/pages/FirstAid/VideoPage";
import AdminMain from "@/pages/admin/AdminMain";

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Section-deeplink routes mapping to the same LandingPage */}
          <Route path="/home" element={<Homepage />} />
          <Route path="/fitness" element={<FitnessProfile />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/first-aid" element={<FirstAidPage />} />
          <Route path="/video/:id" element={<VideoPage />} />
          <Route path="/admin/*" element={<AdminMain />} />
          <Route path="*" element={<Navigate to="/" replace />} />
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
      </ScrollProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
