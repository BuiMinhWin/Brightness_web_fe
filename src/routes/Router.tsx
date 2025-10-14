// src/routes/Router.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ScrollProvider } from "../components/utils/ScrollProvider";
import { AnimatePresence } from "framer-motion";

// Layouts
import NavbarLayout from "@/layouts/NavbarLayout";
import MainLayout from "@/layouts/MainLayout";

// import all your pages
import LandingPage from "../pages/LandingPage/LandingPage";
import Homepage from "../pages/Homepage/Homepage";
import FitnessProfile from "../pages/FitnessProfile/FitnessProfile";
import AboutPage from "../pages/AboutPage/AboutPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import Connect from "../pages/Connect/Connect";
import Schedule from "../pages/Schedule/Schedule";
import Profile from "../pages/Profile/Profile";
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
import Goal from "@/pages/Goal/YourGoal";
import UserProfile from "@/pages/UserProfile/UserProfile";
import LoginAdmin from "@/pages/admin/LoginAdmin";
import AuthPage from "@/pages/AuthPage/AuthPage";
import PaymentSuccessPage from "@/pages/PaymentSuccess/PaymentSuccessPage";

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />

        {/* Pages with navbar */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Homepage />} />
          <Route path="/fitness" element={<FitnessProfile />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/gamification-feature" element={<GamificationPage />} />
          <Route path="/your-missions" element={<YourGamificationPage />} />
          <Route path="/your-detail/:missionId" element={<YourDetailPage />} />
          <Route path="/event-detail/:eventId" element={<EventDetailPage />} />
          <Route path="/leaderboard/:missionId" element={<LeaderboardPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/post-management" element={<ReviewPostPage />} />
          {/* <Route path="/event-management" element={<EventManagementPage/>} />  */}
          <Route path="/first-aid" element={<FirstAidPage />} />
          <Route path="/video/:id" element={<VideoPage />} />
        </Route>

        {/* Pages with persistent navbar and sidebar */}
        <Route element={<NavbarLayout />}>
          <Route path="/connect" element={<Connect />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/goal" element={<Goal />} />
        </Route>

        {/* Standalone pages */}
        <Route path="/edit-profile" element={<UserProfile />} />
        <Route path="/admin/*" element={<AdminMain />} />
        <Route path="/admin/login" element={<LoginAdmin />} />
        <Route path="/gamification-feature" element={<GamificationPage />} />
        <Route path="/your-missions" element={<YourGamificationPage />} />
        <Route path="/your-detail/:missionId" element={<YourDetailPage />} />
        <Route path="/event-detail/:eventId" element={<EventDetailPage />} />
        <Route path="/leaderboard/:missionId" element={<LeaderboardPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/post-management" element={<ReviewPostPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/signin" element={<Navigate to="/auth?mode=signin" replace />} />
        <Route path="/signup" element={<Navigate to="/auth?mode=signup" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollProvider>
        <AnimatedRoutes />
      </ScrollProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
