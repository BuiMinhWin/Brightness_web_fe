
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EventManagementPage.css";
import { challengeService, Challenge, ChallengeTask } from "@/services/challengeService";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { selectIsAuthenticated, selectUserId, selectUserInfo } from "@/store/slices/authSlice";
import { logoutUser } from "@/store/slices/authSlice";

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

interface EventModal {
  isOpen: boolean;
  type: "create" | "edit";
  event: Event | null;
}

const EventManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState("Month");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const EVENTS_LIMIT = 4;

  const userInfo = useAppSelector(selectUserInfo);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userId = useAppSelector(selectUserId);
  const isAuthLoading = useAppSelector((state) => state.auth.isLoading);
   const [eventModal, setEventModal] = useState<EventModal>({
    isOpen: false,
    type: "create",
    event: null,
  });

  const calculateTimeRemaining = (startDate: string, status: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (status === "active") {
      return `${Math.abs(diffDays)} days remaining`;
    } else if (status === "upcoming") {
      return `${diffDays} days to start`;
    }
    return "Completed";
  };

  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const [showAllEvents, setShowAllEvents] = useState(false);

  const [formData, setFormData] = useState<Partial<Event>>({
    title: "",
    subtitle: "",
    status: "upcoming",
    description: "",
    startDate: "",
    endDate: "",
    durationDays: 0,
    minPerDay: 0,
    prize: "",
    howToParticipate: {
      steps: [{ number: 1, title: "", description: "" }],
      rules: [""],
    },
    rewards: {
      grandPrize: { amount: "", description: "" },
      topFinishers: { count: 0, reward: "" },
      allCompetitors: { reward: "" },
    },
    tasks: [],
  });

  // Check authentication and load challenges
  useEffect(() => {
    console.log("🔍 Auth state check:", { isAuthLoading, isAuthenticated, userId, userInfo });

    // Wait for auth to finish loading
    if (isAuthLoading) {
      console.log("⏳ Auth still loading, waiting...");
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !userId) {
      console.warn("❌ User not authenticated. Redirecting to login...");
      setError("Please login to view challenges");
      setLoading(false);
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate("/auth?mode=signin");
      }, 1500);
      return;
    }

    console.log("✅ User authenticated. Loading challenges...", { userId, userInfo });
    loadChallenges();
  }, [isAuthLoading, isAuthenticated, userId, navigate]);

// Replace the entire loadChallenges function with this fixed version
const loadChallenges = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log("📡 Fetching challenges...");
    const challenges = await challengeService.getAllChallenges();
    console.log("✅ Challenges fetched:", challenges.length);
    console.log("📋 Raw challenges data:", JSON.stringify(challenges, null, 2));
    
    // Transform backend challenges to frontend events format
    const transformedEvents: Event[] = await Promise.all(
      challenges.map(async (challenge) => {
        // Extract challenge ID (handle different response formats)
        const challengeId = challenge.id || (challenge as any)?.data?.id || (challenge as any)?.challengeId;
        
        if (!challengeId) {
          console.error("⚠️ Challenge missing ID:", challenge);
          // Return a basic event without tasks/rules if ID is missing
          return {
            id: `temp-${Date.now()}-${Math.random()}`,
            title: challenge.title || "Untitled Challenge",
            subtitle: new Date(challenge.startAt || "").toLocaleString(),
            status: challenge.status || "unknown",
            timeRemaining: calculateTimeRemaining(challenge.startAt || "", challenge.status || "unknown"),
            participants: "0",
            prize: `$${challenge.prizePool || 0}`,
            avatar: "",
            description: challenge.description || "",
            startDate: challenge.startAt || "",
            endDate: challenge.endAt || "",
            durationDays: calculateDuration(challenge.startAt || "", challenge.endAt || ""),
            minPerDay: 30,
            howToParticipate: { 
              steps: [{ number: 1, title: "", description: "" }], 
              rules: [""] 
            },
            rewards: {
              grandPrize: { amount: `$${challenge.prizePool || 0}`, description: "Grand prize" },
              topFinishers: { count: challenge.maxParticipants || 5, reward: "Equipment" },
              allCompetitors: { reward: "Certificate" },
            },
            tasks: [],
          };
        }

        console.log(`📍 Processing challenge: ${challengeId} - ${challenge.title}`);

        // Load tasks for each challenge
        let tasks: any[] = [];
        try {
          console.log(`🔄 Loading tasks for challenge: ${challengeId}`);
          const challengeTasks = await challengeService.getTasksByChallengeId(challengeId);
          console.log(`✅ Loaded ${challengeTasks.length} tasks for challenge: ${challengeId}`);
          tasks = challengeTasks.map(task => ({
            id: task.id,
            name: task.name,
            description: task.description || "",
            taskType: task.taskType || "daily",
            frequencyRule: task.frequencyRule || "daily",
            points: task.points || 0,
            isRequired: task.isRequired,
            validationRule: task.validationRule || "",
            startDate: task.startDate || "",
            endDate: task.endDate || "",
          }));
        } catch (err: any) {
          console.error(`❌ Error loading tasks for challenge ${challengeId}:`, err?.message || err);
        }

        // Load rules for each challenge
        let rules: string[] = [""];
        let steps: any[] = [{ number: 1, title: "", description: "" }];
        try {
          console.log(`🔄 Loading rules for challenge: ${challengeId}`);
          const challengeRules = await challengeService.getRulesByChallengeId(challengeId);
          console.log(`✅ Loaded ${challengeRules.length} rule sets for challenge: ${challengeId}`);
          if (challengeRules.length > 0) {
            rules = challengeRules[0].ruleText || [""];
            const howToParticipate = challengeRules[0].howToParticipate || [];
            steps = howToParticipate.map((step, idx) => ({
              number: idx + 1,
              title: step,
              description: step,
            }));
          }
        } catch (err: any) {
          console.error(`❌ Error loading rules for challenge ${challengeId}:`, err?.message || err);
        }

        return {
          id: challengeId,
          title: challenge.title,
          subtitle: new Date(challenge.startAt || "").toLocaleString(),
          status: challenge.status,
          timeRemaining: calculateTimeRemaining(challenge.startAt || "", challenge.status),
          participants: "0",
          prize: `$${challenge.prizePool || 0}`,
          avatar: "",
          description: challenge.description || "",
          startDate: challenge.startAt || "",
          endDate: challenge.endAt || "",
          durationDays: calculateDuration(challenge.startAt || "", challenge.endAt || ""),
          minPerDay: 30,
          howToParticipate: { steps, rules },
          rewards: {
            grandPrize: { amount: `$${challenge.prizePool || 0}`, description: "Grand prize" },
            topFinishers: { count: challenge.maxParticipants || 5, reward: "Equipment" },
            allCompetitors: { reward: "Certificate" },
          },
          tasks,
        };
      })
    );

    console.log(`✅ Transformed ${transformedEvents.length} challenges successfully`);
    setEvents(transformedEvents);
    setError(null);
  } catch (err: any) {
    console.error("❌ Error loading challenges:", err);
    
    if (err?.status === 401 || 
        err?.message?.includes("expired") || 
        err?.message?.includes("token")) {
      console.log("🔐 Token expired. Logging out...");
      setError("Session expired. Please login again.");
      await dispatch(logoutUser());
      setTimeout(() => {
        navigate("/auth?mode=signin");
      }, 1500);
    } else {
      setError("Failed to load challenges. " + (err?.message || "Unknown error"));
    }
  } finally {
    setLoading(false);
  }
};

// Replace the entire handleSaveEvent function with this fixed version
const handleSaveEvent = async () => {
  try {
    if (!userId) {
      alert("Unable to get user ID. Please login again.");
      return;
    }

    // Validate required fields
    if (!formData.title?.trim()) {
      alert("Please enter an event title");
      return;
    }

    if (!formData.status) {
      alert("Please select a status");
      return;
    }

    if (!formData.startDate) {
      alert("Please select a start date");
      return;
    }

    if (!formData.endDate) {
      alert("Please select an end date");
      return;
    }

    // Validate end date is after start date
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      alert("End date must be after start date");
      return;
    }

    const formatDateToISO = (dateStr: string | undefined): string | undefined => {
      if (!dateStr) return undefined;
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          throw new Error("Invalid date");
        }
        return date.toISOString();
      } catch (err) {
        console.error("Error formatting date:", dateStr, err);
        return undefined;
      }
    };

    const formattedStartDate = formatDateToISO(formData.startDate);
    const formattedEndDate = formatDateToISO(formData.endDate);

    if (!formattedStartDate || !formattedEndDate) {
      alert("Invalid date format. Please check your dates.");
      return;
    }

    // Helper function to clean array
    const cleanArray = (arr: string[] | undefined): string[] | undefined => {
      if (!arr) return undefined;
      const cleaned = arr.filter(item => item && item.trim() !== "");
      return cleaned.length > 0 ? cleaned : undefined;
    };

    if (eventModal.type === "create") {
      // Build challenge data - only include fields that are actually set
      const challengeData: any = {
        hostUserId: userId,
        title: formData.title.trim(),
        startAt: formattedStartDate,
        endAt: formattedEndDate,
        status: formData.status,
        category: "fitness",
      };

      // Only add optional fields if they have meaningful values
      if (formData.description?.trim()) {
        challengeData.description = formData.description.trim();
      }
      
      if (formData.rewards?.topFinishers?.count && formData.rewards.topFinishers.count > 0) {
        challengeData.maxParticipants = formData.rewards.topFinishers.count;
      }
      
      if (formData.prize?.trim()) {
        const prizeValue = parseFloat(formData.prize.replace(/[^0-9.-]/g, ""));
        if (!isNaN(prizeValue) && prizeValue > 0) {
          challengeData.prizePool = prizeValue;
        }
      }
      
      if (formData.subtitle?.trim()) {
        challengeData.taskSummary = formData.subtitle.trim();
      } else if (formData.description?.trim()) {
        challengeData.taskSummary = formData.description.trim();
      }

      console.log("📤 Sending challenge data:", JSON.stringify(challengeData, null, 2));

      // Create the challenge
      let createdChallenge: any;
      try {
        createdChallenge = await challengeService.createChallenge(challengeData);
        console.log("✅ Challenge created - Full response:", JSON.stringify(createdChallenge, null, 2));
      } catch (createErr: any) {
        console.error("❌ Challenge creation failed:", createErr);
        console.error("Error status:", createErr?.status);
        console.error("Error details:", createErr?.details);
        
        // Try to provide more specific error messages
        if (createErr?.status === 400) {
          const errorDetails = createErr?.details;
          if (errorDetails && typeof errorDetails === 'object') {
            console.error("Validation errors:", JSON.stringify(errorDetails, null, 2));
            if ('errors' in errorDetails) {
              const errors = (errorDetails as any).errors;
              const errorMessages = Object.entries(errors)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                .join('\n');
              alert(`Validation failed:\n${errorMessages}`);
              return;
            }
          }
          alert("Bad Request: The server rejected the challenge data. Please check all fields and try again.");
        } else {
          alert(`Failed to create challenge: ${createErr?.message || 'Unknown error'}`);
        }
        return;
      }

      // Try multiple ways to extract the challenge ID
      let challengeId: string | undefined;
      
      if (typeof createdChallenge === 'string') {
        challengeId = createdChallenge;
        console.log("✅ Challenge ID (string response):", challengeId);
      } else if (createdChallenge && typeof createdChallenge === 'object') {
        // Try all possible locations for the ID
        challengeId = createdChallenge.id || 
                     createdChallenge.challengeId || 
                     createdChallenge.data?.id || 
                     createdChallenge.data?.challengeId ||
                     createdChallenge.result?.id ||
                     createdChallenge.result?.challengeId;
        
        console.log("✅ Challenge ID extracted from object:", challengeId);
        console.log("Available keys in response:", Object.keys(createdChallenge));
      }
      
      if (!challengeId) {
        console.error("❌ No challenge ID found in response!");
        console.error("Response type:", typeof createdChallenge);
        console.error("Response value:", createdChallenge);
        alert("Challenge created but couldn't get ID. Please refresh the page.");
        await loadChallenges();
        setEventModal({ isOpen: false, type: "create", event: null });
        return;
      }

      console.log("✅ Using challenge ID:", challengeId);

      // Create rules if provided
      const howToParticipateSteps = cleanArray(
        formData.howToParticipate?.steps?.map(s => s.title?.trim()).filter(Boolean)
      );
      const ruleTexts = cleanArray(formData.howToParticipate?.rules);

      if (howToParticipateSteps || ruleTexts) {
        try {
          const ruleData = {
            challengeId: challengeId,
            howToParticipate: howToParticipateSteps,
            ruleText: ruleTexts,
          };
          console.log("📤 Creating rules with data:", JSON.stringify(ruleData, null, 2));
          await challengeService.createChallengeRule(ruleData);
          console.log("✅ Rules created successfully");
        } catch (ruleErr: any) {
          console.error("⚠️ Error creating rules:", ruleErr);
          console.warn("Challenge created but rules failed. You can add rules later.");
        }
      }
      
      // Create tasks if provided
      if (formData.tasks && formData.tasks.length > 0) {
        for (const task of formData.tasks) {
          if (!task.name?.trim()) continue;

          try {
            const taskData = {
              challengeId: challengeId,
              name: task.name.trim(),
              description: task.description?.trim() || undefined,
              taskType: task.taskType || "daily",
              frequencyRule: task.frequencyRule?.trim() || undefined,
              points: task.points || 0,
              isRequired: task.isRequired || false,
              validationRule: task.validationRule?.trim() || undefined,
              startDate: formatDateToISO(task.startDate),
              endDate: formatDateToISO(task.endDate),
            };

            console.log("📤 Creating task:", taskData.name);
            await challengeService.createChallengeTask(taskData);
            console.log("✅ Task created:", taskData.name);
          } catch (taskErr: any) {
            console.error("⚠️ Error creating task:", task.name, taskErr);
            console.warn(`Task "${task.name}" failed. You can add it later.`);
          }
        }
      }

      alert("Challenge created successfully!");
      await loadChallenges();
      setEventModal({ isOpen: false, type: "create", event: null });

    } else {
      // Update existing challenge
      const challengeData = {
        hostUserId: userId,
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        startAt: formatDateToISO(formData.startDate),
        endAt: formatDateToISO(formData.endDate),
        status: formData.status,
        maxParticipants: formData.rewards?.topFinishers?.count || undefined,
        prizePool: formData.prize ? parseFloat(formData.prize.replace(/[^0-9.-]/g, "")) : undefined,
        category: "fitness",
        taskSummary: formData.subtitle?.trim() || formData.description?.trim() || undefined,
      };

      console.log("Updating challenge with data:", challengeData);
      await challengeService.updateChallenge(eventModal.event!.id, challengeData);

      // Update rules
      try {
        const existingRules = await challengeService.getRulesByChallengeId(eventModal.event!.id);
        for (const rule of existingRules) {
          await challengeService.deleteChallengeRule(rule.id);
        }

        const howToParticipateSteps = cleanArray(
          formData.howToParticipate?.steps?.map(s => s.title?.trim()).filter(Boolean)
        );
        const ruleTexts = cleanArray(formData.howToParticipate?.rules);

        if (howToParticipateSteps || ruleTexts) {
          const ruleData = {
            challengeId: eventModal.event!.id,
            howToParticipate: howToParticipateSteps,
            ruleText: ruleTexts,
          };
          await challengeService.createChallengeRule(ruleData);
        }
      } catch (err) {
        console.error("Error updating rules:", err);
      }

      // Update tasks
      try {
        const existingTasks = await challengeService.getTasksByChallengeId(eventModal.event!.id);
        for (const task of existingTasks) {
          await challengeService.deleteChallengeTask(task.id);
        }

        if (formData.tasks && formData.tasks.length > 0) {
          for (const task of formData.tasks) {
            if (!task.name?.trim()) continue;

            const taskData = {
              challengeId: eventModal.event!.id,
              name: task.name.trim(),
              description: task.description?.trim() || undefined,
              taskType: task.taskType || "daily",
              frequencyRule: task.frequencyRule?.trim() || undefined,
              points: task.points || 0,
              isRequired: task.isRequired || false,
              validationRule: task.validationRule?.trim() || undefined,
              startDate: formatDateToISO(task.startDate),
              endDate: formatDateToISO(task.endDate),
            };
            await challengeService.createChallengeTask(taskData);
          }
        }
      } catch (err) {
        console.error("Error updating tasks:", err);
      }

      alert("Challenge updated successfully!");
      await loadChallenges();
      setEventModal({ isOpen: false, type: "create", event: null });
    }

  } catch (err: any) {
    console.error("❌ Error saving challenge:", err);
    
    // Enhanced error logging
    console.error("Error details:", {
      name: err?.name,
      message: err?.message,
      status: err?.status,
      details: err?.details,
      stack: err?.stack
    });
  
    // Check for authentication errors
    if (err?.status === 401 || 
      err?.message?.includes("expired") || 
      err?.message?.includes("token") ||
      err?.message?.includes("unauthorized")) {
      alert("Session expired. Please login again.");
      await dispatch(logoutUser());
      navigate("/auth?mode=signin");
      return;
    }

    // Parse and display the actual error message
    let errorMessage = "Failed to save challenge";
    
    if (err?.details && typeof err.details === 'object') {
      if (Array.isArray(err.details.errors)) {
        errorMessage = err.details.errors.map((e: any) => e.message || e).join('\n');
      } else if ('errors' in err.details) {
        const errors = (err.details as any).errors;
        errorMessage = Object.entries(errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
      } else if (err.details.message) {
        errorMessage = err.details.message;
      } else if (err.details.title) {
        errorMessage = err.details.title;
      } else {
        errorMessage = JSON.stringify(err.details, null, 2);
      }
    } else if (err?.message) {
      errorMessage = err.message;
    }

    alert(`Error: ${errorMessage}\n\nPlease check the console for more details.`);
  }
};

  

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const duration = calculateDuration(formData.startDate, formData.endDate);
      setFormData((prev) => ({ ...prev, durationDays: duration }));
    }
  }, [formData.startDate, formData.endDate]);

  const handleCreateEvent = () => {
    setEventModal({ isOpen: true, type: "create", event: null });
    setFormData({
      title: "",
      subtitle: "",
      status: "upcoming",
      description: "",
      startDate: "",
      endDate: "",
      durationDays: 0,
      minPerDay: 0,
      prize: "",
      howToParticipate: {
        steps: [{ number: 1, title: "", description: "" }],
        rules: [""],
      },
      rewards: {
        grandPrize: { amount: "", description: "" },
        topFinishers: { count: 0, reward: "" },
        allCompetitors: { reward: "" },
      },
      tasks: [],
    });
  };

  const handleEditEvent = (event: Event) => {
    setEventModal({ isOpen: true, type: "edit", event });
    setFormData(event);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await challengeService.deleteChallenge(eventId);
        setEvents(events.filter((event) => event.id !== eventId));
      } catch (err) {
        console.error("Error deleting challenge:", err);
        alert("Failed to delete challenge");
      }
    }
  };


  // Task management functions
  const addTask = () => {
    const newTasks = [...(formData.tasks || [])];
    newTasks.push({
      name: "",
      description: "",
      taskType: "daily",
      frequencyRule: "daily",
      points: 10,
      isRequired: false,
      validationRule: "",
      startDate: formData.startDate || "",
      endDate: formData.endDate || "",
    });
    setFormData((prev) => ({ ...prev, tasks: newTasks }));
  };

  const updateTask = (index: number, field: string, value: any) => {
    const newTasks = [...(formData.tasks || [])];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setFormData((prev) => ({ ...prev, tasks: newTasks }));
  };

  const removeTask = (index: number) => {
    const newTasks = formData.tasks?.filter((_, i) => i !== index) || [];
    setFormData((prev) => ({ ...prev, tasks: newTasks }));
  };

  const addStep = () => {
    const newSteps = [...(formData.howToParticipate?.steps || [])];
    newSteps.push({
      number: newSteps.length + 1,
      title: "",
      description: "",
    });
    setFormData((prev) => ({
      ...prev,
      howToParticipate: {
        ...prev.howToParticipate!,
        steps: newSteps,
      },
    }));
  };

  const updateStep = (index: number, field: "title" | "description", value: string) => {
    const newSteps = [...(formData.howToParticipate?.steps || [])];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      howToParticipate: {
        ...prev.howToParticipate!,
        steps: newSteps,
      },
    }));
  };

  const removeStep = (index: number) => {
    const newSteps = formData.howToParticipate?.steps.filter((_, i) => i !== index) || [];
    const renumberedSteps = newSteps.map((step, i) => ({ ...step, number: i + 1 }));
    setFormData((prev) => ({
      ...prev,
      howToParticipate: {
        ...prev.howToParticipate!,
        steps: renumberedSteps,
      },
    }));
  };

  const addRule = () => {
    const newRules = [...(formData.howToParticipate?.rules || [])];
    newRules.push("");
    setFormData((prev) => ({
      ...prev,
      howToParticipate: {
        ...prev.howToParticipate!,
        rules: newRules,
      },
    }));
  };

  const updateRule = (index: number, value: string) => {
    const newRules = [...(formData.howToParticipate?.rules || [])];
    newRules[index] = value;
    setFormData((prev) => ({
      ...prev,
      howToParticipate: {
        ...prev.howToParticipate!,
        rules: newRules,
      },
    }));
  };

  const removeRule = (index: number) => {
    const newRules = formData.howToParticipate?.rules.filter((_, i) => i !== index) || [];
    setFormData((prev) => ({
      ...prev,
      howToParticipate: {
        ...prev.howToParticipate!,
        rules: newRules,
      },
    }));
  };

  // Calendar functionality
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventForDate = (date: Date) => {
    return events.filter((event) => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  const getEventClass = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("core")) return "event-core-clash";
    if (titleLower.includes("step")) return "event-stepup-sprint";
    if (titleLower.includes("burn")) return "event-3day-burn";
    if (titleLower.includes("sweat")) return "event-sweat-win";
    return "";
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    const days = [];

    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
      const dayEvents = getEventForDate(date);

      days.push(
        <div key={`prev-${day}`} className="calendar-day other-month">
          <div className="calendar-day-number">{day}</div>
          {dayEvents.map((event) => (
            <div key={event.id} className={`calendar-event ${getEventClass(event.title)}`}>
              {event.title}
            </div>
          ))}
        </div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday =
        currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() === today.getMonth() &&
        day === today.getDate();
      const dayEvents = getEventForDate(date);

      days.push(
        <div key={day} className={`calendar-day ${isToday ? "today" : ""}`}>
          <div className="calendar-day-number">{day}</div>
          {dayEvents.map((event) => (
            <div key={event.id} className={`calendar-event ${getEventClass(event.title)}`}>
              {event.title}
            </div>
          ))}
        </div>
      );
    }

    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
      const dayEvents = getEventForDate(date);

      days.push(
        <div key={`next-${day}`} className="calendar-day other-month">
          <div className="calendar-day-number">{day}</div>
          {dayEvents.map((event) => (
            <div key={event.id} className={`calendar-event ${getEventClass(event.title)}`}>
              {event.title}
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  const formatTodayDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return `Today ${today.toLocaleDateString("en-GB", options)}`;
  };

  // Show loading state
  if (loading || isAuthLoading) {
    return (
      <div className="event-management-page">
        <div style={{padding: "40px", textAlign: "center"}}>
          {isAuthLoading ? "Checking authentication..." : "Loading challenges..."}
        </div>
      </div>
    );
  }

  // Show error if it's an auth error
  if (error && error.includes("Session expired")) {
    return (
      <div className="event-management-page">
        <div style={{padding: "40px", textAlign: "center", color: "#ff4444"}}>
          <h3>{error}</h3>
          <p>Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  // Ensure the component always returns JSX (ReactNode)
  return (
    <div className="event-management-page">
      <div className="event-management-content">
        <div className="event-management-hero">
          <h1 className="event-management-title">Calendar</h1>
          {userInfo && (
            <div style={{fontSize: "14px", color: "#666", marginTop: "8px"}}>
              Logged in as: <strong>{userInfo.fullName || userInfo.email || userId}</strong>
            </div>
          )}
        </div>

        <div className="event-management-main">
          <div className="events-sidebar">
  <div className="sidebar-header">
    <button className="add-event-btn" onClick={handleCreateEvent}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" />
        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" />
      </svg>
      Add New Event
    </button>
  </div>

  <div className="events-coming-soon">Event coming soon</div>

  {/* ✅ SỬ DỤNG CLASS TỪ CSS */}
  <div className="events-list-wrapper">
    <div className="events-list">
      {events.length === 0 ? (
        <div style={{padding: "20px", textAlign: "center", color: "#999"}}>
          No events yet. Click "Add New Event" to create one.
        </div>
      ) : (
        events.slice(0, showAllEvents ? events.length : EVENTS_LIMIT).map((event) => (
          <div key={event.id} className="event-item" onClick={() => handleEditEvent(event)}>
            <div className="event-avatar">{event.title.charAt(0)}</div>
            <div className="event-info">
              <div className="event-title">{event.title}</div>
              <div className="event-details">{event.subtitle}</div>
              <div className="event-location">{event.description}</div>
              <div className="event-participants">
                <div className="participant-avatars">
                  <div className="participant-avatar">A</div>
                  <div className="participant-avatar">B</div>
                  <div className="participant-avatar">C</div>
                </div>
                <div className="participant-count">{event.participants}+</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>

  {events.length > EVENTS_LIMIT && (
    <button 
      className="see-more-btn"
      onClick={() => setShowAllEvents(!showAllEvents)}
    >
      {showAllEvents ? "Show Less" : `See More (${events.length - EVENTS_LIMIT} more)`}
    </button>
  )}
</div>
          <div className="calendar-section">
            <div className="calendar-header">
              <div className="calendar-controls">
                <div className="today-info">{formatTodayDate()}</div>

                <div className="calendar-nav-wrapper">
                  <button className="calendar-nav-btn prev" onClick={() => navigateMonth("prev")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>

                  <h3 className="calendar-title">
                    {new Date(currentDate).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>

                  <button className="calendar-nav-btn next" onClick={() => navigateMonth("next")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                </div>

                <div className="view-toggles">
                  {["Day", "Week", "Month"].map((view) => (
                    <button
                      key={view}
                      className={`view-toggle ${activeView === view ? "active" : ""}`}
                      onClick={() => setActiveView(view)}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="calendar-grid">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
                <div key={day} className="calendar-day-header">
                  {day}
                </div>
              ))}
              {renderCalendar()}
            </div>
          </div>
        </div>
      </div>
    {/* All Events Table Modal */}
      {showAllEvents && (
        <div className="modal-overlay" onClick={() => setShowAllEvents(false)}>
          <div className="events-table-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-modal-header">
              <h2 className="event-modal-title">All Challenges</h2>
              <button 
                onClick={() => setShowAllEvents(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{overflowY: "auto", maxHeight: "70vh"}}>
              <table style={{width: "100%", borderCollapse: "collapse"}}>
                <thead>
                  <tr style={{backgroundColor: "#f5f5f5", borderBottom: "2px solid #e0e0e0"}}>
                    <th style={{padding: "12px", textAlign: "left", fontWeight: "600"}}>Title</th>
                    <th style={{padding: "12px", textAlign: "left", fontWeight: "600"}}>Status</th>
                    <th style={{padding: "12px", textAlign: "left", fontWeight: "600"}}>Start Date</th>
                    <th style={{padding: "12px", textAlign: "left", fontWeight: "600"}}>End Date</th>
                    <th style={{padding: "12px", textAlign: "left", fontWeight: "600"}}>Prize</th>
                    <th style={{padding: "12px", textAlign: "center", fontWeight: "600"}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr 
                      key={event.id}
                      style={{
                        borderBottom: "1px solid #e0e0e0",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9f9f9"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <td style={{padding: "12px"}}>
                        <div style={{fontWeight: "600", marginBottom: "4px"}}>{event.title}</div>
                        <div style={{fontSize: "12px", color: "#666"}}>{event.description}</div>
                      </td>
                      <td style={{padding: "12px"}}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          backgroundColor: 
                            event.status === "active" ? "#e8f5e9" :
                            event.status === "upcoming" ? "#e3f2fd" :
                            event.status === "completed" ? "#f5f5f5" : "#ffebee",
                          color:
                            event.status === "active" ? "#2e7d32" :
                            event.status === "upcoming" ? "#1565c0" :
                            event.status === "completed" ? "#666" : "#c62828"
                        }}>
                          {event.status}
                        </span>
                      </td>
                      <td style={{padding: "12px", fontSize: "14px"}}>
                        {new Date(event.startDate).toLocaleDateString()}
                      </td>
                      <td style={{padding: "12px", fontSize: "14px"}}>
                        {new Date(event.endDate).toLocaleDateString()}
                      </td>
                      <td style={{padding: "12px", fontWeight: "600", color: "#4CAF50"}}>
                        {event.prize}
                      </td>
                      <td style={{padding: "12px", textAlign: "center"}}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAllEvents(false);
                            handleEditEvent(event);
                          }}
                          style={{
                            padding: "6px 16px",
                            background: "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            marginRight: "8px"
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                            if (events.length <= 5) setShowAllEvents(false);
                          }}
                          style={{
                            padding: "6px 16px",
                            background: "#ff4444",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px"
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



    {/* Create/Edit Event Modal */}
    {eventModal.isOpen && (
    <div
    className="modal-overlay"
    onClick={() => setEventModal({ isOpen: false, type: "create", event: null })}
    >
    <div className="event-modal" onClick={(e) => e.stopPropagation()}>
      <div className="event-modal-header">
        <h2 className="event-modal-title">
          {eventModal.type === "create" ? "Create New Challenge" : "Edit Challenge"}
        </h2>
        <p className="event-modal-subtitle">
          Fill in the details below to {eventModal.type === "create" ? "create" : "update"} your challenge
        </p>
      </div>

      <div className="event-modal-content">
        {/* Basic Information */}
        <div className="form-section">
          <h3 className="form-section-title">Basic Information</h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Challenge Title *</label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter challenge title"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the challenge"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Task Summary (Brief Overview)</label>
            <input
              type="text"
              className="form-input"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g., Complete daily fitness tasks for 30 days"
            />
          </div>
        </div>

        {/* Schedule & Settings */}
        <div className="form-section">
          <h3 className="form-section-title">Schedule & Settings</h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.startDate?.split("T")[0] || ""}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.endDate?.split("T")[0] || ""}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Duration (Auto-calculated)</label>
              <input
                type="number"
                className="form-input"
                value={formData.durationDays}
                readOnly
                placeholder="Auto-calculated from dates"
                style={{backgroundColor: "#f5f5f5"}}
              />
            </div>
              <div className="form-group">
                <label className="form-label">Max Participants</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.rewards?.topFinishers?.count || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rewards: {
                        ...formData.rewards!,
                        topFinishers: {
                          ...formData.rewards!.topFinishers,
                          count: parseInt(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

          <div className="form-group">
            <label className="form-label">Prize Pool (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={formData.prize}
              onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
              placeholder="e.g., $500, 1000, etc."
            />
            <small style={{color: "#666", fontSize: "12px"}}>Enter amount with or without $ sign</small>
          </div>
        </div>

        {/* Challenge Tasks */}
        <div className="form-section">
          <h3 className="form-section-title">Challenge Tasks</h3>
          <p style={{fontSize: "14px", color: "#666", marginBottom: "16px"}}>
            Define specific tasks that participants need to complete
          </p>

          <div className="tasks-list">
            {formData.tasks?.map((task, index) => (
              <div key={index} className="task-item" style={{border: "1px solid #e0e0e0", padding: "16px", borderRadius: "8px", marginBottom: "12px", backgroundColor: "#fafafa"}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px"}}>
                  <h4 style={{margin: 0, fontSize: "16px", fontWeight: "600"}}>Task {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    style={{background: "#ff4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "13px"}}
                  >
                    Remove
                  </button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Task Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={task.name}
                      onChange={(e) => updateTask(index, "name", e.target.value)}
                      placeholder="e.g., Complete 10,000 steps"
                      style={{backgroundColor: "white"}}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Task Type</label>
                    <select
                      className="form-select"
                      value={task.taskType}
                      onChange={(e) => updateTask(index, "taskType", e.target.value)}
                      style={{backgroundColor: "white"}}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="one-time">One-time</option>
                      <option value="milestone">Milestone</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={task.description}
                    onChange={(e) => updateTask(index, "description", e.target.value)}
                    placeholder="Describe the task requirements"
                    rows={2}
                    style={{backgroundColor: "white"}}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Frequency Rule</label>
                    <input
                      type="text"
                      className="form-input"
                      value={task.frequencyRule}
                      onChange={(e) => updateTask(index, "frequencyRule", e.target.value)}
                      placeholder="e.g., Once per day, 3x per week"
                      style={{backgroundColor: "white"}}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Points</label>
                    <input
                      type="number"
                      className="form-input"
                      value={task.points}
                      onChange={(e) => updateTask(index, "points", parseInt(e.target.value) || 0)}
                      placeholder="Points earned"
                      style={{backgroundColor: "white"}}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Validation Rule</label>
                    <input
                      type="text"
                      className="form-input"
                      value={task.validationRule}
                      onChange={(e) => updateTask(index, "validationRule", e.target.value)}
                      placeholder="How to validate completion"
                      style={{backgroundColor: "white"}}
                    />
                  </div>
                  <div className="form-group" style={{display: "flex", alignItems: "center", paddingTop: "28px"}}>
                    <label style={{display: "flex", alignItems: "center", cursor: "pointer"}}>
                      <input
                        type="checkbox"
                        checked={task.isRequired}
                        onChange={(e) => updateTask(index, "isRequired", e.target.checked)}
                        style={{marginRight: "8px", width: "18px", height: "18px"}}
                      />
                      <span>Required Task</span>
                    </label>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Task Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={task.startDate}
                      onChange={(e) => updateTask(index, "startDate", e.target.value)}
                      style={{backgroundColor: "white"}}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Task End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={task.endDate}
                      onChange={(e) => updateTask(index, "endDate", e.target.value)}
                      style={{backgroundColor: "white"}}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            type="button" 
            onClick={addTask}
            style={{width: "100%", padding: "12px", background: "#4CAF50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600"}}
          >
            + Add Task
          </button>
        </div>

        {/* How to Participate */}
        <div className="form-section">
          <h3 className="form-section-title">How to Participate</h3>
          <p style={{fontSize: "14px", color: "#666", marginBottom: "16px"}}>
            Add steps and rules for participants (optional)
          </p>

          <label className="form-label">Participation Steps</label>
          <div className="steps-list">
            {formData.howToParticipate?.steps.map((step, index) => (
              <div key={index} className="step-item" style={{display: "flex", gap: "12px", marginBottom: "8px"}}>
                <div style={{minWidth: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#4CAF50", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600"}}>
                  {step.number}
                </div>
                <div style={{flex: 1}}>
                  <input
                    type="text"
                    className="form-input"
                    value={step.title}
                    onChange={(e) => updateStep(index, "title", e.target.value)}
                    placeholder={`Step ${step.number} title`}
                  />
                </div>
                {formData.howToParticipate!.steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    style={{padding: "8px 12px", background: "#ff4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer"}}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button 
            type="button" 
            onClick={addStep}
            style={{marginTop: "8px", padding: "8px 16px", background: "transparent", color: "#4CAF50", border: "1px solid #4CAF50", borderRadius: "6px", cursor: "pointer", fontSize: "14px"}}
          >
            + Add Step
          </button>

          <label className="form-label" style={{ marginTop: "24px" }}>Rules</label>
          <div className="rules-list">
            {formData.howToParticipate?.rules.map((rule, index) => (
              <div key={index} style={{display: "flex", gap: "8px", marginBottom: "8px"}}>
                <input
                  type="text"
                  className="form-input"
                  value={rule}
                  onChange={(e) => updateRule(index, e.target.value)}
                  placeholder={`Rule ${index + 1}`}
                  style={{flex: 1}}
                />
                {formData.howToParticipate!.rules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    style={{padding: "8px 12px", background: "#ff4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer"}}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button 
            type="button" 
            onClick={addRule}
            style={{marginTop: "8px", padding: "8px 16px", background: "transparent", color: "#4CAF50", border: "1px solid #4CAF50", borderRadius: "6px", cursor: "pointer", fontSize: "14px"}}
          >
            + Add Rule
          </button>
        </div>
      </div>

      <div className="event-modal-actions">
        <button
          className="modal-btn secondary"
          onClick={() => setEventModal({ isOpen: false, type: "create", event: null })}
        >
          Cancel
        </button>
        <button className="modal-btn primary" onClick={handleSaveEvent}>
          {eventModal.type === "create" ? "Create Challenge" : "Update Challenge"}
        </button>
      </div>
    </div>
    </div>
    )}
    </div>
  ); 
};

export default EventManagementPage;