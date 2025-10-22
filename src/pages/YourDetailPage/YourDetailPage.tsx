import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUserId, selectIsAuthenticated } from "../../store/slices/authSlice";
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Trophy,
  Target,
  Flame,
  Users,
  Gift,
  Info,
  Calendar,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  challengeService,
  Challenge,
  ChallengeTask,
  ChallengeParticipant,
  ChallengeTaskProgress,
  ChallengeTaskProgressDTO,
  ChallengeRule,
  LeaderboardEntry as APILeaderboardEntry,
} from "../../services/challengeService";
import { authService } from "../../services/authService";
import "./YourDetailPage.css";

interface TaskWithProgress extends ChallengeTask {
  progress?: ChallengeTaskProgress;
  isCompleted: boolean;
  startDate?: string;
  endDate?: string;
  taskStatus?: 'upcoming' | 'available' | 'overdue';
  penaltyPercentage?: number;
}

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  points: number;
  avatar: string;
  isCurrentUser?: boolean;
}

type TabType = "progress" | "leaderboard";

const YourDetailPage: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  
  const authenticatedUserId = useSelector(selectUserId);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  console.log("🔐 Your Detail - Auth State:", { isAuthenticated, authenticatedUserId });
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participant, setParticipant] = useState<ChallengeParticipant | null>(null);
  const [tasks, setTasks] = useState<TaskWithProgress[]>([]);
  const [rules, setRules] = useState<ChallengeRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("progress");

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  // Generate avatar URL (fallback)
  const getAvatarUrl = (userName: string, userId: string): string => {
    const colors = ["4F46E5", "DC2626", "059669", "D97706", "7C3AED", "EC4899", "10B981"];
    const colorIndex = userId.charCodeAt(0) % colors.length;
    const initial = userName?.charAt(0).toUpperCase() || "U";
    return `https://ui-avatars.com/api/?name=${initial}&background=${colors[colorIndex]}&color=fff&size=80&bold=true`;
  };

  // ✅ Resolve avatar URL - prioritize user's real avatar
  const resolveAvatarUrl = (profilePicture: string | null | undefined, userName: string, userId: string): string => {
    // If user has a real avatar, use it
    if (profilePicture) {
      // Handle relative paths - prepend API base URL if needed
      if (profilePicture.startsWith('/')) {
        return `${import.meta.env.VITE_API_URL || ''}${profilePicture}`;
      }
      // If it's already a full URL or base64, use as is
      return profilePicture;
    }
    
    // Fallback to UI Avatars with user's initial
    return getAvatarUrl(userName, userId);
  };

  // ✅ Extract first name from full name (for Vietnamese names, take the last word)
  const extractFirstName = (fullName: string): string => {
    if (!fullName) return fullName;
    
    const parts = fullName.trim().split(/\s+/);
    
    // If only one word, return it
    if (parts.length === 1) return parts[0];
    
    // For Vietnamese names, the first name is usually the last word
    return parts[parts.length - 1];
  };

  // ✅ Fetch user details and cache them
  const fetchUserDetails = async (userId: string): Promise<{ name: string; fullName?: string; avatar?: string }> => {
    try {
      const userInfo = await authService.getUser(userId);
      const fullName = userInfo.fullName || userInfo.userName || `User ${userId.substring(0, 8)}`;
      
      // If name is too long (more than 15 characters), use only first name
      const displayName = fullName.length > 15 ? extractFirstName(fullName) : fullName;
      
      return {
        name: displayName,
        fullName: userInfo.fullName,
        avatar: userInfo.profilePicture || undefined, // ✅ Get real avatar
      };
    } catch (error) {
      console.warn(`⚠️ Failed to fetch user info for ${userId}:`, error);
      return {
        name: `User ${userId.substring(0, 8)}`,
      };
    }
  };

  // ✅ Calculate task status based on startDate and endDate
  const getTaskStatus = (task: ChallengeTask): {
    status: 'upcoming' | 'available' | 'overdue';
    penaltyPercentage: number;
  } => {
    if (!task.startDate || !task.endDate) {
      return { status: 'available', penaltyPercentage: 0 };
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const startDate = new Date(task.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(task.endDate);
    endDate.setHours(23, 59, 59, 999);

    if (now < startDate) {
      return { status: 'upcoming', penaltyPercentage: 0 };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'available', penaltyPercentage: 0 };
    } else {
      return { status: 'overdue', penaltyPercentage: 50 };
    }
  };

  // ✅ Format date range for display
  const formatTaskDateRange = (startDate: string | undefined, endDate: string | undefined): string => {
    if (!startDate || !endDate) return "No date set";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);

    if (startDay.getTime() === today.getTime() && endDay.getTime() === today.getTime()) {
      return "Today";
    }

    if (startDay.getTime() === today.getTime()) {
      const daysUntilEnd = Math.ceil((endDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilEnd === 0) return "Today";
      if (daysUntilEnd === 1) return "Today - Tomorrow";
      return `Today - ${daysUntilEnd} days`;
    }

    if (endDay.getTime() === today.getTime()) {
      return "Due Today";
    }

    const diffToStart = Math.ceil((startDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const diffToEnd = Math.ceil((endDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffToStart > 0) {
      if (diffToStart === 1) return "Starts Tomorrow";
      if (diffToStart <= 7) return `Starts in ${diffToStart} days`;
      return start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    if (diffToEnd < 0) {
      const daysOverdue = Math.abs(diffToEnd);
      if (daysOverdue === 1) return "1 day overdue";
      if (daysOverdue <= 7) return `${daysOverdue} days overdue`;
      return `Overdue since ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }

    if (diffToEnd === 1) return "Due Tomorrow";
    if (diffToEnd <= 7) return `Due in ${diffToEnd} days`;
    return `Due ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  useEffect(() => {
    const fetchChallengeDetails = async () => {
      if (!challengeId) {
        console.error("❌ No challengeId from URL params");
        setError("No challenge ID provided");
        setLoading(false);
        return;
      }

      if (!isAuthenticated || !authenticatedUserId) {
        console.error("❌ User not authenticated");
        setError("Please log in to view your challenge details");
        setLoading(false);
        navigate("/auth?mode=signin");
        return;
      }

      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!guidRegex.test(challengeId)) {
        console.error("❌ Invalid challengeId format:", challengeId);
        setError("Invalid challenge ID format");
        setLoading(false);
        return;
      }

      if (!guidRegex.test(authenticatedUserId)) {
        console.error("❌ Invalid userId format (not a Guid):", authenticatedUserId);
        setError("Invalid user ID format. Please try logging in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("🔍 ChallengeId from URL:", challengeId);
        console.log("🔍 Authenticated UserId:", authenticatedUserId);

        const challengeData = await challengeService.getChallenge(challengeId);
        console.log("✅ Challenge:", challengeData);
        setChallenge(challengeData);

        try {
          const rulesData = await challengeService.getRulesByChallengeId(challengeId);
          if (rulesData && rulesData.length > 0) {
            setRules(rulesData[0]);
            console.log("✅ Challenge rules:", rulesData[0]);
          }
        } catch (err) {
          console.warn("⚠️ Failed to fetch rules:", err);
        }

        const allParticipants = await challengeService.getAllChallengeParticipants();
        const userParticipant = allParticipants.find(
          (p) => p.challengeId === challengeId && 
                 p.userId.toLowerCase() === authenticatedUserId.toLowerCase()
        );

        if (!userParticipant) {
          console.error("❌ User is not a participant of this challenge");
          setError("You are not a participant of this challenge");
          setLoading(false);
          return;
        }

        console.log("✅ User participant:", userParticipant);
        setParticipant(userParticipant);

        let tasksData: ChallengeTask[] = [];
        try {
          tasksData = await challengeService.getTasksByChallengeId(challengeId);
          if (!tasksData || tasksData.length === 0) {
            console.log("⚠️ No tasks from specific endpoint, trying to fetch all tasks...");
            const allTasks = await challengeService.getAllChallengeTasks();
            tasksData = allTasks.filter((t) => t.challengeId === challengeId);
          }
        } catch (err) {
          console.warn("⚠️ Failed to fetch tasks:", err);
          const allTasks = await challengeService.getAllChallengeTasks();
          tasksData = allTasks.filter((t) => t.challengeId === challengeId);
        }

        console.log("✅ Tasks:", tasksData);

        let progressData: ChallengeTaskProgress[] = [];
        try {
          progressData = await challengeService.getProgressByParticipantId(userParticipant.id);
          console.log("✅ Task progress fetched:", progressData);
        } catch (err) {
          console.warn("⚠️ Failed to fetch progress:", err);
          try {
            const allProgress = await challengeService.getAllChallengeTaskProgresses();
            progressData = allProgress.filter((p) => p.participantId === userParticipant.id);
            console.log("✅ Filtered task progress:", progressData);
          } catch (fallbackErr) {
            console.error("❌ Fallback also failed:", fallbackErr);
          }
        }

        const tasksWithProgress: TaskWithProgress[] = tasksData.map((task) => {
          const progress = progressData.find((p) => p.challengeTaskId === task.id);
          const { status, penaltyPercentage } = getTaskStatus(task);
          
          return {
            ...task,
            progress,
            isCompleted: progress?.status?.toLowerCase() === "completed",
            startDate: task.startDate,
            endDate: task.endDate,
            taskStatus: status,
            penaltyPercentage,
          };
        });

        tasksWithProgress.sort((a, b) => {
          if (!a.startDate) return 1;
          if (!b.startDate) return -1;
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        });

        console.log("✅ Tasks with progress and status:", tasksWithProgress);
        setTasks(tasksWithProgress);
      } catch (err) {
        console.error("❌ Error fetching challenge details:", err);
        setError("Failed to load challenge details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeDetails();
  }, [challengeId, authenticatedUserId, isAuthenticated, navigate]);

  useEffect(() => {
    if (activeTab === "leaderboard" && challengeId && isAuthenticated && authenticatedUserId) {
      fetchLeaderboardData();
    }
  }, [activeTab, challengeId, authenticatedUserId, isAuthenticated]);

  const fetchLeaderboardData = async () => {
    if (!challengeId) return;

    try {
      setLoadingLeaderboard(true);
      setLeaderboardError(null);

      console.log("🔍 Fetching leaderboard for challenge:", challengeId);

      // 1. Fetch participants to get points data
      const participants = await challengeService.getParticipantsByChallengeId(challengeId);
      console.log("✅ Participants data:", participants);

      // 2. Fetch leaderboard from API
      let apiLeaderboard: APILeaderboardEntry[] = [];
      try {
        apiLeaderboard = await challengeService.getLeaderboard(challengeId);
        console.log("✅ API Leaderboard response:", apiLeaderboard);
      } catch (err) {
        console.warn("⚠️ Failed to fetch leaderboard from API, building from participants:", err);
        
        // Fallback: Build leaderboard from participants
        apiLeaderboard = participants
          .filter(p => p.totalPoints && p.totalPoints > 0)
          .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
          .map((participant, index) => ({
            userId: participant.userId,
            userName: undefined,
            totalPoints: participant.totalPoints || 0,
            rank: index + 1,
          }));
        console.log("✅ Fallback leaderboard from participants:", apiLeaderboard);
      }

      // 3. Create a map for quick participant lookup
      const participantMap = new Map(participants.map(p => [p.userId, p]));

      // 4. Fetch user details for all participants in leaderboard
      const userDetailsPromises = apiLeaderboard.map(entry => 
        fetchUserDetails(entry.userId)
      );
      const userDetailsArray = await Promise.all(userDetailsPromises);

      // 5. Create user details map
      const userDetailsMap = new Map(
        apiLeaderboard.map((entry, index) => [
          entry.userId,
          userDetailsArray[index]
        ])
      );

      // 6. Transform API leaderboard with user details and real avatars
      const transformedLeaderboard: LeaderboardEntry[] = apiLeaderboard.map((entry) => {
        const userDetails = userDetailsMap.get(entry.userId);
        const participant = participantMap.get(entry.userId);
        const displayName = userDetails?.name || `User ${entry.userId.substring(0, 8)}`;
        
        // Use totalPoints from either the leaderboard entry or participant data
        const points = entry.totalPoints || participant?.totalPoints || 0;
        
        return {
          id: entry.userId,
          rank: entry.rank,
          name: displayName,
          points: points,
          avatar: resolveAvatarUrl(userDetails?.avatar, displayName, entry.userId),
          isCurrentUser: entry.userId.toLowerCase() === authenticatedUserId?.toLowerCase(),
        };
      });

      console.log("✅ Transformed leaderboard with real user details:", transformedLeaderboard);
      setLeaderboardData(transformedLeaderboard);

    } catch (err) {
      console.error("❌ Error fetching leaderboard:", err);
      setLeaderboardError("Failed to load leaderboard. Please try again later.");
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleMarkAsComplete = async (task: TaskWithProgress) => {
    if (!participant || !task.id || task.isCompleted) return;

    if (!isAuthenticated || !authenticatedUserId) {
      alert("Please log in to mark tasks as complete");
      navigate("/auth?mode=signin");
      return;
    }

    if (task.taskStatus === 'upcoming') {
      alert(`This task is not available yet. It will be available starting ${formatTaskDateRange(task.startDate, task.endDate)}.`);
      return;
    }

    if (task.taskStatus === 'overdue') {
      const confirmComplete = window.confirm(
        `⚠️ This task is overdue!\n\n` +
        `The deadline was ${task.endDate ? new Date(task.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : 'passed'}.\n\n` +
        `You will receive only 50% of the points (${Math.floor((task.points || 0) * 0.5)} points instead of ${task.points || 0}).\n\n` +
        `Do you want to mark it as complete anyway?`
      );
      
      if (!confirmComplete) {
        return;
      }
    }

    try {
      setUpdatingTask(task.id);

      const earnedPoints = task.taskStatus === 'overdue' 
        ? Math.floor((task.points || 0) * 0.5) 
        : (task.points || 0);

      if (task.progress) {
        const updateData: ChallengeTaskProgressDTO = {
          participantId: participant.id,
          challengeTaskId: task.id,
          status: "completed",
          completedAt: new Date().toISOString(),
          pointsEarned: earnedPoints,
        };

        await challengeService.updateChallengeTaskProgress(task.progress.id, updateData);
        console.log("✅ Task progress updated successfully with penalty:", { original: task.points, earned: earnedPoints });
      } else {
        const newProgressData: ChallengeTaskProgressDTO = {
          participantId: participant.id,
          challengeTaskId: task.id,
          status: "completed",
          completedAt: new Date().toISOString(),
          pointsEarned: earnedPoints,
        };

        await challengeService.createChallengeTaskProgress(newProgressData);
        console.log("✅ Task progress created successfully with penalty:", { original: task.points, earned: earnedPoints });
      }

      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === task.id
            ? {
                ...t,
                isCompleted: true,
                progress: {
                  ...(task.progress || {}),
                  participantId: participant.id,
                  challengeTaskId: task.id,
                  status: "completed",
                  completedAt: new Date().toISOString(),
                  pointsEarned: earnedPoints,
                  id: task.progress?.id || "",
                },
              }
            : t
        )
      );

      const newCompletedCount = tasks.filter((t) =>
        t.id === task.id ? true : t.isCompleted
      ).length;
      const newTotalPoints = tasks.reduce((sum, t) => {
        if (t.id === task.id) {
          return sum + earnedPoints;
        }
        return sum + (t.isCompleted ? t.progress?.pointsEarned || t.points || 0 : 0);
      }, 0);
      const newPercentageCompleted = Math.round((newCompletedCount / tasks.length) * 100);

      setParticipant((prev) =>
        prev
          ? {
              ...prev,
              totalPoints: newTotalPoints,
              percentageCompleted: newPercentageCompleted,
            }
          : null
      );

      if (task.taskStatus === 'overdue') {
        alert(`✅ Task completed!\nYou earned ${earnedPoints} points (50% penalty applied)`);
      } else {
        alert(`✅ Task completed!\nYou earned ${earnedPoints} points`);
      }

      console.log("✅ Task marked as complete successfully");
    } catch (err) {
      console.error("❌ Error marking task as complete:", err);
      alert("Failed to mark task as complete. Please try again.");
    } finally {
      setUpdatingTask(null);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="your-detail-page">
        <div className="your-detail-content">
          <div className="detail-header">
            <button onClick={() => navigate("/your-challenges")} className="back-button">
              <ArrowLeft size={24} />
            </button>
            <h1 className="header-title">Challenge Details</h1>
          </div>
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            Loading challenge details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !challenge || !participant) {
    return (
      <div className="your-detail-page">
        <div className="your-detail-content">
          <div className="detail-header">
            <button onClick={() => navigate("/your-challenges")} className="back-button">
              <ArrowLeft size={24} />
            </button>
            <h1 className="header-title">Challenge Details</h1>
          </div>
          <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
            {error || "Challenge not found"}
            {error && error.includes("not authenticated") && (
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
      </div>
    );
  }

  const completedTasksCount = tasks.filter((t) => t.isCompleted).length;
  const inProgressTasksCount = tasks.filter((t) => !t.isCompleted && t.progress).length;
  const notStartedTasksCount = tasks.filter((t) => !t.isCompleted && !t.progress).length;
  const totalTasksCount = tasks.length;
  const progressPercentage = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  const currentUserInLeaderboard = leaderboardData.find(entry => entry.isCurrentUser);
  const todaysTask = tasks.find((t) => !t.isCompleted && t.taskStatus === 'available');

  return (
    <div className="your-detail-page">
      <div className="your-detail-content">
        <div className="detail-header">
          <button onClick={() => navigate("/your-challenges")} className="back-button">
            <ArrowLeft size={24} />
          </button>
          <div className="header-info">
            <h1 className="challenge-title">{challenge.title}</h1>
            <p className="challenge-meta">
              {challenge.taskSummary || `${totalTasksCount} Days • ${challenge.maxParticipants || 0} Participants`}
            </p>
          </div>
          {participant.currentStreak && participant.currentStreak > 0 && (
            <div className="streak-badge">
              <Flame className="streak-icon" size={16} />
              {participant.currentStreak} Day Streak
            </div>
          )}
        </div>

        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "progress" ? "active" : ""}`}
            onClick={() => setActiveTab("progress")}
          >
            My Progress
          </button>
          <button
            className={`tab-button ${activeTab === "leaderboard" ? "active" : ""}`}
            onClick={() => setActiveTab("leaderboard")}
          >
            Leaderboard
          </button>
        </div>

        {activeTab === "progress" && (
          <>
            <div className="progress-overview">
              <div className="overview-header">
                <h2 className="overview-title">Challenge Progress</h2>
                <div className="task-counter">
                  <span className="task-count">
                    {completedTasksCount}/{totalTasksCount}
                  </span>
                  <span className="task-label">Tasks Completed</span>
                </div>
              </div>

              <div className="progress-bar-section">
                <div className="progress-label">
                  <span className="progress-title">Overall Progress</span>
                  <span className="progress-percentage">{progressPercentage}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>

              <div className="progress-stats">
                <div className="stat-item">
                  <span className="stat-number">{completedTasksCount}</span>
                  <span className="stat-label">Completed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{inProgressTasksCount}</span>
                  <span className="stat-label">In Progress</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{notStartedTasksCount}</span>
                  <span className="stat-label">Not Started</span>
                </div>
              </div>
            </div>

            <div className="info-cards-grid">
              {rules && rules.howToParticipate && rules.howToParticipate.length > 0 && (
                <div className="info-card">
                  <div className="info-card-header">
                    <Info size={20} />
                    <h3>How to Participate</h3>
                  </div>
                  <ul className="info-list">
                    {rules.howToParticipate.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {challenge.prizePool && challenge.prizePool > 0 && (
                <div className="info-card">
                  <div className="info-card-header">
                    <Gift size={20} />
                    <h3>Prize Pool</h3>
                  </div>
                  <div className="prize-amount">${challenge.prizePool.toLocaleString()}</div>
                  <p className="prize-description">
                    Compete with others to win your share of the prize pool!
                  </p>
                </div>
              )}

              <div className="info-card">
                <div className="info-card-header">
                  <Users size={20} />
                  <h3>Challenge Stats</h3>
                </div>
                <div className="stats-list">
                  <div className="stat-row">
                    <span>Status:</span>
                    <span className="stat-value">{challenge.status}</span>
                  </div>
                  <div className="stat-row">
                    <span>Start Date:</span>
                    <span className="stat-value">{formatDate(challenge.startAt)}</span>
                  </div>
                  <div className="stat-row">
                    <span>End Date:</span>
                    <span className="stat-value">{formatDate(challenge.endAt)}</span>
                  </div>
                  <div className="stat-row">
                    <span>Your Points:</span>
                    <span className="stat-value">{participant.totalPoints || 0} pts</span>
                  </div>
                </div>
              </div>

              {rules && rules.ruleText && rules.ruleText.length > 0 && (
                <div className="info-card">
                  <div className="info-card-header">
                    <Target size={20} />
                    <h3>Challenge Rules</h3>
                  </div>
                  <ul className="info-list">
                    {rules.ruleText.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {todaysTask && (
              <div className="todays-challenge">
                <div className="challenge-header">
                  <h2 className="challenge-section-title">Today's Challenge</h2>
                </div>
                <div key={todaysTask.id} className="challenge-item">
                  <div className="challenge-icon">
                    <Target size={24} />
                  </div>
                  <div className="challenge-details">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <h3 className="challenge-name">{todaysTask.name}</h3>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 8px",
                        backgroundColor: "#DBEAFE",
                        color: "#1E40AF",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}>
                        <Calendar size={12} />
                        {formatTaskDateRange(todaysTask.startDate, todaysTask.endDate)}
                      </span>
                    </div>
                    {todaysTask.description && (
                      <p className="challenge-description">{todaysTask.description}</p>
                    )}
                    <div style={{ marginTop: "8px", fontSize: "14px", color: "#059669", fontWeight: "600" }}>
                      {todaysTask.points} points
                    </div>
                  </div>
                  <div className="action-buttons">
                    <button
                      className="complete-button"
                      onClick={() => handleMarkAsComplete(todaysTask)}
                      disabled={updatingTask === todaysTask.id}
                      style={{
                        cursor: updatingTask === todaysTask.id ? "wait" : "pointer",
                        opacity: updatingTask === todaysTask.id ? 0.7 : 1,
                      }}
                    >
                      <CheckCircle size={20} />
                      {updatingTask === todaysTask.id ? "Marking..." : "Mark as Complete"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="all-challenges">
              <h2 className="all-challenges-title">All Challenges</h2>
              {tasks.length === 0 ? (
                <p style={{ color: "#6b7280", fontStyle: "italic" }}>
                  No tasks available for this challenge.
                </p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="challenge-list-item" style={{
                    backgroundColor: task.taskStatus === 'overdue' && !task.isCompleted ? '#FEF2F2' : 'white',
                    border: task.taskStatus === 'upcoming' ? '1px solid #E5E7EB' : task.taskStatus === 'overdue' && !task.isCompleted ? '1px solid #FEE2E2' : '1px solid #E5E7EB',
                    opacity: task.taskStatus === 'upcoming' ? 0.6 : 1,
                  }}>
                    <div
                      className={`status-icon ${
                        task.isCompleted
                          ? "completed"
                          : task.progress
                          ? "in-progress"
                          : "not-started"
                      }`}
                    >
                      {task.isCompleted ? (
                        <CheckCircle size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </div>
                    <div className="challenge-info" style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <h3 className="challenge-list-name">{task.name}</h3>
                        
                        {task.startDate && task.endDate && (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 8px",
                            backgroundColor: task.taskStatus === 'upcoming' ? '#F3F4F6' : 
                                           task.taskStatus === 'available' ? '#DBEAFE' : '#FEE2E2',
                            color: task.taskStatus === 'upcoming' ? '#6B7280' : 
                                   task.taskStatus === 'available' ? '#1E40AF' : '#991B1B',
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}>
                            <Calendar size={12} />
                            {formatTaskDateRange(task.startDate, task.endDate)}
                          </span>
                        )}

                        {task.taskStatus === 'upcoming' && !task.isCompleted && (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 8px",
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "600",
                          }}>
                            <Clock size={11} />
                            Not Yet Available
                          </span>
                        )}

                        {task.taskStatus === 'overdue' && !task.isCompleted && (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 8px",
                            backgroundColor: '#FEE2E2',
                            color: '#991B1B',
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "600",
                          }}>
                            <AlertTriangle size={11} />
                            Overdue - 50% Points
                          </span>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="challenge-list-description">{task.description}</p>
                      )}
                      
                      <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ 
                          fontSize: "14px", 
                          color: task.isCompleted ? "#10B981" : "#059669", 
                          fontWeight: "600" 
                        }}>
                          {task.isCompleted 
                            ? `${task.progress?.pointsEarned || task.points} points earned`
                            : task.taskStatus === 'overdue'
                            ? `${Math.floor((task.points || 0) * 0.5)} points (50% penalty)`
                            : `${task.points} points`
                          }
                        </span>
                        {!task.isCompleted && task.taskStatus === 'overdue' && (
                          <span style={{ 
                            fontSize: "12px", 
                            color: "#6B7280", 
                            textDecoration: "line-through" 
                          }}>
                            {task.points} pts
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {task.isCompleted ? (
                      <span className="status-badge done">Done</span>
                    ) : (
                      <button
                        className="complete-button"
                        onClick={() => handleMarkAsComplete(task)}
                        disabled={updatingTask === task.id || task.taskStatus === 'upcoming'}
                        style={{
                          cursor: task.taskStatus === 'upcoming' ? 'not-allowed' : 
                                 updatingTask === task.id ? "wait" : "pointer",
                          opacity: task.taskStatus === 'upcoming' ? 0.5 : 
                                  updatingTask === task.id ? 0.7 : 1,
                          fontSize: "14px",
                          padding: "8px 16px",
                          backgroundColor: task.taskStatus === 'overdue' ? '#DC2626' : '#3B82F6',
                        }}
                        title={task.taskStatus === 'upcoming' 
                          ? `Available starting ${task.startDate ? new Date(task.startDate).toLocaleDateString() : 'soon'}`
                          : task.taskStatus === 'overdue'
                          ? `Deadline was ${task.endDate ? new Date(task.endDate).toLocaleDateString() : 'passed'} - 50% penalty applies`
                          : 'Complete task for full points'
                        }
                      >
                        {updatingTask === task.id 
                          ? "Marking..." 
                          : task.taskStatus === 'upcoming'
                          ? "Locked"
                          : task.taskStatus === 'overdue'
                          ? "Complete (-50%)"
                          : "Complete"
                        }
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "leaderboard" && (
          <div className="all-challenges">
            <div style={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "40px",
              textAlign: "center",
            }}>
              {loadingLeaderboard ? (
                <div style={{ color: "#6b7280", padding: "20px" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    border: "3px solid #e5e7eb",
                    borderTop: "3px solid #3b82f6",
                    borderRadius: "50%",
                    margin: "0 auto 16px",
                    animation: "spin 1s linear infinite",
                  }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  Loading leaderboard...
                </div>
              ) : leaderboardError ? (
                <div>
                  <div style={{
                    fontSize: "48px",
                    marginBottom: "16px",
                  }}>😕</div>
                  <div style={{ color: "#ef4444", marginBottom: "20px" }}>
                    {leaderboardError}
                  </div>
                  <button
                    onClick={fetchLeaderboardData}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor: "#FEF3C7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                  }}>
                    <Trophy size={40} style={{ color: "#F59E0B" }} />
                  </div>

                  <h2 style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginBottom: "12px",
                    color: "#111827",
                  }}>
                    Challenge Leaderboard
                  </h2>

                  <p style={{
                    fontSize: "16px",
                    color: "#6b7280",
                    marginBottom: "32px",
                    maxWidth: "500px",
                    margin: "0 auto 32px",
                  }}>
                    See how you rank against other participants and compete for the top spots!
                  </p>

                  {currentUserInLeaderboard ? (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "20px",
                      marginBottom: "32px",
                      maxWidth: "600px",
                      margin: "0 auto 32px",
                    }}>
                      <div style={{
                        padding: "20px",
                        backgroundColor: "#EFF6FF",
                        borderRadius: "12px",
                        border: "2px solid #3B82F6",
                      }}>
                        <div style={{
                          fontSize: "32px",
                          fontWeight: "bold",
                          color: "#3B82F6",
                          marginBottom: "4px",
                        }}>
                          #{currentUserInLeaderboard.rank}
                        </div>
                        <div style={{ fontSize: "14px", color: "#1E40AF", fontWeight: "500" }}>
                          Your Rank
                        </div>
                      </div>

                      <div style={{
                        padding: "20px",
                        backgroundColor: "#F0FDF4",
                        borderRadius: "12px",
                        border: "2px solid #10B981",
                      }}>
                        <div style={{
                          fontSize: "32px",
                          fontWeight: "bold",
                          color: "#10B981",
                          marginBottom: "4px",
                        }}>
                          {currentUserInLeaderboard.points}
                        </div>
                        <div style={{ fontSize: "14px", color: "#065F46", fontWeight: "500" }}>
                          Your Points
                        </div>
                      </div>

                      <div style={{
                        padding: "20px",
                        backgroundColor: "#FEF3C7",
                        borderRadius: "12px",
                        border: "2px solid #F59E0B",
                      }}>
                        <div style={{
                          fontSize: "32px",
                          fontWeight: "bold",
                          color: "#F59E0B",
                          marginBottom: "4px",
                        }}>
                          {leaderboardData.length}
                        </div>
                        <div style={{ fontSize: "14px", color: "#92400E", fontWeight: "500" }}>
                          Total Players
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: "20px",
                      backgroundColor: "#FEF3C7",
                      borderRadius: "12px",
                      marginBottom: "32px",
                      maxWidth: "500px",
                      margin: "0 auto 32px",
                      border: "1px solid #FDE68A",
                    }}>
                      <div style={{ fontSize: "24px", marginBottom: "8px" }}>📊</div>
                      <p style={{ fontSize: "14px", color: "#92400E", margin: 0, fontWeight: "500" }}>
                        Complete tasks to appear on the leaderboard!
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/leaderboard/${challengeId}`)}
                    style={{
                      padding: "16px 48px",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600",
                      boxShadow: "0 4px 6px rgba(59, 130, 246, 0.3)",
                      transition: "all 0.2s",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#2563eb";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 8px rgba(59, 130, 246, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#3b82f6";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 6px rgba(59, 130, 246, 0.3)";
                    }}
                  >
                    View Full Leaderboard
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7 3L14 10L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {leaderboardData.length >= 3 && (
                    <div style={{
                      marginTop: "40px",
                      paddingTop: "32px",
                      borderTop: "1px solid #e5e7eb",
                    }}>
                      <h3 style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        marginBottom: "20px",
                        color: "#374151",
                      }}>
                        🏆 Current Top 3
                      </h3>
                      <div style={{
                        display: "flex",
                        gap: "16px",
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}>
                        {leaderboardData.slice(0, 3).map((entry, index) => (
                          <div key={entry.id} style={{
                            flex: "1",
                            minWidth: "150px",
                            maxWidth: "200px",
                            padding: "20px",
                            backgroundColor: index === 0 ? "#FEF3C7" : "#F9FAFB",
                            borderRadius: "12px",
                            border: entry.isCurrentUser ? "2px solid #3B82F6" : "1px solid #e5e7eb",
                            position: "relative",
                          }}>
                            <div style={{
                              position: "absolute",
                              top: "-12px",
                              right: "-12px",
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              backgroundColor: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "16px",
                              fontWeight: "bold",
                              color: "white",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            }}>
                              {index + 1}
                            </div>

                            <img
                              src={entry.avatar}
                              alt={entry.name}
                              style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "50%",
                                margin: "0 auto 12px",
                                display: "block",
                                border: entry.isCurrentUser ? "3px solid #3B82F6" : "2px solid #e5e7eb",
                              }}
                            />
                            <div style={{
                              fontSize: "15px",
                              fontWeight: "600",
                              color: entry.isCurrentUser ? "#3B82F6" : "#374151",
                              marginBottom: "4px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                              {entry.isCurrentUser ? "You 👋" : entry.name}
                            </div>
                            <div style={{
                              fontSize: "18px",
                              fontWeight: "bold",
                              color: "#10B981",
                            }}>
                              {entry.points} pts
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{
                        marginTop: "16px",
                        fontSize: "13px",
                        color: "#6b7280",
                      }}>
                        Click "View Full Leaderboard" to see all rankings
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourDetailPage;  