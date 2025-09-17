import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage/LandingPage";
import Homepage from "../pages/Homepage/Homepage";
import FitnessProfile from "../pages/FitnessProfile/FitnessProfile";
import AboutPage from "../pages/AboutPage/AboutPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import Connect from "../pages/Connect/Connect";
import Schedule from "../pages/Schedule/Schedule";
import Profile from "../pages/Profile/Profile";

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/fitness" element={<FitnessProfile />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
