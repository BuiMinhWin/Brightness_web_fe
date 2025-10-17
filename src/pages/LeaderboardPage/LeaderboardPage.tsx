import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUserId, selectIsAuthenticated } from "../../store/slices/authSlice";
import GameFooter from "../../components/layout/GameFooter";
import "./LeaderboardPage.css";
import { ArrowLeft, Flame } from "lucide-react";
import {
  challengeService,
  Challenge,
  LeaderboardEntry as APILeaderboardEntry,
} from "../../services/challengeService";

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  points: number;
  avatar: string;
  isCurrentUser?: boolean;
}

type TabType = "today" | "this-week" | "all-time";

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { missionId } = useParams<{ missionId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("all-time");
  
  // ✅ Get authenticated user ID from Redux
  const authenticatedUserId = useSelector(selectUserId);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  console.log("🔐 Leaderboard - Auth State:", { isAuthenticated, authenticatedUserId });
  
  // State for API data
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [allLeaderboardData, setAllLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [currentUserData, setCurrentUserData] = useState<LeaderboardEntry | null>(null);
  const [currentUserStreak, setCurrentUserStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate avatar URL
  const getAvatarUrl = (userName: string, userId: string): string => {
    const colors = ["4F46E5", "DC2626", "059669", "D97706", "7C3AED", "EC4899", "10B981"];
    const colorIndex = userId.charCodeAt(0) % colors.length;
    const initial = userName?.charAt(0).toUpperCase() || "U";
    return `https://ui-avatars.com/api/?name=${initial}&background=${colors[colorIndex]}&color=fff&size=80&bold=true`;
  };

  const handleBack = () => {
  if (window.history.length > 1) {
    navigate(-1); 
  } else {
    navigate("/"); // hoặc về trang chính của app
  }
};

  // Format user display name
  const formatUserName = (userId: string): string => {
    return `User ${userId.substring(0, 8)}`;
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, [missionId, activeTab, authenticatedUserId, isAuthenticated]);

  const fetchLeaderboardData = async () => {
    if (!missionId) {
      setError("No challenge ID provided");
      setLoading(false);
      return;
    }

    // ✅ Check authentication
    if (!isAuthenticated || !authenticatedUserId) {
      console.warn("⚠️ User not authenticated, redirecting to login");
      setError("Please log in to view the leaderboard");
      setLoading(false);
      navigate("/auth?mode=signin");
      return;
    }

    // Validate GUID format
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!guidRegex.test(missionId)) {
      console.error("❌ Invalid challengeId format:", missionId);
      setError("Invalid challenge ID format");
      setLoading(false);
      return;
    }

    if (!guidRegex.test(authenticatedUserId)) {
      console.error("❌ Invalid userId format:", authenticatedUserId);
      setError("Invalid user ID format. Please try logging in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching leaderboard for challenge:", missionId);
      console.log("🔍 Authenticated user ID:", authenticatedUserId);

      // 1. Fetch challenge details
      const challengeData = await challengeService.getChallenge(missionId);
      setChallenge(challengeData);
      console.log("✅ Challenge data:", challengeData);

      // 2. Fetch leaderboard from API
      let apiLeaderboard: APILeaderboardEntry[] = [];
      try {
        apiLeaderboard = await challengeService.getLeaderboard(missionId);
        console.log("✅ API Leaderboard response:", apiLeaderboard);
      } catch (err) {
        console.warn("⚠️ Failed to fetch leaderboard from API, falling back to participants:", err);
        
        // Fallback: Calculate from participants
        const participants = await challengeService.getParticipantsByChallengeId(missionId);
        apiLeaderboard = participants
          .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
          .map((participant, index) => ({
            userId: participant.userId,
            userName: formatUserName(participant.userId),
            totalPoints: participant.totalPoints || 0,
            rank: index + 1,
          }));
        console.log("✅ Fallback leaderboard from participants:", apiLeaderboard);
      }

      // 3. Transform API leaderboard to component format
      const transformedLeaderboard: LeaderboardEntry[] = apiLeaderboard.map((entry) => ({
        id: entry.userId,
        rank: entry.rank,
        name: entry.userName || formatUserName(entry.userId),
        points: entry.totalPoints,
        avatar: getAvatarUrl(entry.userName || formatUserName(entry.userId), entry.userId),
        isCurrentUser: entry.userId.toLowerCase() === authenticatedUserId.toLowerCase(),
      }));

      console.log("✅ Transformed leaderboard:", transformedLeaderboard);

      // 4. Find current user in leaderboard
      const currentUser = transformedLeaderboard.find((entry) => entry.isCurrentUser);

      if (currentUser) {
        console.log("✅ Found current user in leaderboard:", currentUser);
        setCurrentUserData(currentUser);
        
        // Keep ALL users in allLeaderboardData (không loại bỏ current user)
        setAllLeaderboardData(transformedLeaderboard);
        
        // Fetch current user's participant data for streak
        try {
          const allParticipants = await challengeService.getParticipantsByChallengeId(missionId);
          const userParticipant = allParticipants.find(
            (p) => p.userId.toLowerCase() === authenticatedUserId.toLowerCase()
          );
          
          if (userParticipant) {
            setCurrentUserStreak(userParticipant.currentStreak || 0);
            console.log("✅ Current user streak:", userParticipant.currentStreak);
          }
        } catch (err) {
          console.warn("⚠️ Failed to fetch user streak:", err);
        }
      } else {
        console.log("ℹ️ Current user not found in leaderboard");
        setAllLeaderboardData(transformedLeaderboard);
        setCurrentUserData(null);
        setCurrentUserStreak(0);
      }

    } catch (err) {
      console.error("❌ Error fetching leaderboard:", err);
      setError("Failed to load leaderboard. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="leaderboard-page">
        <div className="leaderboard-content">
          <div className="leaderboard-header">
            {/* <button onClick={() => navigate(`/challenge-detail/${challenge}`)} className="back-button">
              <ArrowLeft size={24} />
            </button> */}
            <button onClick={handleBack} className="back-button">
               <ArrowLeft size={24} />
            </button>

            <div className="header-info">
              <h1 className="challenge-title">Loading...</h1>
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            Loading leaderboard data...
          </div>
        </div>
        <GameFooter />
      </div>
    );
  }

  // Error state
  if (error || !challenge) {
    return (
      <div className="leaderboard-page">
        <div className="leaderboard-content">
          <div className="leaderboard-header">
            {/* <button onClick={() => navigate(`/challenge-detail/${challenge}`)} className="back-button">
              <ArrowLeft size={24} />
            </button> */}
            <button onClick={handleBack} className="back-button">
              <ArrowLeft size={24} />
            </button>

            <div className="header-info">
              <h1 className="challenge-title">Error</h1>
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
            {error || "Challenge not found"}
            {error && error.includes("log in") && (
              <div style={{ marginTop: "20px" }}>
                <button
                  onClick={() => navigate("/auth?mode=signin")}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        </div>
        <GameFooter />
      </div>
    );
  }

  // ✅ Split data: Top 3 và Rest (từ rank 4 trở đi)
  const topThree = allLeaderboardData.slice(0, 3);
  const restOfLeaderboard = allLeaderboardData.slice(3);

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-content">
        {/* Header */}
        <div className="leaderboard-header">
          {/* <button onClick={() => navigate(`/challenge-detail/${challenge}`)} className="back-button">
            <ArrowLeft size={24} />
          </button> */}
          <button onClick={handleBack} className="back-button">
            <ArrowLeft size={24} />
          </button>


          <div className="header-info">
            <h1 className="challenge-title">{challenge.title}</h1>
            <p className="challenge-meta">
              {challenge.taskSummary || "Challenge"} • {allLeaderboardData.length} Participants
            </p>
          </div>

          {currentUserData && currentUserStreak > 0 && (
            <div className="streak-badge">
              <Flame className="streak-icon" size={16} />
              {currentUserStreak} Day Streak
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="leaderboard-tabs">
          <button
            className={`tab-button ${activeTab === "today" ? "active" : ""}`}
            onClick={() => setActiveTab("today")}
          >
            Today
          </button>
          <button
            className={`tab-button ${activeTab === "this-week" ? "active" : ""}`}
            onClick={() => setActiveTab("this-week")}
          >
            This week
          </button>
          <button
            className={`tab-button ${activeTab === "all-time" ? "active" : ""}`}
            onClick={() => setActiveTab("all-time")}
          >
            All time
          </button>
        </div>

        {/* Main: Two Column Layout - GIỐNG DESIGN CŨ */}
        <div className="leaderboard-main">
          {/* Left Column: Top 3 Podium */}
          <div className="top-three-container">
            <h2 className="top-title">TOP 3</h2>
            <div className="podium">
              {/* Second Place */}
              {topThree[1] && (
                <div className="podium-place second">
                  <div className="podium-bar">
                    <div className="podium-avatar">
                      <img src={topThree[1].avatar} alt={topThree[1].name} />
                      <div className="podium-rank">2</div>
                    </div>
                    <div className="podium-name">{topThree[1].name}</div>
                    <div className="podium-points">• {topThree[1].points}</div>
                  </div>
                </div>
              )}

              {/* First Place */}
              {topThree[0] && (
                <div className="podium-place first">
                  <div className="podium-bar">
                    <div className="podium-avatar">
                      <img src={topThree[0].avatar} alt={topThree[0].name} />
                      <div className="podium-rank">1</div>
                    </div>
                    <div className="podium-name">{topThree[0].name}</div>
                    <div className="podium-points">• {topThree[0].points}</div>
                  </div>
                </div>
              )}

              {/* Third Place */}
              {topThree[2] && (
                <div className="podium-place third">
                  <div className="podium-bar">
                    <div className="podium-avatar">
                      <img src={topThree[2].avatar} alt={topThree[2].name} />
                      <div className="podium-rank">3</div>
                    </div>
                    <div className="podium-name">{topThree[2].name}</div>
                    <div className="podium-points">• {topThree[2].points}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Leaderboard List + Current User */}
          <div className="leaderboard-right">
            <div className="leaderboard-list">
              {restOfLeaderboard.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                  {allLeaderboardData.length <= 3 ? "Only top 3 participants" : "No other participants"}
                </div>
              ) : (
                restOfLeaderboard.map((entry) => (
                  <div key={entry.id} className="leaderboard-item">
                    <div className="rank-number">{String(entry.rank).padStart(2, "0")}</div>
                    <div className="user-avatar">
                      <img src={entry.avatar} alt={entry.name} />
                    </div>
                    <div className="user-info">
                      <span className="user-name">{entry.name}</span>
                      <span className="user-points">{entry.points} points</span>
                    </div>
                    <div className="status-indicator">
                      {entry.rank <= 5 ? (
                        <div className="status-dot blue"></div>
                      ) : (
                        <div className="status-dot red"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Current User Section - CHỈ HIỂN THỊ NẾU USER KHÔNG Ở TOP 3 */}
            {currentUserData && currentUserData.rank > 3 && (
              <div className="current-user-section">
                <div className="current-user-item">
                  <div className="rank-number">{String(currentUserData.rank).padStart(2, "0")}</div>
                  <div className="user-avatar current">
                    <img src={currentUserData.avatar} alt={currentUserData.name} />
                  </div>
                  <div className="user-info">
                    <span className="user-name current">You</span>
                    <span className="user-points">{currentUserData.points} points</span>
                  </div>
                  <div className="you-are-here">
                    <span>You are here!!</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="status-indicator">
                    <div className="status-dot pink"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <GameFooter />
    </div>
  );
};

export default LeaderboardPage;