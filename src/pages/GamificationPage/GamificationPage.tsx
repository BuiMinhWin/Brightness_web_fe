import React, { useState, useEffect } from "react";
import "./GamificationPage.css";
import GameFooter from "../../components/layout/GameFooter";
import { useNavigate } from "react-router-dom";
import { challengeService, Challenge, ChallengeParticipant } from "../../services/challengeService";

interface GamificationPageProps {
  onNavigate: (page: string) => void;
  onViewEventDetail?: (eventId: number) => void;
}

interface ChallengeWithRegistration extends Challenge {
  isRegistered: boolean;
}

const GamificationPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [challenges, setChallenges] = useState<ChallengeWithRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const ITEMS_PER_PAGE = 6;

  // Generate a valid Guid v4
  const generateGuid = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Get user ID from localStorage
  const getUserId = (): string => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (guidRegex.test(storedUserId)) {
        return storedUserId;
      }
    }
    
    const newUserId = generateGuid();
    localStorage.setItem('userId', newUserId);
    return newUserId;
  };

  // Fetch challenges from API
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all challenges
        const data = await challengeService.getAllChallenges();
        
        // Fetch all participants
        const allParticipants = await challengeService.getAllChallengeParticipants();
        
        // Get current user ID
        const userId = getUserId();
        
        // Check which challenges the user has registered for
        const challengesWithRegistration: ChallengeWithRegistration[] = data.map(challenge => {
          const isRegistered = allParticipants.some(
            p => p.challengeId === challenge.id && p.userId === userId
          );
          return {
            ...challenge,
            isRegistered
          };
        });
        
        // Sort: registered challenges at the bottom
        const sortedChallenges = challengesWithRegistration.sort((a, b) => {
          if (a.isRegistered === b.isRegistered) return 0;
          return a.isRegistered ? 1 : -1;
        });
        
        setChallenges(sortedChallenges);
      } catch (err) {
        console.error("Error fetching challenges:", err);
        setError("Failed to load challenges. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  // Filter challenges based on status
  const filteredChallenges = challenges.filter((challenge) => {
    if (activeFilter === "all") return true;
    return challenge.status.toLowerCase() === activeFilter.toLowerCase();
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredChallenges.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentChallenges = filteredChallenges.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Helper function to determine status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ongoing":
      case "active":
        return "#10b981";
      case "upcoming":
      case "scheduled":
        return "#f59e0b";
      case "finished":
      case "completed":
      case "ended":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status.toLowerCase()) {
      case "ongoing":
      case "active":
        return "#dcfce7";
      case "upcoming":
      case "scheduled":
        return "#fef3c7";
      case "finished":
      case "completed":
      case "ended":
        return "#f3f4f6";
      default:
        return "#f3f4f6";
    }
  };

  // Format date to show time remaining or start time
  const getTimeRemaining = (challenge: Challenge) => {
    const now = new Date();
    const startDate = challenge.startAt ? new Date(challenge.startAt) : null;
    const endDate = challenge.endAt ? new Date(challenge.endAt) : null;

    if (endDate && challenge.status.toLowerCase() === "ongoing") {
      const diff = endDate.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? `${days} days remaining` : "Ending soon";
    } else if (startDate && challenge.status.toLowerCase() === "upcoming") {
      const diff = startDate.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? `Starts in ${days} days` : "Starting soon";
    } else if (endDate && challenge.status.toLowerCase() === "finished") {
      const diff = now.getTime() - endDate.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return `Ended ${days} days ago`;
    }
    return "No date info";
  };

  // Get initials for avatar
  const getInitials = (title: string) => {
    return title
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleViewDetails = (challengeId: string) => {
    navigate(`/event-detail/${challengeId}`);
  };

  const handleYoursClick = () => {
    navigate("/your-challenges");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="gamification-page">
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
            Your Challenges
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            Loading challenges...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
            {error}
          </div>
        )}

        {/* Competition Cards Grid */}
        {!loading && !error && (
          <div className="competitions-grid">
            {currentChallenges.length === 0 ? (
              <div style={{ 
                gridColumn: "1 / -1", 
                textAlign: "center", 
                padding: "40px", 
                color: "#6b7280" 
              }}>
                No challenges found for this filter.
              </div>
            ) : (
              currentChallenges.map((challenge) => (
                <div 
                  key={challenge.id} 
                  className="competition-card"
                  style={{
                    opacity: challenge.isRegistered ? 0.9 : 1,
                    order: challenge.isRegistered ? 1 : 0
                  }}
                >
                  <div className="card-header">
                    <div className="competition-avatar">
                      <span>{getInitials(challenge.title)}</span>
                    </div>
                    <div
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusBg(challenge.status),
                        color: getStatusColor(challenge.status),
                      }}
                    >
                      {challenge.status}
                    </div>
                  </div>

                  <div className="card-content">
                    <h3 className="competition-title">{challenge.title}</h3>
                    <p className="competition-subtitle">
                      {challenge.description || challenge.taskSummary || "No description available"}
                    </p>

                    <div className="competition-details">
                      <div className="detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="2" />
                          <polyline points="12,6 12,12 16,14" stroke="#f59e0b" strokeWidth="2" />
                        </svg>
                        <span>{getTimeRemaining(challenge)}</span>
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
                        <span>
                          {challenge.maxParticipants
                            ? `Max ${challenge.maxParticipants} participants`
                            : "Unlimited participants"}
                        </span>
                      </div>

                      <div className="detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            fill="none"
                          />
                        </svg>
                        <span>
                          {challenge.prizePool
                            ? `$${challenge.prizePool} prize pool`
                            : "No prize pool"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {challenge.isRegistered ? (
                    <button
                      className="view-details-btn registered"
                      onClick={() => handleViewDetails(challenge.id)}
                      style={{
                        backgroundColor: "#f97316",
                        borderColor: "#f97316",
                      }}
                    >
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        style={{ marginRight: "6px" }}
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Registered
                    </button>
                  ) : (
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(challenge.id)}
                    >
                      View Details
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filteredChallenges.length > 0 && (
          <div className="pagination">
            <button 
              className="pagination-btn prev" 
              disabled={currentPage === 1}
              onClick={handlePrevPage}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>

            <div className="pagination-numbers">
              {getPageNumbers().map((page, index) => (
                page === "..." ? (
                  <span key={`dots-${index}`} className="pagination-dots">...</span>
                ) : (
                  <button
                    key={page}
                    className={`pagination-number ${currentPage === page ? "active" : ""}`}
                    onClick={() => handlePageChange(page as number)}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            <button 
              className="pagination-btn next"
              disabled={currentPage === totalPages}
              onClick={handleNextPage}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <GameFooter />
    </div>
  );
};

export default GamificationPage;