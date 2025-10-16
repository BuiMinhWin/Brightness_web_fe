// import React, { useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import GameFooter from "../../components/layout/GameFooter";
// import "./LeaderboardPage.css";
// import { ArrowLeft } from "lucide-react";

// interface LeaderboardEntry {
//   id: number;
//   rank: number;
//   name: string;
//   points: number;
//   avatar: string;
//   isCurrentUser?: boolean;
// }

// interface MissionData {
//   id: number;
//   title: string;
//   duration: string;
//   participants: number;
//   streak: number;
// }

// const LeaderboardPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { missionId } = useParams<{ missionId: string }>();
//   const [activeTab, setActiveTab] = useState<"today" | "this-week" | "all-time">("today");

//   // Convert missionId param from string to number (fallback 1)
//   const missionIdNum = missionId ? parseInt(missionId, 10) : 1;

//   // Mock mission data
//   const missionData: MissionData = {
//     id: missionIdNum,
//     title: "Summer Fitness Challenge",
//     duration: "30 Days",
//     participants: 156,
//     streak: 12,
//   };

//   // Extended mock leaderboard data for scrolling demonstration
//   const leaderboardData: LeaderboardEntry[] = [
//     { id: 1, rank: 1, name: "Maxwell", points: 2304, avatar: "/api/placeholder/60/60" },
//     { id: 2, rank: 2, name: "Camelia", points: 1570, avatar: "/api/placeholder/60/60" },
//     { id: 3, rank: 3, name: "Wilson", points: 1134, avatar: "/api/placeholder/60/60" },
//     { id: 4, rank: 4, name: "Jessica Anderson", points: 992, avatar: "/api/placeholder/60/60" },
//     { id: 5, rank: 5, name: "Sophia Anderson", points: 584, avatar: "/api/placeholder/60/60" },
//     { id: 6, rank: 6, name: "Ethan Carter", points: 548, avatar: "/api/placeholder/60/60" },
//     { id: 7, rank: 7, name: "Liam Johnson", points: 580, avatar: "/api/placeholder/60/60" },
//     { id: 8, rank: 8, name: "Oliver Smith", points: 578, avatar: "/api/placeholder/60/60" },
//     { id: 9, rank: 9, name: "Emma Wilson", points: 567, avatar: "/api/placeholder/60/60" },
//     { id: 10, rank: 10, name: "Noah Davis", points: 556, avatar: "/api/placeholder/60/60" },
//     { id: 11, rank: 11, name: "Ava Brown", points: 543, avatar: "/api/placeholder/60/60" },
//     { id: 12, rank: 12, name: "Lucas Miller", points: 532, avatar: "/api/placeholder/60/60" },
//     { id: 13, rank: 13, name: "Mia Garcia", points: 521, avatar: "/api/placeholder/60/60" },
//     { id: 14, rank: 14, name: "Alexander Lee", points: 510, avatar: "/api/placeholder/60/60" },
//   ];

//   const currentUserData: LeaderboardEntry = {
//     id: 999,
//     rank: 15,
//     name: "Name",
//     points: 253,
//     avatar: "/api/placeholder/60/60",
//     isCurrentUser: true,
//   };

//   const topThree = leaderboardData.slice(0, 3);
//   const restOfLeaderboard = leaderboardData.slice(3);

//   return (
//     <div className="leaderboard-page">

//       <div className="leaderboard-content">
//         {/* Header */}
//         <div className="leaderboard-header">
//           <button onClick={() => navigate(`/your-detail/${missionId}`)} className="back-button">
//             <ArrowLeft size={24} />
//           </button>

//           <div className="header-info">
//             <h1 className="challenge-title">{missionData.title}</h1>
//             <p className="challenge-meta">
//               {missionData.duration} • {missionData.participants} Participants
//             </p>
//           </div>

//           <div className="streak-badge">
//             <span className="streak-icon">🔥</span>
//             <span>{missionData.streak} Day Streak</span>
//           </div>
//         </div>

//         {/* Tab Navigation */}
//         <div className="leaderboard-tabs">
//           <button
//             className={`tab-button ${activeTab === "today" ? "active" : ""}`}
//             onClick={() => setActiveTab("today")}
//           >
//             Today
//           </button>
//           <button
//             className={`tab-button ${activeTab === "this-week" ? "active" : ""}`}
//             onClick={() => setActiveTab("this-week")}
//           >
//             This week
//           </button>
//           <button
//             className={`tab-button ${activeTab === "all-time" ? "active" : ""}`}
//             onClick={() => setActiveTab("all-time")}
//           >
//             All time
//           </button>
//         </div>

//         {/* Main: Two Column Layout */}
//         <div className="leaderboard-main">
//           {/* Left Column: Top 3 Podium */}
//           <div className="top-three-container">
//             <h2 className="top-title">TOP 3</h2>
//             <div className="podium">
//               {/* Second Place */}
//               {topThree[1] && (
//                 <div className="podium-place second">
//                   <div className="podium-bar">
//                     <div className="podium-avatar">
//                       <img src={topThree[1].avatar} alt={topThree[1].name} />
//                       <div className="podium-rank">2</div>
//                     </div>
//                     <div className="podium-name">{topThree[1].name}</div>
//                     <div className="podium-points">• {topThree[1].points}</div>
//                   </div>
//                 </div>
//               )}

//               {/* First Place */}
//               {topThree[0] && (
//                 <div className="podium-place first">
//                   <div className="podium-bar">
//                     <div className="podium-avatar">
//                       <img src={topThree[0].avatar} alt={topThree[0].name} />
//                       <div className="podium-rank">1</div>
//                     </div>
//                     <div className="podium-name">{topThree[0].name}</div>
//                     <div className="podium-points">• {topThree[0].points}</div>
//                   </div>
//                 </div>
//               )}

//               {/* Third Place */}
//               {topThree[2] && (
//                 <div className="podium-place third">
//                   <div className="podium-bar">
//                     <div className="podium-avatar">
//                       <img src={topThree[2].avatar} alt={topThree[2].name} />
//                       <div className="podium-rank">3</div>
//                     </div>
//                     <div className="podium-name">{topThree[2].name}</div>
//                     <div className="podium-points">• {topThree[2].points}</div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Right Column: Leaderboard List + Current User */}
//           <div className="leaderboard-right">
//             <div className="leaderboard-list">
//               {restOfLeaderboard.map((entry) => (
//                 <div key={entry.id} className="leaderboard-item">
//                   <div className="rank-number">{String(entry.rank).padStart(2, "0")}</div>
//                   <div className="user-avatar">
//                     <img src={entry.avatar} alt={entry.name} />
//                   </div>
//                   <div className="user-info">
//                     <span className="user-name">{entry.name}</span>
//                     <span className="user-points">{entry.points} points</span>
//                   </div>
//                   <div className="status-indicator">
//                     {entry.rank <= 5 ? (
//                       <div className="status-dot blue"></div>
//                     ) : (
//                       <div className="status-dot red"></div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Current User Section */}
//             <div className="current-user-section">
//               {/* <div className="separator-dots">
//                 <span>•</span>
//                 <span>•</span>
//                 <span>•</span>
//               </div> */}

//               <div className="current-user-item">
//                 <div className="rank-number">{String(currentUserData.rank).padStart(2, "0")}</div>
//                 <div className="user-avatar current">
//                   <img src={currentUserData.avatar} alt={currentUserData.name} />
//                 </div>
//                 <div className="user-info">
//                   <span className="user-name current">{currentUserData.name}</span>
//                   <span className="user-points">{currentUserData.points} points</span>
//                 </div>
//                 <div className="you-are-here">
//                   <span>You are here!!</span>
//                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//                     <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" />
//                   </svg>
//                 </div>
//                 <div className="status-indicator">
//                   <div className="status-dot pink"></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <GameFooter />
//     </div>
//   );
// };

// export default LeaderboardPage;
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GameFooter from "../../components/layout/GameFooter";
import "./LeaderboardPage.css";
import { ArrowLeft } from "lucide-react";
import {
  challengeService,
  Challenge,
  ChallengeParticipant,
} from "../../services/challengeService";

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  points: number;
  avatar: string;
  isCurrentUser?: boolean;
}

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { missionId } = useParams<{ missionId: string }>();
  const [activeTab, setActiveTab] = useState<"today" | "this-week" | "all-time">("all-time");
  
  // State for API data
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [currentUserData, setCurrentUserData] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user ID from localStorage
  const getUserId = (): string => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (guidRegex.test(storedUserId)) {
        return storedUserId;
      }
    }
    return "";
  };

  // Generate avatar URL
  const getAvatarUrl = (userName: string, userId: string): string => {
    const colors = ["4F46E5", "DC2626", "059669", "D97706", "7C3AED", "EC4899", "10B981"];
    const colorIndex = userId.charCodeAt(0) % colors.length;
    const initial = userName?.charAt(0).toUpperCase() || "U";
    return `https://ui-avatars.com/api/?name=${initial}&background=${colors[colorIndex]}&color=fff&size=80&bold=true`;
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, [missionId, activeTab]);

  const fetchLeaderboardData = async () => {
    if (!missionId) {
      setError("No challenge ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userId = getUserId();
      console.log("🔍 Fetching leaderboard for challenge:", missionId);
      console.log("🔍 Current user ID:", userId);

      // 1. Fetch challenge details
      const challengeData = await challengeService.getChallenge(missionId);
      setChallenge(challengeData);
      console.log("✅ Challenge data:", challengeData);

      // 2. Fetch all participants for this challenge
      const participants = await challengeService.getParticipantsByChallengeId(missionId);
      console.log("✅ Participants data:", participants);

      // 3. Sort by totalPoints descending and assign ranks
      const sortedParticipants = participants
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .map((participant, index) => ({
          id: participant.userId,
          rank: index + 1,
          name: `User ${participant.userId.substring(0, 8)}`, // Temporary - will be replaced with real username
          points: participant.totalPoints || 0,
          avatar: getAvatarUrl(`User ${participant.userId.substring(0, 8)}`, participant.userId),
          isCurrentUser: participant.userId === userId,
        }));

      console.log("✅ Sorted leaderboard:", sortedParticipants);

      // 4. Find current user
      const currentUser = sortedParticipants.find((entry) => entry.isCurrentUser);

      if (currentUser) {
        setCurrentUserData(currentUser);
        // Remove current user from main list if they exist
        setLeaderboardData(sortedParticipants.filter((entry) => !entry.isCurrentUser));
      } else {
        setLeaderboardData(sortedParticipants);
        setCurrentUserData(null);
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
            <button onClick={() => navigate(`/your-detail/${missionId}`)} className="back-button">
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
            <button onClick={() => navigate(`/your-detail/${missionId}`)} className="back-button">
              <ArrowLeft size={24} />
            </button>
            <div className="header-info">
              <h1 className="challenge-title">Error</h1>
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
            {error || "Challenge not found"}
          </div>
        </div>
        <GameFooter />
      </div>
    );
  }

  const topThree = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);

  // Calculate streak from current user participant data
  const currentUserStreak = currentUserData ? 0 : 0; // Will be updated when we fetch participant details

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-content">
        {/* Header - GIỐNG DESIGN CŨ */}
        <div className="leaderboard-header">
          <button onClick={() => navigate(`/your-detail/${missionId}`)} className="back-button">
            <ArrowLeft size={24} />
          </button>

          <div className="header-info">
            <h1 className="challenge-title">{challenge.title}</h1>
            <p className="challenge-meta">
              {challenge.taskSummary || "Challenge"} • {leaderboardData.length + (currentUserData ? 1 : 0)} Participants
            </p>
          </div>

          {currentUserData && (
            <div className="streak-badge">
              <span className="streak-icon">🔥</span>
              <span>{currentUserStreak} Day Streak</span>
            </div>
          )}
        </div>

        {/* Tab Navigation - GIỐNG DESIGN CŨ */}
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
                  No other participants yet
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

            {/* Current User Section */}
            {currentUserData && (
              <div className="current-user-section">
                <div className="current-user-item">
                  <div className="rank-number">{String(currentUserData.rank).padStart(2, "0")}</div>
                  <div className="user-avatar current">
                    <img src={currentUserData.avatar} alt={currentUserData.name} />
                  </div>
                  <div className="user-info">
                    <span className="user-name current">{currentUserData.name}</span>
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