import React, { useState, useEffect } from "react";
import "./YourGamificationPage.css";
import GameFooter from "../../components/layout/GameFooter";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUserId, selectIsAuthenticated } from "../../store/slices/authSlice";
import { ArrowLeft } from "lucide-react";
import { challengeService } from "../../services/challengeService";
import {
  Challenge,
  ChallengeParticipant,
  ChallengeTask,
  ChallengeTaskProgress,
} from "../../models/challenge";

interface ChallengeCard {
  id: string;
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
  const [challenges, setChallenges] = useState<ChallengeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get authenticated user ID from Redux
  const authenticatedUserId = useSelector(selectUserId);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const ITEMS_PER_PAGE = 4;

  console.log("🔐 Your Challenges - Auth State:", { isAuthenticated, authenticatedUserId });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("❌ User not authenticated, redirecting to login");
      navigate("/auth?mode=signin");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Don't fetch if not authenticated
    if (!isAuthenticated || !authenticatedUserId) {
      console.log("⚠️ Skipping fetch - user not authenticated");
      setLoading(false);
      return;
    }

    const fetchUserChallenges = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🆔 Fetching challenges for authenticated userId:", authenticatedUserId);

        // Get all participants
        const allParticipants = await challengeService.getAllChallengeParticipants();
        console.log("✅ All participants:", allParticipants);

        // Filter to get only current user's participations
        const userParticipants = allParticipants.filter(
          (p) => p.userId.toLowerCase() === authenticatedUserId.toLowerCase()
        );
        console.log("✅ User participants:", userParticipants);

        if (userParticipants.length === 0) {
          console.log("ℹ️ No challenges found for this user");
          setChallenges([]);
          setLoading(false);
          return;
        }

        // Fetch details for each challenge the user has joined
        const challengesPromises = userParticipants.map(async (participant) => {
          try {
            // Get challenge details
            const challenge = await challengeService.getChallenge(participant.challengeId);
            console.log(`✅ Challenge ${participant.challengeId}:`, challenge);

            // Get tasks for this challenge
            let tasks: ChallengeTask[] = [];
            try {
              tasks = await challengeService.getTasksByChallengeId(participant.challengeId);

              // Fallback if no tasks found
              if (!tasks || tasks.length === 0) {
                const allTasks = await challengeService.getAllChallengeTasks();
                tasks = allTasks.filter((t) => t.challengeId === participant.challengeId);
              }
            } catch (err) {
              console.warn("Failed to fetch tasks:", err);
              const allTasks = await challengeService.getAllChallengeTasks();
              tasks = allTasks.filter((t) => t.challengeId === participant.challengeId);
            }

            console.log(`✅ Tasks for challenge ${participant.challengeId}:`, tasks);

            // Get task progress for this participant
            let taskProgresses: ChallengeTaskProgress[] = [];
            try {
              taskProgresses = await challengeService.getProgressByParticipantId(participant.id);
            } catch (err) {
              console.warn("Failed to fetch task progress:", err);
              // If endpoint fails, try to get all progresses and filter
              try {
                const allProgresses = await challengeService.getAllChallengeTaskProgresses();
                taskProgresses = allProgresses.filter((p) => p.participantId === participant.id);
              } catch (fallbackErr) {
                console.error("Fallback also failed:", fallbackErr);
              }
            }

            console.log(`✅ Task progress for participant ${participant.id}:`, taskProgresses);

            // Count completed tasks
            const completedTasks = taskProgresses.filter(
              (tp) => tp.status?.toLowerCase() === "completed"
            ).length;

            const totalTasks = tasks.length;

            // Calculate overall progress
            const overallProgress =
              totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : participant.percentageCompleted || 0;

            // Determine status
            let status: "ongoing" | "completed" | "pending" = "ongoing";
            if (challenge.status.toLowerCase() === "finished" || overallProgress === 100) {
              status = "completed";
            } else if (challenge.status.toLowerCase() === "upcoming") {
              status = "pending";
            }

            // Get initials for avatar
            const avatar = challenge.title
              .split(" ")
              .map((word) => word[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();

            return {
              id: challenge.id,
              title: challenge.title,
              subtitle: challenge.taskSummary || challenge.category || "Challenge",
              status,
              tasksCompleted: completedTasks,
              totalTasks,
              overallProgress,
              avatar,
            };
          } catch (err) {
            console.error(`Error fetching challenge ${participant.challengeId}:`, err);
            return null;
          }
        });

        const challengesResults = await Promise.all(challengesPromises);
        const validChallenges = challengesResults.filter((c): c is ChallengeCard => c !== null);

        console.log("✅ Final challenges:", validChallenges);
        setChallenges(validChallenges);
      } catch (err) {
        console.error("❌ Error fetching user challenges:", err);
        setError("Failed to load your challenges. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserChallenges();
  }, [authenticatedUserId, isAuthenticated]);

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

  const handleViewDetails = (challengeId: string) => {
    console.log("🔍 Navigating to challenge:", challengeId);
    navigate(`/challenge-detail/${challengeId}`);
  };

  const handlePricingClick = () => {
    navigate("/pricing");
  };

  // Pagination calculations
  const totalPages = Math.ceil(challenges.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentChallenges = challenges.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="your-missions-page">
        <div className="your-missions-content">
          <div className="your-missions-hero">
            <div className="hero-header">
              <button className="back-button" onClick={() => navigate("/gamification-feature")}>
                <ArrowLeft size={24} />
              </button>
              <h1 className="your-missions-title">Your Challenges</h1>
              <button className="pricing-button" onClick={handlePricingClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 1L15.09 8.26L22 9L17 14.74L18.18 22L12 18.27L5.82 22L7 14.74L2 9L8.91 8.26L12 1Z"
                    fill="currentColor"
                  />
                </svg>
                Upgrade to Premium
              </button>
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            Loading your challenges...
          </div>
        </div>
        <GameFooter />
      </div>
    );
  }

  return (
    <div className="your-missions-page">
      <div className="your-missions-content">
        {/* Hero Section */}
        <div className="your-missions-hero">
          <div className="hero-header">
            <button className="back-button" onClick={() => navigate("/gamification-feature")}>
              <ArrowLeft size={24} />
            </button>
            <h1 className="your-missions-title">Your Challenges</h1>
            <button className="pricing-button" onClick={handlePricingClick}>
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

        {/* Error State */}
        {error && (
          <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>{error}</div>
        )}

        {/* Empty State */}
        {!error && challenges.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
            <h2 style={{ color: "#1f2937", marginBottom: "8px" }}>No Challenges Yet</h2>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              Join a challenge to start your fitness journey!
            </p>
            <button
              onClick={() => navigate("/gamification-feature")}
              style={{
                backgroundColor: "#10b981",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              Browse Challenges
            </button>
          </div>
        )}

        {/* Challenge Cards */}
        {!error && challenges.length > 0 && (
          <div className="missions-grid">
            {currentChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="mission-card"
                onClick={() => handleViewDetails(challenge.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="mission-header">
                  <div className="mission-info">
                    <div className="mission-avatar">
                      <span>{challenge.avatar}</span>
                    </div>
                    <div className="mission-details">
                      <h3>{challenge.title}</h3>
                      <p>{challenge.subtitle}</p>
                    </div>
                  </div>

                  <div className="mission-status">
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
                </div>

                <div className="mission-progress">
                  <div className="progress-header">
                    <h4 className="progress-title">Challenge Progress</h4>
                    <div className="progress-stats">
                      <div className="tasks-completed">
                        <span className="task-count">
                          {challenge.tasksCompleted}/{challenge.totalTasks}
                        </span>
                        <span className="task-label">Tasks Completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${challenge.overallProgress}%` }}
                    ></div>
                  </div>

                  <div className="progress-percentage">
                    <span className="overall-progress">Overall Progress</span>
                    <span style={{ marginLeft: "8px", fontWeight: "600", color: "#047857" }}>
                      {challenge.overallProgress}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination - Only show if there are more than 4 challenges */}
        {challenges.length > ITEMS_PER_PAGE && (
          <div className="your-missions-pagination">
            <button
              className="pagination-btn prev"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{
                opacity: currentPage === 1 ? 0.5 : 1,
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>

            <div className="pagination-numbers">
              {getPageNumbers().map((page, index) =>
                typeof page === "number" ? (
                  <button
                    key={index}
                    className={`pagination-number ${currentPage === page ? "active" : ""}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={index} className="pagination-dots">
                    {page}
                  </span>
                )
              )}
            </div>

            <button
              className="pagination-btn next"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{
                opacity: currentPage === totalPages ? 0.5 : 1,
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
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

export default YourGamificationPage;
