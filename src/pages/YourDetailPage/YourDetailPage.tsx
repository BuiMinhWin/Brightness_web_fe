import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import {
  challengeService,
  Challenge,
  ChallengeTask,
  ChallengeParticipant,
  ChallengeTaskProgress,
  ChallengeTaskProgressDTO,
  ChallengeRule,
} from "../../services/challengeService";
import "./YourDetailPage.css";

interface TaskWithProgress extends ChallengeTask {
  progress?: ChallengeTaskProgress;
  isCompleted: boolean;
}

type TabType = "progress" | "leaderboard";

const YourDetailPage: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participant, setParticipant] = useState<ChallengeParticipant | null>(null);
  const [tasks, setTasks] = useState<TaskWithProgress[]>([]);
  const [rules, setRules] = useState<ChallengeRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("progress");

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

  useEffect(() => {
    const fetchChallengeDetails = async () => {
      if (!challengeId) {
        console.error("❌ No challengeId from URL params");
        setError("No challenge ID provided");
        setLoading(false);
        return;
      }

      // Validate GUID format
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!guidRegex.test(challengeId)) {
        console.error("❌ Invalid challengeId format:", challengeId);
        setError("Invalid challenge ID format");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userId = getUserId();
        console.log("🔍 ChallengeId from URL:", challengeId);
        console.log("🔍 UserId:", userId);
        
        if (!userId) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        // Fetch challenge
        const challengeData = await challengeService.getChallenge(challengeId);
        console.log("✅ Challenge:", challengeData);
        setChallenge(challengeData);

        // Fetch challenge rules
        try {
          const rulesData = await challengeService.getRulesByChallengeId(challengeId);
          if (rulesData && rulesData.length > 0) {
            setRules(rulesData[0]);
            console.log("✅ Challenge rules:", rulesData[0]);
          }
        } catch (err) {
          console.warn("Failed to fetch rules:", err);
        }

        // Fetch participants to get current user's participant record
        const allParticipants = await challengeService.getAllChallengeParticipants();
        const userParticipant = allParticipants.find(
          (p) => p.challengeId === challengeId && p.userId === userId
        );

        if (!userParticipant) {
          setError("You are not a participant of this challenge");
          setLoading(false);
          return;
        }

        console.log("✅ User participant:", userParticipant);
        setParticipant(userParticipant);

        // Fetch tasks
        let tasksData: ChallengeTask[] = [];
        try {
          tasksData = await challengeService.getTasksByChallengeId(challengeId);
          if (!tasksData || tasksData.length === 0) {
            const allTasks = await challengeService.getAllChallengeTasks();
            tasksData = allTasks.filter((t) => t.challengeId === challengeId);
          }
        } catch (err) {
          console.warn("Failed to fetch tasks:", err);
          const allTasks = await challengeService.getAllChallengeTasks();
          tasksData = allTasks.filter((t) => t.challengeId === challengeId);
        }

        console.log("✅ Tasks:", tasksData);

        // Fetch task progress
        let progressData: ChallengeTaskProgress[] = [];
        try {
          progressData = await challengeService.getProgressByParticipantId(userParticipant.id);
        } catch (err) {
          console.warn("Failed to fetch progress:", err);
          const allProgress = await challengeService.getAllChallengeTaskProgresses();
          progressData = allProgress.filter((p) => p.participantId === userParticipant.id);
        }

        console.log("✅ Task progress:", progressData);

        // Combine tasks with progress
        const tasksWithProgress: TaskWithProgress[] = tasksData.map((task) => {
          const progress = progressData.find((p) => p.challengeTaskId === task.id);
          return {
            ...task,
            progress,
            isCompleted: progress?.status?.toLowerCase() === "completed",
          };
        });

        console.log("✅ Tasks with progress:", tasksWithProgress);
        setTasks(tasksWithProgress);
      } catch (err) {
        console.error("❌ Error fetching challenge details:", err);
        setError("Failed to load challenge details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeDetails();
  }, [challengeId]);

  const handleMarkAsComplete = async (task: TaskWithProgress) => {
    if (!participant || !task.id || task.isCompleted) return;

    try {
      setUpdatingTask(task.id);

      if (task.progress) {
        // Update existing progress
        const updateData: ChallengeTaskProgressDTO = {
          participantId: participant.id,
          challengeTaskId: task.id,
          status: "completed",
          completedAt: new Date().toISOString(),
          pointsEarned: task.points,
        };

        await challengeService.updateChallengeTaskProgress(task.progress.id, updateData);
      } else {
        // Create new progress
        const newProgressData: ChallengeTaskProgressDTO = {
          participantId: participant.id,
          challengeTaskId: task.id,
          status: "completed",
          completedAt: new Date().toISOString(),
          pointsEarned: task.points,
        };

        await challengeService.createChallengeTaskProgress(newProgressData);
      }

      // Update local state
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
                  pointsEarned: task.points,
                  id: task.progress?.id || "",
                },
              }
            : t
        )
      );

      // Update participant stats
      const newCompletedCount = tasks.filter((t) =>
        t.id === task.id ? true : t.isCompleted
      ).length;
      const newTotalPoints = tasks.reduce((sum, t) => {
        if (t.id === task.id) {
          return sum + (task.points || 0);
        }
        return sum + (t.isCompleted ? t.points || 0 : 0);
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

  return (
    <div className="your-detail-page">
      <div className="your-detail-content">
        {/* Header */}
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

        {/* Tab Navigation */}
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

        {/* Progress Tab Content */}
        {activeTab === "progress" && (
          <>
            {/* Progress Overview Card */}
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

            {/* Challenge Info Cards */}
            <div className="info-cards-grid">
              {/* How to Participate */}
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

              {/* Prize Pool */}
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

              {/* Challenge Stats */}
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

              {/* Rules */}
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

            {/* Today's Challenge */}
            {tasks.filter((t) => !t.isCompleted).length > 0 && (
              <div className="todays-challenge">
                <div className="challenge-header">
                  <h2 className="challenge-section-title">Today's Challenge</h2>
                </div>
                {tasks
                  .filter((t) => !t.isCompleted)
                  .slice(0, 1)
                  .map((task) => (
                    <div key={task.id} className="challenge-item">
                      <div className="challenge-icon">
                        <Target size={24} />
                      </div>
                      <div className="challenge-details">
                        <h3 className="challenge-name">{task.name}</h3>
                        {task.description && (
                          <p className="challenge-description">{task.description}</p>
                        )}
                      </div>
                      <div className="action-buttons">
                        <button
                          className="complete-button"
                          onClick={() => handleMarkAsComplete(task)}
                          disabled={updatingTask === task.id}
                          style={{
                            cursor: updatingTask === task.id ? "wait" : "pointer",
                            opacity: updatingTask === task.id ? 0.7 : 1,
                          }}
                        >
                          <CheckCircle size={20} />
                          {updatingTask === task.id ? "Marking..." : "Mark as Complete"}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* All Challenges */}
            <div className="all-challenges">
              <h2 className="all-challenges-title">All Challenges</h2>
              {tasks.length === 0 ? (
                <p style={{ color: "#6b7280", fontStyle: "italic" }}>
                  No tasks available for this challenge.
                </p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="challenge-list-item">
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
                    <div className="challenge-info">
                      <h3 className="challenge-list-name">{task.name}</h3>
                      {task.description && (
                        <p className="challenge-list-description">{task.description}</p>
                      )}
                    </div>
                    {task.isCompleted ? (
                      <span className="status-badge done">Done</span>
                    ) : (
                      <button
                        className="complete-button"
                        onClick={() => handleMarkAsComplete(task)}
                        disabled={updatingTask === task.id}
                        style={{
                          cursor: updatingTask === task.id ? "wait" : "pointer",
                          opacity: updatingTask === task.id ? 0.7 : 1,
                          fontSize: "14px",
                          padding: "8px 16px",
                        }}
                      >
                        {updatingTask === task.id ? "Marking..." : "Complete"}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Leaderboard Tab Content */}
        {activeTab === "leaderboard" && (
          <div className="all-challenges">
            <h2 className="all-challenges-title">Challenge Leaderboard</h2>
            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
              <Trophy size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
              <p>Leaderboard feature coming soon!</p>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>
                Compete with other participants and track rankings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourDetailPage;

// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   CheckCircle,
//   Circle,
//   Clock,
//   Trophy,
//   Calendar,
//   Star,
//   Target,
//   TrendingUp,
// } from "lucide-react";
// import {
//   challengeService,
//   Challenge,
//   ChallengeTask,
//   ChallengeParticipant,
//   ChallengeTaskProgress,
//   ChallengeTaskProgressDTO,
// } from "../../services/challengeService";
// import "./YourDetailPage.css";

// interface TaskWithProgress extends ChallengeTask {
//   progress?: ChallengeTaskProgress;
//   isCompleted: boolean;
// }

// const YourDetailPage: React.FC = () => {
//   const { challengeId } = useParams<{ challengeId: string }>();
//   const navigate = useNavigate();
  
//   const [challenge, setChallenge] = useState<Challenge | null>(null);
//   const [participant, setParticipant] = useState<ChallengeParticipant | null>(null);
//   const [tasks, setTasks] = useState<TaskWithProgress[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [updatingTask, setUpdatingTask] = useState<string | null>(null);

//   // Get user ID from localStorage
//   const getUserId = (): string => {
//     const storedUserId = localStorage.getItem("userId");
//     if (storedUserId) {
//       const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
//       if (guidRegex.test(storedUserId)) {
//         return storedUserId;
//       }
//     }
//     return "";
//   };

//   useEffect(() => {
//     const fetchChallengeDetails = async () => {
//       if (!challengeId) {
//         console.error("❌ No challengeId from URL params");
//         setError("No challenge ID provided");
//         setLoading(false);
//         return;
//       }

//       // Validate GUID format
//       const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
//       if (!guidRegex.test(challengeId)) {
//         console.error("❌ Invalid challengeId format:", challengeId);
//         setError("Invalid challenge ID format");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError(null);

//         const userId = getUserId();
//         console.log("🔍 ChallengeId from URL:", challengeId);
//         console.log("🔍 UserId:", userId);
        
//         if (!userId) {
//           setError("User not authenticated");
//           setLoading(false);
//           return;
//         }

//         // Fetch challenge
//         const challengeData = await challengeService.getChallenge(challengeId);
//         console.log("✅ Challenge:", challengeData);
//         setChallenge(challengeData);

//         // Fetch participants to get current user's participant record
//         const allParticipants = await challengeService.getAllChallengeParticipants();
//         const userParticipant = allParticipants.find(
//           (p) => p.challengeId === challengeId && p.userId === userId
//         );

//         if (!userParticipant) {
//           setError("You are not a participant of this challenge");
//           setLoading(false);
//           return;
//         }

//         console.log("✅ User participant:", userParticipant);
//         setParticipant(userParticipant);

//         // Fetch tasks
//         let tasksData: ChallengeTask[] = [];
//         try {
//           tasksData = await challengeService.getTasksByChallengeId(challengeId);
//           if (!tasksData || tasksData.length === 0) {
//             const allTasks = await challengeService.getAllChallengeTasks();
//             tasksData = allTasks.filter((t) => t.challengeId === challengeId);
//           }
//         } catch (err) {
//           console.warn("Failed to fetch tasks:", err);
//           const allTasks = await challengeService.getAllChallengeTasks();
//           tasksData = allTasks.filter((t) => t.challengeId === challengeId);
//         }

//         console.log("✅ Tasks:", tasksData);

//         // Fetch task progress
//         let progressData: ChallengeTaskProgress[] = [];
//         try {
//           progressData = await challengeService.getProgressByParticipantId(userParticipant.id);
//         } catch (err) {
//           console.warn("Failed to fetch progress:", err);
//           const allProgress = await challengeService.getAllChallengeTaskProgresses();
//           progressData = allProgress.filter((p) => p.participantId === userParticipant.id);
//         }

//         console.log("✅ Task progress:", progressData);

//         // Combine tasks with progress
//         const tasksWithProgress: TaskWithProgress[] = tasksData.map((task) => {
//           const progress = progressData.find((p) => p.challengeTaskId === task.id);
//           return {
//             ...task,
//             progress,
//             isCompleted: progress?.status?.toLowerCase() === "completed",
//           };
//         });

//         console.log("✅ Tasks with progress:", tasksWithProgress);
//         setTasks(tasksWithProgress);
//       } catch (err) {
//         console.error("❌ Error fetching challenge details:", err);
//         setError("Failed to load challenge details. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChallengeDetails();
//   }, [challengeId]);

//   const handleToggleTaskCompletion = async (task: TaskWithProgress) => {
//     if (!participant || !task.id) return;

//     try {
//       setUpdatingTask(task.id);

//       if (task.progress) {
//         // Update existing progress
//         const newStatus = task.isCompleted ? "pending" : "completed";
//         const updateData: ChallengeTaskProgressDTO = {
//           participantId: participant.id,
//           challengeTaskId: task.id,
//           status: newStatus,
//           completedAt: newStatus === "completed" ? new Date().toISOString() : undefined,
//           pointsEarned: newStatus === "completed" ? task.points : 0,
//         };

//         await challengeService.updateChallengeTaskProgress(task.progress.id, updateData);

//         // Update local state
//         setTasks((prevTasks) =>
//           prevTasks.map((t) =>
//             t.id === task.id
//               ? {
//                   ...t,
//                   isCompleted: !task.isCompleted,
//                   progress: {
//                     ...task.progress!,
//                     status: newStatus,
//                     completedAt: newStatus === "completed" ? new Date().toISOString() : undefined,
//                     pointsEarned: newStatus === "completed" ? task.points : 0,
//                   },
//                 }
//               : t
//           )
//         );
//       } else {
//         // Create new progress
//         const newProgressData: ChallengeTaskProgressDTO = {
//           participantId: participant.id,
//           challengeTaskId: task.id,
//           status: "completed",
//           completedAt: new Date().toISOString(),
//           pointsEarned: task.points,
//         };

//         const createdProgress = await challengeService.createChallengeTaskProgress(newProgressData);

//         // Update local state
//         setTasks((prevTasks) =>
//           prevTasks.map((t) =>
//             t.id === task.id
//               ? {
//                   ...t,
//                   isCompleted: true,
//                   progress: createdProgress,
//                 }
//               : t
//           )
//         );
//       }

//       // Update participant stats
//       const completedCount = tasks.filter((t) =>
//         t.id === task.id ? !task.isCompleted : t.isCompleted
//       ).length;
//       const totalPoints = tasks.reduce((sum, t) => {
//         if (t.id === task.id) {
//           return sum + (task.isCompleted ? 0 : task.points || 0);
//         }
//         return sum + (t.isCompleted ? t.points || 0 : 0);
//       }, 0);
//       const percentageCompleted = Math.round((completedCount / tasks.length) * 100);

//       setParticipant((prev) =>
//         prev
//           ? {
//               ...prev,
//               totalPoints,
//               percentageCompleted,
//             }
//           : null
//       );

//       console.log("✅ Task progress updated successfully");
//     } catch (err) {
//       console.error("❌ Error updating task progress:", err);
//       alert("Failed to update task progress. Please try again.");
//     } finally {
//       setUpdatingTask(null);
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case "ongoing":
//       case "active":
//         return "#10b981";
//       case "upcoming":
//       case "scheduled":
//         return "#f59e0b";
//       case "finished":
//       case "completed":
//       case "ended":
//         return "#6b7280";
//       default:
//         return "#6b7280";
//     }
//   };

//   const formatDate = (dateString: string | undefined) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   if (loading) {
//     return (
//       <div className="your-detail-page">
//         <div className="detail-header">
//           <button onClick={() => navigate("/your-challenges")} className="back-button">
//             <ArrowLeft size={24} />
//           </button>
//           <h1 className="header-title">Challenge Details</h1>
//         </div>
//         <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
//           Loading challenge details...
//         </div>
//       </div>
//     );
//   }

//   if (error || !challenge || !participant) {
//     return (
//       <div className="your-detail-page">
//         <div className="detail-header">
//           <button onClick={() => navigate("/your-challenges")} className="back-button">
//             <ArrowLeft size={24} />
//           </button>
//           <h1 className="header-title">Challenge Details</h1>
//         </div>
//         <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
//           {error || "Challenge not found"}
//         </div>
//       </div>
//     );
//   }

//   const completedTasksCount = tasks.filter((t) => t.isCompleted).length;
//   const totalTasksCount = tasks.length;
//   const progressPercentage = totalTasksCount > 0 
//     ? Math.round((completedTasksCount / totalTasksCount) * 100) 
//     : 0;

//   return (
//     <div className="your-detail-page">
//       {/* Header */}
//       <div className="detail-header">
//         <button onClick={() => navigate("/your-challenges")} className="back-button">
//           <ArrowLeft size={24} />
//         </button>
//         <h1 className="header-title">Challenge Details</h1>
//       </div>

//       {/* Hero Section */}
//       <div className="detail-hero">
//         <div className="hero-content">
//           <h1 className="challenge-title">{challenge.title}</h1>
//           <p className="challenge-subtitle">{challenge.taskSummary || challenge.category}</p>
//           <div className="challenge-status-badge" style={{ backgroundColor: getStatusColor(challenge.status) }}>
//             {challenge.status}
//           </div>
//         </div>
//       </div>

//       {/* Stats Overview */}
//       <div className="stats-grid">
//         <div className="stat-card">
//           <div className="stat-icon" style={{ backgroundColor: "#dcfce7", color: "#10b981" }}>
//             <Target size={24} />
//           </div>
//           <div className="stat-content">
//             <div className="stat-label">Tasks Completed</div>
//             <div className="stat-value">
//               {completedTasksCount}/{totalTasksCount}
//             </div>
//           </div>
//         </div>

//         <div className="stat-card">
//           <div className="stat-icon" style={{ backgroundColor: "#dbeafe", color: "#3b82f6" }}>
//             <Trophy size={24} />
//           </div>
//           <div className="stat-content">
//             <div className="stat-label">Total Points</div>
//             <div className="stat-value">{participant.totalPoints || 0}</div>
//           </div>
//         </div>

//         <div className="stat-card">
//           <div className="stat-icon" style={{ backgroundColor: "#fef3c7", color: "#f59e0b" }}>
//             <TrendingUp size={24} />
//           </div>
//           <div className="stat-content">
//             <div className="stat-label">Progress</div>
//             <div className="stat-value">{progressPercentage}%</div>
//           </div>
//         </div>

//         <div className="stat-card">
//           <div className="stat-icon" style={{ backgroundColor: "#fce7f3", color: "#ec4899" }}>
//             <Star size={24} />
//           </div>
//           <div className="stat-content">
//             <div className="stat-label">Current Streak</div>
//             <div className="stat-value">{participant.currentStreak || 0} days</div>
//           </div>
//         </div>
//       </div>

//       {/* Overall Progress Bar */}
//       <div className="progress-section">
//         <div className="progress-header">
//           <h2 className="section-title">Overall Progress</h2>
//           <span className="progress-text">{progressPercentage}%</span>
//         </div>
//         <div className="progress-bar-container">
//           <div 
//             className="progress-bar-fill" 
//             style={{ 
//               width: `${progressPercentage}%`,
//               backgroundColor: "#10b981"
//             }}
//           />
//         </div>
//       </div>

//       {/* Challenge Info */}
//       <div className="info-section">
//         <h2 className="section-title">Challenge Information</h2>
//         <div className="info-grid">
//           <div className="info-item">
//             <Calendar size={20} className="info-icon" />
//             <div>
//               <div className="info-label">Start Date</div>
//               <div className="info-value">{formatDate(challenge.startAt)}</div>
//             </div>
//           </div>
//           <div className="info-item">
//             <Calendar size={20} className="info-icon" />
//             <div>
//               <div className="info-label">End Date</div>
//               <div className="info-value">{formatDate(challenge.endAt)}</div>
//             </div>
//           </div>
//           <div className="info-item">
//             <Clock size={20} className="info-icon" />
//             <div>
//               <div className="info-label">Joined On</div>
//               <div className="info-value">{formatDate(participant.joinedAt)}</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tasks List */}
//       <div className="tasks-section">
//         <h2 className="section-title">Challenge Tasks</h2>
//         {tasks.length === 0 ? (
//           <p style={{ color: "#6b7280", fontStyle: "italic", padding: "20px 0" }}>
//             No tasks available for this challenge.
//           </p>
//         ) : (
//           <div className="tasks-list">
//             {tasks.map((task) => (
//               <div
//                 key={task.id}
//                 className={`task-card ${task.isCompleted ? "completed" : ""}`}
//                 onClick={() => handleToggleTaskCompletion(task)}
//                 style={{ cursor: updatingTask === task.id ? "wait" : "pointer" }}
//               >
//                 <div className="task-checkbox">
//                   {task.isCompleted ? (
//                     <CheckCircle size={24} color="#10b981" fill="#10b981" />
//                   ) : (
//                     <Circle size={24} color="#d1d5db" />
//                   )}
//                 </div>
//                 <div className="task-content">
//                   <h3 className={`task-name ${task.isCompleted ? "completed" : ""}`}>
//                     {task.name}
//                   </h3>
//                   {task.description && (
//                     <p className="task-description">{task.description}</p>
//                   )}
//                   <div className="task-meta">
//                     {task.taskType && (
//                       <span className="task-badge">{task.taskType}</span>
//                     )}
//                     {task.frequencyRule && (
//                       <span className="task-badge">{task.frequencyRule}</span>
//                     )}
//                     {task.isRequired && (
//                       <span className="task-badge required">Required</span>
//                     )}
//                   </div>
//                 </div>
//                 <div className="task-points">
//                   <span className="points-value">{task.points || 0}</span>
//                   <span className="points-label">pts</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default YourDetailPage;