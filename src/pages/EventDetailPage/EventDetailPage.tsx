import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  Users,
  Trophy,
  Calendar,
  Star,
  CheckCircle,
  AlertTriangle,
  Gift,
} from "lucide-react";
import "./EventDetailPage.css";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUserId, selectIsAuthenticated } from "../../store/slices/authSlice";
import {
  Challenge,
  ChallengeRule,
  ChallengeTask,
  ChallengeParticipant,
} from "../../models/challenge";
import { challengeService } from "@/services";
import { useToast } from "../../hooks/useToast";

// Event interface matching API data
interface Event {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  timeRemaining: string;
  participants: string;
  prize: string;
  avatar: string;
  description: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  minPerDay: number;
  howToParticipate: {
    steps: Array<{
      number: number;
      title: string;
      description: string;
    }>;
    rules: string[];
  };
  rewards: {
    grandPrize: {
      amount: string;
      description: string;
    };
    topFinishers: {
      count: number;
      reward: string;
    };
    allCompetitors: {
      reward: string;
    };
  };
  tasks: Array<{
    id?: string;
    name: string;
    description: string;
    taskType: string;
    frequencyRule: string;
    points: number;
    isRequired: boolean;
    validationRule: string;
    startDate: string;
    endDate: string;
  }>;
}

const EventDetailPage: React.FC = () => {
  const { showToast } = useToast();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [isAlreadyJoined, setIsAlreadyJoined] = useState(false);

  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();

  // ✅ Get authenticated user ID from Redux instead of localStorage
  const authenticatedUserId = useSelector(selectUserId);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  console.log("🔐 Event Detail - Auth State:", { isAuthenticated, authenticatedUserId });

  // Fetch challenge data
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) {
        setError("No event ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("🔍 Fetching data for eventId:", eventId);

        // Fetch challenge first
        const challenge = await challengeService.getChallenge(eventId);
        console.log("✅ Challenge fetched:", challenge);

        // Fetch rules, tasks, and participants with individual error handling
        let rules: ChallengeRule[] = [];
        let tasks: ChallengeTask[] = [];
        let participants: ChallengeParticipant[] = [];

        try {
          rules = await challengeService.getRulesByChallengeId(eventId);
          console.log("✅ Rules fetched:", rules);

          if (!rules || rules.length === 0) {
            console.log("⚠️ No rules from specific endpoint, trying to fetch all rules...");
            const allRules = await challengeService.getAllChallengeRules();
            rules = allRules.filter((rule) => rule.challengeId === eventId);
            console.log("✅ Filtered rules:", rules);
          }
        } catch (err) {
          console.warn("⚠️ Failed to fetch rules:", err);
          try {
            const allRules = await challengeService.getAllChallengeRules();
            rules = allRules.filter((rule) => rule.challengeId === eventId);
          } catch (fallbackErr) {
            console.error("❌ Fallback also failed:", fallbackErr);
          }
        }

        try {
          tasks = await challengeService.getTasksByChallengeId(eventId);
          console.log("✅ Tasks fetched:", tasks);

          if (!tasks || tasks.length === 0) {
            console.log("⚠️ No tasks from specific endpoint, trying to fetch all tasks...");
            const allTasks = await challengeService.getAllChallengeTasks();
            tasks = allTasks.filter((task) => task.challengeId === eventId);
            console.log("✅ Filtered tasks:", tasks);
          }
        } catch (err) {
          console.warn("⚠️ Failed to fetch tasks:", err);
          try {
            const allTasks = await challengeService.getAllChallengeTasks();
            tasks = allTasks.filter((task) => task.challengeId === eventId);
          } catch (fallbackErr) {
            console.error("❌ Fallback also failed:", fallbackErr);
          }
        }

        try {
          participants = await challengeService.getParticipantsByChallengeId(eventId);
          console.log("✅ Participants fetched:", participants);

          if (!participants || participants.length === 0) {
            console.log(
              "⚠️ No participants from specific endpoint, trying to fetch all participants..."
            );
            const allParticipants = await challengeService.getAllChallengeParticipants();
            participants = allParticipants.filter((p) => p.challengeId === eventId);
            console.log("✅ Filtered participants:", participants);
          }

          // ✅ Check if current AUTHENTICATED user has already joined
          if (isAuthenticated && authenticatedUserId) {
            const alreadyJoined = participants.some(
              (p) => p.userId.toLowerCase() === authenticatedUserId.toLowerCase()
            );
            setIsAlreadyJoined(alreadyJoined);
            console.log("✅ Already joined:", alreadyJoined);
            console.log("✅ Checking against userId:", authenticatedUserId);
          } else {
            setIsAlreadyJoined(false);
            console.log("⚠️ User not authenticated");
          }
        } catch (err) {
          console.warn("⚠️ Failed to fetch participants:", err);
          try {
            const allParticipants = await challengeService.getAllChallengeParticipants();
            participants = allParticipants.filter((p) => p.challengeId === eventId);

            if (isAuthenticated && authenticatedUserId) {
              const alreadyJoined = participants.some(
                (p) => p.userId.toLowerCase() === authenticatedUserId.toLowerCase()
              );
              setIsAlreadyJoined(alreadyJoined);
            }
          } catch (fallbackErr) {
            console.error("❌ Fallback also failed:", fallbackErr);
          }
        }

        // Transform API data to Event format
        const transformedEvent = transformChallengeToEvent(
          challenge,
          rules[0],
          tasks,
          participants
        );

        console.log("✅ Transformed event:", transformedEvent);

        setEvent(transformedEvent);
        setParticipantCount(participants.length);
      } catch (err) {
        console.error("❌ Error fetching event data:", err);
        setError("Failed to load event details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, authenticatedUserId, isAuthenticated]); // ✅ Re-fetch when auth state changes

  // Transform API data to Event format
  const transformChallengeToEvent = (
    challenge: Challenge,
    rules: ChallengeRule | undefined,
    tasks: ChallengeTask[],
    participants: ChallengeParticipant[]
  ): Event => {
    const startDate = challenge.startAt ? new Date(challenge.startAt) : new Date();
    const endDate = challenge.endAt ? new Date(challenge.endAt) : new Date();
    const durationDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const totalPoints = tasks.reduce((sum, task) => sum + (task.points || 0), 0);
    const minPerDay = Math.ceil(totalPoints / durationDays) || 45;

    let steps: Array<{ number: number; title: string; description: string }> = [];

    if (rules?.howToParticipate) {
      if (Array.isArray(rules.howToParticipate)) {
        steps = rules.howToParticipate.map((step, index) => ({
          number: index + 1,
          title: step,
          description: step,
        }));
      } else if (typeof rules.howToParticipate === "string") {
        try {
          const parsed = JSON.parse(rules.howToParticipate);
          if (Array.isArray(parsed)) {
            steps = parsed.map((step, index) => ({
              number: index + 1,
              title: step,
              description: step,
            }));
          }
        } catch (e) {
          console.warn("Failed to parse howToParticipate string:", e);
        }
      }
    }

    let rulesList: string[] = [];

    if (rules?.ruleText) {
      if (Array.isArray(rules.ruleText)) {
        rulesList = rules.ruleText;
      } else if (typeof rules.ruleText === "string") {
        try {
          const parsed = JSON.parse(rules.ruleText);
          if (Array.isArray(parsed)) {
            rulesList = parsed;
          }
        } catch (e) {
          console.warn("Failed to parse ruleText string:", e);
        }
      }
    }

    return {
      id: challenge.id,
      title: challenge.title,
      subtitle: challenge.taskSummary || challenge.category || "",
      status: challenge.status,
      timeRemaining: getTimeRemaining(challenge),
      participants: `${participants.length} participants`,
      prize: challenge.prizePool ? `$${challenge.prizePool} prize pool` : "No prize pool",
      avatar: getInitials(challenge.title),
      description: challenge.description || "No description available",
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      durationDays,
      minPerDay,
      howToParticipate: {
        steps,
        rules: rulesList,
      },
      rewards: {
        grandPrize: {
          amount: challenge.prizePool ? `$${challenge.prizePool * 0.6}` : "$0",
          description: challenge.prizePool
            ? `$${challenge.prizePool * 0.6} in cash + premium membership`
            : "No prize",
        },
        topFinishers: {
          count: 10,
          reward: "Premium workout gear",
        },
        allCompetitors: {
          reward: "Digital badge & certificate",
        },
      },
      tasks: tasks.map((task) => ({
        id: task.id,
        name: task.name,
        description: task.description || "",
        taskType: task.taskType || "",
        frequencyRule: task.frequencyRule || "",
        points: task.points || 0,
        isRequired: task.isRequired,
        validationRule: task.validationRule || "",
        startDate: task.startDate || challenge.startAt || "",
        endDate: task.endDate || challenge.endAt || "",
      })),
    };
  };

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (title: string) => {
    return title
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

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

  const handleYoursClick = () => {
    navigate("/gamification-feature");
  };

  const handleJoinEvent = async () => {
    if (!event || !eventId) return;

    // ✅ Check if user is authenticated before allowing join
    if (!isAuthenticated || !authenticatedUserId) {
      showToast({ message: "Please log in to join this challenge", severity: "warning" });
      navigate("/auth?mode=signin");
      return;
    }

    try {
      setJoining(true);

      console.log("🆔 Using authenticated userId:", authenticatedUserId);

      // Validate Guid format
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!guidRegex.test(authenticatedUserId)) {
        console.error("❌ Invalid userId format (not a Guid):", authenticatedUserId);
        showToast({
          message: "Invalid user ID format. Please try logging in again.",
          severity: "error",
        });
        return;
      }

      // Validate eventId is a Guid
      if (!guidRegex.test(eventId)) {
        console.error("❌ Invalid eventId format (not a Guid):", eventId);
        showToast({ message: "Invalid event ID format.", severity: "error" });
        return;
      }

      // ✅ Create participant with AUTHENTICATED userId
      const participantData = {
        challengeId: eventId,
        userId: authenticatedUserId, // ✅ Use authenticated user ID
        joinedAt: new Date().toISOString(),
        status: "active",
        totalPoints: 0,
        percentageCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
      };

      console.log("📤 Sending participant data:", participantData);

      await challengeService.createChallengeParticipant(participantData);

      console.log("✅ Successfully joined challenge!");

      // Update participant count and joined status
      setParticipantCount((prev) => prev + 1);
      setIsAlreadyJoined(true);
      setShowJoinDialog(false);

      // Show success message
      showToast({ message: `Successfully joined ${event.title}!`, severity: "success" });

      // Navigate to your challenges page
      navigate("/your-challenges");
    } catch (err: any) {
      console.error("❌ Error joining event:", err);

      // More specific error messages
      if (err.message?.includes("already")) {
        showToast({ message: "You have already joined this challenge!", severity: "info" });
        setIsAlreadyJoined(true);
      } else if (err.status === 400) {
        showToast({
          message:
            "Invalid request. Please check if the challenge exists and you're not already a participant.",
          severity: "error",
        });
      } else {
        showToast({ message: "Failed to join the event. Please try again.", severity: "error" });
      }
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="event-detail-page">
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          Loading event details...
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <div className="event-header">
          <div className="event-header-content">
            <button onClick={handleYoursClick} className="back-button">
              <ArrowLeft size={24} />
            </button>
            <h1 className="header-title">Event Details</h1>
            <div className="header-spacer"></div>
          </div>
        </div>
        <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
          {error || "Event not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      <div className="event-header">
        <div className="event-header-content">
          <button onClick={handleYoursClick} className="back-button">
            <ArrowLeft size={24} />
          </button>
          <h1 className="header-title">Event Details</h1>
          <div className="header-spacer"></div>
        </div>
      </div>

      <h1 className="hero-title">{event.title}</h1>

      <div className="event-content">
        <div className="content-card">
          <div className="card-header">
            <div className="icon-wrapper blue">
              <Star size={20} />
            </div>
            <h2 className="section-title">Event Description</h2>
          </div>
          <p className="description-text">{event.description}</p>
        </div>

        {event.howToParticipate.steps.length > 0 || event.howToParticipate.rules.length > 0 ? (
          <div className="content-card">
            <div className="card-header">
              <div className="icon-wrapper green">
                <CheckCircle size={20} />
              </div>
              <h2 className="section-title">How to Participate</h2>
            </div>
            {event.howToParticipate.steps.length > 0 && (
              <div className="steps-container">
                {event.howToParticipate.steps.map((step) => (
                  <div key={step.number} className="step-item">
                    <div className="step-number">{step.number}</div>
                    <div className="step-content">
                      <h3 className="step-title">{step.title}</h3>
                      <p className="step-description">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {event.howToParticipate.rules.length > 0 && (
              <div className="rules-section">
                <div className="rules-header">
                  <AlertTriangle size={20} className="rules-icon" />
                  <h3 className="rules-title">Challenge Rules</h3>
                </div>
                <ul className="rules-list">
                  {event.howToParticipate.rules.map((rule, index) => (
                    <li key={index} className="rule-item">
                      <span className="bullet">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="content-card">
            <div className="card-header">
              <div className="icon-wrapper green">
                <CheckCircle size={20} />
              </div>
              <h2 className="section-title">How to Participate</h2>
            </div>
            <p style={{ color: "#6b7280", fontStyle: "italic", padding: "20px 0" }}>
              No participation guidelines have been set for this challenge yet.
            </p>
          </div>
        )}

        <div className="content-card">
          <div className="card-header">
            <div className="icon-wrapper purple">
              <Calendar size={20} />
            </div>
            <h2 className="section-title">Event Duration</h2>
          </div>
          <div className="duration-stats">
            <div className="duration-stat">
              <div className="stat-number">{event.durationDays}</div>
              <div className="stat-label">Days Total</div>
            </div>
            <div className="duration-stat">
              <div className="stat-number">{event.tasks.length}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
          </div>
          <div className="date-info">
            <div className="date-item">
              <div className="date-label">Start Date:</div>
              <div className="date-value">{event.startDate}</div>
            </div>
            <div className="date-item right">
              <div className="date-label">End Date:</div>
              <div className="date-value">{event.endDate}</div>
            </div>
          </div>
        </div>

        {event.tasks.length > 0 ? (
          <div className="content-card">
            <div className="card-header">
              <div className="icon-wrapper blue">
                <CheckCircle size={20} />
              </div>
              <h2 className="section-title">Challenge Tasks</h2>
            </div>
            <div className="tasks-list">
              {event.tasks.map((task, index) => (
                <div key={task.id || index} className="task-item">
                  <div className="task-header">
                    <h3 className="task-name">{task.name}</h3>
                    <span className="task-points">{task.points} pts</span>
                  </div>
                  {task.description && <p className="task-description">{task.description}</p>}
                  <div className="task-meta">
                    <span className="task-type">{task.taskType}</span>
                    <span className="task-frequency">{task.frequencyRule}</span>
                    {task.isRequired && <span className="task-required">Required</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="content-card">
            <div className="card-header">
              <div className="icon-wrapper blue">
                <CheckCircle size={20} />
              </div>
              <h2 className="section-title">Challenge Tasks</h2>
            </div>
            <p style={{ color: "#6b7280", fontStyle: "italic", padding: "20px 0" }}>
              No tasks have been created for this challenge yet.
            </p>
          </div>
        )}

        {event.prize && event.prize !== "No prize pool" && (
          <div className="content-card">
            <div className="card-header">
              <div className="icon-wrapper yellow">
                <Gift size={20} />
              </div>
              <h2 className="section-title">Bonus</h2>
            </div>
            <div className="bonus-content">
              <div className="bonus-card">
                <div className="bonus-icon">
                  <Trophy size={32} />
                </div>
                <div className="bonus-details">
                  <h3 className="bonus-title">Prize Pool</h3>
                  <div className="bonus-amount">{event.prize}</div>
                  <p className="bonus-description">
                    Complete the challenge to be eligible for rewards
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="content-card action-section">
          <p className="action-text">
            {isAlreadyJoined
              ? "You're part of this challenge! Keep up the great work!"
              : "Ready to transform your fitness journey?"}
          </p>
          <div className="action-buttons">
            {isAlreadyJoined ? (
              <>
                <button
                  onClick={() => navigate("/your-challenges")}
                  className="join-button"
                  style={{ backgroundColor: "#10b981" }}
                >
                  <CheckCircle className="button-icon" size={20} />
                  View Your Progress
                </button>
                <button onClick={handleYoursClick} className="back-button-alt">
                  Browse More Challenges
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      showToast({
                        message: "Please log in to join this challenge",
                        severity: "warning",
                      });
                      navigate("/auth?mode=signin");
                    } else {
                      setShowJoinDialog(true);
                    }
                  }}
                  className="join-button"
                  disabled={joining}
                >
                  <CheckCircle className="button-icon" size={20} />
                  {joining ? "Joining..." : "Register to Participate"}
                </button>
                <button onClick={handleYoursClick} className="back-button-alt">
                  Go Back
                </button>
              </>
            )}
          </div>
          <p className="participation-info">
            {isAlreadyJoined
              ? `You and ${participantCount - 1} others are participating`
              : `Free to join • ${participantCount} participants`}
          </p>
        </div>
      </div>

      {showJoinDialog && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <h2 className="dialog-title">Join {event.title}?</h2>
            <p className="dialog-text">
              Are you ready to commit to this {event.durationDays}-day challenge?
            </p>
            <div className="dialog-buttons">
              <button
                onClick={() => setShowJoinDialog(false)}
                className="cancel-button"
                disabled={joining}
              >
                Cancel
              </button>
              <button onClick={handleJoinEvent} className="confirm-button" disabled={joining}>
                {joining ? "Joining..." : "Join Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
