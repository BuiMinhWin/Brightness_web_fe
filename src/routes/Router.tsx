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
import Blogs from "../pages/Blogs/Blog";

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Section-deeplink routes mapping to the same LandingPage */}
          <Route path="/about-content" element={<LandingPage />} />
          <Route path="/services" element={<LandingPage />} />
          <Route path="/gamification" element={<LandingPage />} />
          <Route path="/chatbox" element={<LandingPage />} />
          <Route path="/cta" element={<LandingPage />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/fitness" element={<FitnessProfile />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ScrollProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
