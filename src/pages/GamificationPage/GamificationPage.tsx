import React, { useState } from "react";
import Navbar from "../../components/layout/Navbar";
import "./GamificationPage.css";
import GameFooter from "../../components/layout/GameFooter";
import { useNavigate } from "react-router-dom";

interface GamificationPageProps {
  onNavigate: (page: string) => void;
  onViewEventDetail?: (eventId: number) => void;
}

const GamificationPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const competitions = [
    {
      id: 1,
      title: "Body Burn Challenge",
      subtitle: "Total Body Strength Tournament",
      status: "Ongoing",
      timeRemaining: "3 days remaining",
      participants: "547 participants",
      prize: "$500 prize pool",
      avatar: "BB",
    },
    {
      id: 2,
      title: "Cardio Kings Cup",
      subtitle: "Endurance & HIIT Competition",
      status: "Upcoming",
      timeRemaining: "Starts in 5 days",
      participants: "234 registered",
      prize: "$250 prize pool",
      avatar: "CK",
    },
    {
      id: 3,
      title: "Flex & Flow Festival",
      subtitle: "Mobility + Yoga Balance Series",
      status: "Ongoing",
      timeRemaining: "1 days remaining",
      participants: "345 participants",
      prize: "$600 prize pool",
      avatar: "FF",
    },
    {
      id: 4,
      title: "FitRace Showdown",
      subtitle: "Weekly Steps & Speed Sprint",
      status: "Upcoming",
      timeRemaining: "Starts in 2 weeks",
      participants: "430 registered",
      prize: "$300 prize pool",
      avatar: "FR",
    },
    {
      id: 5,
      title: "PowerCore Clash",
      subtitle: "Core Strength & Stability Challenge",
      status: "Finished",
      timeRemaining: "Ended 2 days ago",
      participants: "567 participants",
      prize: "$600 prize pool",
      avatar: "PC",
    },
    {
      id: 6,
      title: "FitRace Showdown",
      subtitle: "Weekly Steps & Speed Sprint",
      status: "Upcoming",
      timeRemaining: "Starts in 3 weeks",
      participants: "455 registered",
      prize: "$400 prize pool",
      avatar: "FR",
    },
  ];

  const filteredCompetitions = competitions.filter((comp) => {
    if (activeFilter === "all") return true;
    return comp.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ongoing":
        return "#10b981";
      case "upcoming":
        return "#f59e0b";
      case "finished":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status.toLowerCase()) {
      case "ongoing":
        return "#dcfce7";
      case "upcoming":
        return "#fef3c7";
      case "finished":
        return "#f3f4f6";
      default:
        return "#f3f4f6";
    }
  };

  const handleViewDetails = (eventId: number) => {
    navigate(`/event-detail/${eventId}`);
  };

  const handleYoursClick = () => {
    navigate("/your-missions");
  };

  return (
    <div className="gamification-page">
      <Navbar currentPage="gamification" />

      <div className="gamification-content">
        {/* Hero Section */}
        <div className="gamification-hero">
          <h1 className="gamification-title">Mission: Fit-possible</h1>
          <p className="gamification-subtitle">Discover and join exciting gaming competitions</p>
        </div>

        {/* Filter Buttons */}
        <div className="gamification-filters">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All Events
            </button>
            <button
              className={`filter-btn ${activeFilter === "ongoing" ? "active" : ""}`}
              onClick={() => setActiveFilter("ongoing")}
            >
              Ongoing
            </button>
            <button
              className={`filter-btn ${activeFilter === "upcoming" ? "active" : ""}`}
              onClick={() => setActiveFilter("upcoming")}
            >
              Upcoming
            </button>
            <button
              className={`filter-btn ${activeFilter === "finished" ? "active" : ""}`}
              onClick={() => setActiveFilter("finished")}
            >
              Finished
            </button>
          </div>

          <button className="yours-btn" onClick={handleYoursClick}>
            Yours
          </button>
        </div>

        {/* Competition Cards Grid */}
        <div className="competitions-grid">
          {filteredCompetitions.map((comp) => (
            <div key={comp.id} className="competition-card">
              <div className="card-header">
                <div className="competition-avatar">
                  <span>{comp.avatar}</span>
                </div>
                <div
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusBg(comp.status),
                    color: getStatusColor(comp.status),
                  }}
                >
                  {comp.status}
                </div>
              </div>

              <div className="card-content">
                <h3 className="competition-title">{comp.title}</h3>
                <p className="competition-subtitle">{comp.subtitle}</p>

                <div className="competition-details">
                  <div className="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="2" />
                      <polyline points="12,6 12,12 16,14" stroke="#f59e0b" strokeWidth="2" />
                    </svg>
                    <span>{comp.timeRemaining}</span>
                  </div>

                  <div className="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M16 21V19A4 4 0 0 0 12 15H5A4 4 0 0 0 1 19V21"
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />
                      <circle cx="8.5" cy="7" r="4" stroke="#f59e0b" strokeWidth="2" />
                      <path d="M20 8V21L17 19L15 21V8" stroke="#f59e0b" strokeWidth="2" />
                    </svg>
                    <span>{comp.participants}</span>
                  </div>

                  <div className="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9L12 15L18 9" stroke="#f59e0b" strokeWidth="2" />
                    </svg>
                    <span>{comp.prize}</span>
                  </div>
                </div>
              </div>

              <button className="view-details-btn" onClick={() => handleViewDetails(comp.id)}>
                View Details
              </button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
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

export default GamificationPage;
