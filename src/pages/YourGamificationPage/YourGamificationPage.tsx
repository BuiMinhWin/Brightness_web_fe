import React, { useState } from "react";
import Navbar from "../../components/layout/Navbar";
import "./YourGamificationPage.css";
import GameFooter from "../../components/layout/GameFooter";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface YourGamificationPageProps {
  onNavigate: (page: string) => void;
  onNavigateBackToGame: () => void;
  onViewEventDetail?: (eventId: number) => void;
}

interface Mission {
  id: number;
  title: string;
  subtitle: string;
  status: "ongoing" | "completed" | "pending";
  tasksCompleted: number;
  totalTasks: number;
  overallProgress: number;
  avatar: string;
}

const YourGamificationPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [missions] = useState<Mission[]>([
    {
      id: 1,
      title: "Body Burn Challenge",
      subtitle: "Total Body Strength Tournament",
      status: "ongoing",
      tasksCompleted: 18,
      totalTasks: 30,
      overallProgress: 60,
      avatar: "BB",
    },
    {
      id: 2,
      title: "Cardio Kings Cup",
      subtitle: "Endurance & HIIT Competition",
      status: "ongoing",
      tasksCompleted: 12,
      totalTasks: 25,
      overallProgress: 48,
      avatar: "CK",
    },
    {
      id: 3,
      title: "Flex & Flow Festival",
      subtitle: "Mobility + Yoga Balance Series",
      status: "completed",
      tasksCompleted: 20,
      totalTasks: 20,
      overallProgress: 100,
      avatar: "FF",
    },
    {
      id: 4,
      title: "PowerCore Clash",
      subtitle: "Core Strength & Stability Challenge",
      status: "ongoing",
      tasksCompleted: 8,
      totalTasks: 15,
      overallProgress: 53,
      avatar: "PC",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "#10b981";
      case "completed":
        return "#059669";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "ongoing":
        return "#dcfce7";
      case "completed":
        return "#d1fae5";
      case "pending":
        return "#fef3c7";
      default:
        return "#f3f4f6";
    }
  };

  const handleViewDetails = (missionId: number) => {
    navigate(`/your-detail/${missionId}`);
  };

  const handleYoursClick = () => {
    navigate("/pricing");
  };

  return (
    <div className="your-missions-page">
      <Navbar currentPage="gamification" />

      {/* Back button */}

      <div className="your-missions-content">
        {/* Hero Section */}
        <div className="your-missions-hero">
          <div className="hero-header">
            <button className="back-button" onClick={() => navigate("/gamification-feature")}>
              <ArrowLeft size={24} />
            </button>
            <h1 className="your-missions-title">Your Missions</h1>
            <button className="pricing-button" onClick={handleYoursClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 1L15.09 8.26L22 9L17 14.74L18.18 22L12 18.27L5.82 22L7 14.74L2 9L8.91 8.26L12 1Z"
                  fill="currentColor"
                />
              </svg>
              Upgrade to Premium
            </button>
          </div>
          <p className="your-missions-subtitle">Every battle is a chance to become unforgettable</p>
        </div>

        {/* Mission Cards */}
        <div className="missions-grid">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className="mission-card"
              onClick={() => handleViewDetails(mission.id)} // ✅ Add this line
              style={{ cursor: "pointer" }}
            >
              <div className="mission-header">
                <div className="mission-info">
                  <div className="mission-avatar">
                    <span>{mission.avatar}</span>
                  </div>
                  <div className="mission-details">
                    <h3>{mission.title}</h3>
                    <p>{mission.subtitle}</p>
                  </div>
                </div>

                <div className="mission-status">
                  <div
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusBg(mission.status),
                      color: getStatusColor(mission.status),
                    }}
                  >
                    {mission.status}
                  </div>
                </div>
              </div>

              <div className="mission-progress">
                <div className="progress-header">
                  <h4 className="progress-title">Challenge Progress</h4>
                  <div className="progress-stats">
                    <div className="tasks-completed">
                      <span className="task-count">
                        {mission.tasksCompleted}/{mission.totalTasks}
                      </span>
                      <span className="task-label">Tasks Completed</span>
                    </div>
                  </div>
                </div>

                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${mission.overallProgress}%` }}
                  ></div>
                </div>

                <div className="progress-percentage">
                  <span className="overall-progress">Overall Progress</span>
                  <span style={{ marginLeft: "8px", fontWeight: "600", color: "#047857" }}>
                    {mission.overallProgress}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="your-missions-pagination">
          <button className="pagination-btn prev" disabled>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>

          <div className="pagination-numbers">
            <button className="pagination-number active">1</button>
            <button className="pagination-number">2</button>
            <button className="pagination-number">3</button>
            <button className="pagination-number">4</button>
            <span className="pagination-dots">...</span>
          </div>

          <button className="pagination-btn next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer */}
      <GameFooter />
    </div>
  );
};

export default YourGamificationPage;
