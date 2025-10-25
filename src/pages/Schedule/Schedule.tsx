import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/hooks/useToast";
import {
  personalCoachService,
  WorkoutScheduleResponse,
  ScheduleDayDetail,
  AIUsageLimits,
  AICreditBalance,
  ExerciseLibraryDTO,
  ConflictingWorkout,
} from "@/services/personalCoachService";
import {
  type Challenge,
  type ChallengeTask,
  type ChallengeTaskProgressDTO,
  type ChallengeTaskProgress,
} from "@/models/challenge";
import { challengeService } from "@/services/challengeService";
import chatService from "@/services/chatService";
import WorkoutFeedbackModal, { WorkoutFeedbackData } from "@/components/WorkoutFeedbackModal";
import RegenerateScheduleModal, {
  RegenerateRequestData,
} from "@/components/RegenerateScheduleModal";
import EditWorkoutDayModal, { EditWorkoutDayData } from "@/components/EditWorkoutDayModal";
import UpgradePrompt from "@/components/UpgradePrompt";
import ScheduleSidebar, { GenerateWorkoutFormData } from "@/components/schedule/ScheduleSidebar";
import ScheduleConflictDialog from "@/components/schedule/ScheduleConflictDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FitnessCenter,
  Schedule as ScheduleIcon,
  AccessTime,
  Hotel,
  ChevronLeft,
  ChevronRight,
  Add,
  AutoAwesome,
  Refresh,
  History,
  CheckCircle,
  EmojiEvents,
} from "@mui/icons-material";
import { Tooltip, Snackbar, Alert } from "@mui/material";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkoutEvent {
  id: string;
  title: string;
  time: string;
  date: string; // ISO date format
  focusArea: string;
  exercises: number; // Number of exercises
  duration: number; // Estimated duration in minutes
  dayDetail: ScheduleDayDetail; // Full day details
}

interface ChallengeCalendarEvent {
  id: string;
  date: string;
  title: string;
  challengeId: string;
  challengeTitle: string;
  participantId: string;
  task?: ChallengeTask; // Made optional
  status?: string;
  progress: number;
  completed: boolean;
  targetDate?: string;
  completionPercentage?: number; // Add completion percentage for the whole challenge
  isChallengeDurationEvent?: boolean; // New flag to distinguish duration events
}

// Define a local interface to extend ChallengeTask with missing properties
interface ChallengeTaskWithScheduleInfo extends ChallengeTask {
  scheduledDate?: string;
  dayOffset?: number;
}
type CalendarEvent = WorkoutEvent | ChallengeCalendarEvent;

const Schedule: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [workoutSchedules, setWorkoutSchedules] = useState<WorkoutScheduleResponse[]>([]);
  const [events, setEvents] = useState<WorkoutEvent[]>([]);
  const [challengeEvents, setChallengeEvents] = useState<ChallengeCalendarEvent[]>([]);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<ScheduleDayDetail | null>(null);
  const [selectedWorkoutDate, setSelectedWorkoutDate] = useState<string>("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackWorkout, setFeedbackWorkout] = useState<{
    scheduleId: string;
    scheduleDayId: string;
    dayNumber: number;
    title: string;
  } | null>(null);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<ScheduleDayDetail | null>(null);
  const [aiUsageLimits, setAiUsageLimits] = useState<AIUsageLimits | null>(null);
  const [creditBalance, setCreditBalance] = useState<AICreditBalance | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [showDropConfirm, setShowDropConfirm] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<{
    exercise: ExerciseLibraryDTO;
    date: Date;
    dateStr: string;
    existingWorkout: any;
  } | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictingWorkouts, setConflictingWorkouts] = useState<ConflictingWorkout[]>([]);
  const [pendingGeneration, setPendingGeneration] = useState<GenerateWorkoutFormData | null>(null);
  const [showTemplateReplaceDialog, setShowTemplateReplaceDialog] = useState(false);
  const [pendingTemplateReplace, setPendingTemplateReplace] = useState<{
    template: any;
    date: Date;
    existingWorkout: any;
  } | null>(null);
  const [workoutClickTrigger, setWorkoutClickTrigger] = useState(0);
  const userId = useAppSelector((state) => state.auth.userId);
  const userInfo = useAppSelector((state) => state.auth.userInfo);
  const isPaidUser = userInfo?.subscriptionPlanId != null;

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toDateOnlyString = (value?: string | null): string | null => {
    if (!value) {
      return null;
    }
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) {
      return null;
    }
    return new Date(parsed).toISOString().split("T")[0];
  };

  const pickFirstValidDate = (values: Array<string | null | undefined>): string | null => {
    for (const candidate of values) {
      const normalized = toDateOnlyString(candidate ?? null);
      if (normalized) {
        return normalized;
      }
    }
    return null;
  };

  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isProgressEntryCompleted = (progress: ChallengeTaskProgress): boolean => {
    if (!progress) {
      return false;
    }
    if (progress.completedAt) {
      return true;
    }
    if (!progress.status) {
      return false;
    }
    const normalized = progress.status.toLowerCase();
    return normalized === "completed" || normalized === "done" || normalized === "finished";
  };

  // Fetch AI usage limits (Legacy)
  const fetchAIUsageLimits = async () => {
    if (!userId) return;

    try {
      const limits = await personalCoachService.getAIUsageLimits(userId);
      setAiUsageLimits(limits);
    } catch (error) {
      console.error("Failed to fetch AI usage limits:", error);
    }
  };

  // Fetch AI credit balance (NEW)
  const fetchAICreditBalance = async () => {
    if (!userId) return;

    try {
      const balance = await personalCoachService.getAICreditBalance(userId);
      setCreditBalance(balance);
    } catch (error) {
      console.error("Failed to fetch AI credit balance:", error);
      // Fall back to legacy limits if credit balance fails
      await fetchAIUsageLimits();
    }
  };

  // Fetch user's workout schedules
  const fetchSchedules = async () => {
    if (!userId) {
      console.log("No userId available, skipping schedule fetch");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("📅 Fetching schedules for user:", userId);
      const schedules = await personalCoachService.getUserSchedules(userId);
      console.log("✅ Schedules fetched:", schedules);
      setWorkoutSchedules(schedules);

      // Only use the latest schedule (prioritize IsLatest flag, fallback to most recent)
      if (schedules.length > 0) {
        const latestSchedule = schedules.find((s) => s.isLatest) || schedules[0];
        console.log(
          "📌 Using latest schedule:",
          latestSchedule.scheduleName,
          "IsLatest:",
          latestSchedule.isLatest
        );

        // Convert latest schedule to calendar events using actual dates from backend
        const calendarEvents: WorkoutEvent[] = [];

        latestSchedule.days.forEach((day) => {
          // Use the actual date provided by the backend
          const eventDate = day.date.split("T")[0]; // Extract just the date part (YYYY-MM-DD)

          calendarEvents.push({
            id: `${latestSchedule.scheduleId}-day-${day.dayNumber}`,
            title: day.focusArea || day.dayType,
            time: `${day.estimatedDuration} min workout`,
            date: eventDate,
            focusArea: day.focusArea,
            exercises: day.exercises.length,
            duration: day.estimatedDuration,
            dayDetail: day, // Store full day details
          });
        });

        setEvents(calendarEvents);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("❌ Error fetching schedules:", err);
      setError(err instanceof Error ? err.message : "Failed to load schedules");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChallenges = async () => {
    if (!userId) return;

    setChallengeLoading(true);
    setChallengeError(null);

    try {
      const joinedChallenges = await challengeService.getParticipantsByUserId(userId);
      console.log("Joined challenges participants:", joinedChallenges); // Log joined challenges
      const calendarEvents: ChallengeCalendarEvent[] = [];

      for (const participant of joinedChallenges) {
        // Fetch all challenges once and then get details from the map. This avoids multiple API calls for getChallenge(id).
        const allChallenges = await challengeService.getAllChallenges();
        const challengeMap = new Map(allChallenges.map((c) => [c.id, c]));

        const challengeDetails = challengeMap.get(participant.challengeId);

        if (challengeDetails) {
          // Fetch the latest progress for the current participant once
          const participantProgress = await challengeService.getProgressByParticipantId(
            participant.id
          );
          console.log(`Latest progress for participant ${participant.id}:`, participantProgress);
          // Ensure challengeDetails exist
          console.log("Participant data:", participant); // Log participant data
          console.log("Challenge details for participant:", challengeDetails); // Log challenge details
          // --- START: Calculate overall challenge progress ---
          let totalDays = 0;
          let completedDays = 0;
          if (challengeDetails.startAt && challengeDetails.endAt) {
            const start = new Date(challengeDetails.startAt);
            const end = new Date(challengeDetails.endAt);
            totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            if (participantProgress) {
              const completedDates = new Set(
                participantProgress
                  .filter((p) => isProgressEntryCompleted(p) && p.targetDate)
                  .map((p) => toDateOnlyString(p.targetDate))
              );
              completedDays = completedDates.size;
            }
          }
          const completionPercentage = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
          // --- END: Calculate overall challenge progress ---

          const tasks = await challengeService.getTasksByChallengeId(challengeDetails.id);

          // Map tasks by their scheduled date or calculated date for quick lookup
          // Also identify a general daily check-in task if it exists
          const tasksBySpecificDate: { [date: string]: ChallengeTask[] } = {};
          let dailyCheckInTask: ChallengeTask | undefined;

          for (const task of tasks) {
            const taskWithScheduleInfo = task as ChallengeTaskWithScheduleInfo;
            if (taskWithScheduleInfo.scheduledDate) {
              const taskEventDate = toDateOnlyString(taskWithScheduleInfo.scheduledDate);
              if (taskEventDate) {
                if (!tasksBySpecificDate[taskEventDate]) {
                  tasksBySpecificDate[taskEventDate] = [];
                }
                tasksBySpecificDate[taskEventDate].push(task);
              }
            } else if (taskWithScheduleInfo.dayOffset !== undefined && challengeDetails.startAt) {
              const startDate = new Date(challengeDetails.startAt);
              startDate.setDate(startDate.getDate() + taskWithScheduleInfo.dayOffset);
              const taskEventDate = toDateOnlyString(startDate.toISOString());
              if (taskEventDate) {
                if (!tasksBySpecificDate[taskEventDate]) {
                  tasksBySpecificDate[taskEventDate] = [];
                }
                tasksBySpecificDate[taskEventDate].push(task);
              }
            } else if (task.taskType === "Daily" || task.taskType === "DailyCheckIn") {
              // This is a general daily task, not tied to a specific scheduledDate or dayOffset
              dailyCheckInTask = task;
            }
          }

          // Iterate through each day of the challenge duration to create events
          if (challengeDetails.startAt && challengeDetails.endAt) {
            const startDate = new Date(challengeDetails.startAt);
            const endDate = new Date(challengeDetails.endAt);
            let currentDateIterator = new Date(startDate);

            while (currentDateIterator <= endDate) {
              const dateStr = toDateOnlyString(currentDateIterator.toISOString());
              if (dateStr) {
                const tasksForThisDate = tasksBySpecificDate[dateStr] || [];
                let eventAddedForThisDate = false;

                if (tasksForThisDate.length > 0) {
                  // Add events for specific tasks scheduled for this date
                  for (const task of tasksForThisDate) {
                    console.log(
                      `  Processing task "${task.name}" (ID: ${task.id}) for date: ${dateStr}`
                    );
                    const taskProgress = participantProgress?.find((p: ChallengeTaskProgress) => {
                      const progressTargetDate = toDateOnlyString(p.targetDate);
                      console.log(
                        `    Comparing progress (ID: ${p.id}, TaskID: ${p.challengeTaskId}, TargetDate: ${progressTargetDate}, Status: ${p.status}) with current (TaskID: ${task.id}, Date: ${dateStr})`
                      );
                      return p.challengeTaskId === task.id && progressTargetDate === dateStr;
                    });
                    const completed = taskProgress ? isProgressEntryCompleted(taskProgress) : false;

                    calendarEvents.push({
                      id: `challenge-${task.id}-${participant.id}-${dateStr}`, // Unique ID for task on specific date
                      date: dateStr,
                      title: task.name,
                      challengeId: participant.challengeId,
                      challengeTitle: challengeDetails.title,
                      participantId: participant.id,
                      task: task,
                      completed: completed,
                      progress:
                        (taskProgress as ChallengeTaskProgress & { progressValue: number })
                          ?.progressValue || 0,
                      completionPercentage: completionPercentage,
                      isChallengeDurationEvent: false,
                    });
                    eventAddedForThisDate = true;
                  }
                } else if (dailyCheckInTask) {
                  // If no specific tasks, but there's a general daily check-in task
                  console.log(
                    `  Processing daily check-in task "${dailyCheckInTask.name}" (ID: ${dailyCheckInTask.id}) for date: ${dateStr}`
                  );
                  const taskProgress = participantProgress?.find((p: ChallengeTaskProgress) => {
                    const progressTargetDate = toDateOnlyString(p.targetDate);
                    console.log(
                      `    Comparing progress (ID: ${p.id}, TaskID: ${p.challengeTaskId}, TargetDate: ${progressTargetDate}, Status: ${p.status}) with current (TaskID: ${dailyCheckInTask.id}, Date: ${dateStr})`
                    );
                    return (
                      p.challengeTaskId === dailyCheckInTask.id && progressTargetDate === dateStr
                    );
                  });
                  const completed = taskProgress ? isProgressEntryCompleted(taskProgress) : false;

                  calendarEvents.push({
                    id: `challenge-${dailyCheckInTask.id}-${participant.id}-${dateStr}`,
                    date: dateStr,
                    title: dailyCheckInTask.name,
                    challengeId: participant.challengeId,
                    challengeTitle: challengeDetails.title,
                    participantId: participant.id,
                    task: dailyCheckInTask,
                    completed: completed,
                    progress:
                      (taskProgress as ChallengeTaskProgress & { progressValue: number })
                        ?.progressValue || 0,
                    completionPercentage: completionPercentage,
                    isChallengeDurationEvent: false, // It's a task, not just duration
                  });
                  eventAddedForThisDate = true;
                }

                // If no task-specific event was added for this date, add a general duration event
                if (!eventAddedForThisDate) {
                  calendarEvents.push({
                    id: `challenge-duration-${challengeDetails.id}-${dateStr}`, // Unique ID for duration event
                    date: dateStr,
                    title: challengeDetails.title, // Challenge title for duration event
                    challengeId: challengeDetails.id,
                    challengeTitle: challengeDetails.title,
                    participantId: participant.id,
                    completed: false, // Not completed as a duration event
                    progress: 0, // No specific task progress
                    completionPercentage: completionPercentage,
                    isChallengeDurationEvent: true, // Mark as duration event
                  });
                }
              }
              currentDateIterator.setDate(currentDateIterator.getDate() + 1);
            }
          }
        }
      }
      setChallengeEvents(calendarEvents);
    } catch (err) {
      setChallengeError(err instanceof Error ? err.message : "Failed to load challenges");
    } finally {
      setChallengeLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchAICreditBalance(); // Will fall back to fetchAIUsageLimits if needed
    fetchChallenges();
  }, [userId]);

  useEffect(() => {
    const combinedEvents = [...events, ...challengeEvents];
    setAllEvents(combinedEvents);
  }, [events, challengeEvents]);

  // Auto-select workout when date is selected
  useEffect(() => {
    if (!selectedDate) return;

    // Format date as YYYY-MM-DD
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    const workoutsForDate = allEvents.filter(
      (event) => event.date === dateStr && "dayDetail" in event
    ) as WorkoutEvent[];

    if (workoutsForDate.length > 0) {
      // Automatically select the first workout for this date
      setSelectedWorkout(workoutsForDate[0].dayDetail);
      setSelectedWorkoutDate(workoutsForDate[0].date);
    } else {
      // Clear selection if no workout on this date
      setSelectedWorkout(null);
      setSelectedWorkoutDate("");
    }
  }, [selectedDate, allEvents]);

  const handleGenerateWorkout = async (formData: GenerateWorkoutFormData) => {
    if (!userId) {
      showToast({ message: "Please log in to generate a workout schedule", severity: "warning" });
      return;
    }

    if (!formData.startDate) {
      showToast({ message: "Please select a start date", severity: "warning" });
      return;
    }

    setError(null);

    try {
      console.log("🔍 Checking for schedule conflicts...");

      // Format start date as YYYY-MM-DD without timezone conversion
      const year = formData.startDate.getFullYear();
      const month = String(formData.startDate.getMonth() + 1).padStart(2, "0");
      const day = String(formData.startDate.getDate()).padStart(2, "0");
      const startDateStr = `${year}-${month}-${day}`;

      // Check for conflicts before generating
      const conflictInfo = await personalCoachService.checkScheduleConflicts({
        userId,
        startDate: startDateStr,
        durationDays: formData.durationDays,
        availableDays: formData.availableDays,
      });

      if (conflictInfo.hasConflicts) {
        console.log(`⚠️ Found ${conflictInfo.totalConflicts} conflicts`);
        // Show conflict dialog
        setConflictingWorkouts(conflictInfo.conflictingWorkouts);
        setPendingGeneration(formData);
        setShowConflictDialog(true);
        return;
      }

      // No conflicts, proceed with generation
      await executeGeneration(formData);
    } catch (err) {
      console.error("❌ Error checking conflicts:", err);
      setError(err instanceof Error ? err.message : "Failed to check conflicts");
      throw err;
    }
  };

  const executeGeneration = async (formData: GenerateWorkoutFormData) => {
    if (!userId || !formData.startDate) return;

    setIsGenerating(true);

    try {
      console.log("🎯 Generating workout schedule...");

      // Track AI action and get credits
      const credits = await chatService.trackAiAction();
      console.log("Credits response:", credits);

      // Format start date as YYYY-MM-DD without timezone conversion
      const year = formData.startDate.getFullYear();
      const month = String(formData.startDate.getMonth() + 1).padStart(2, "0");
      const day = String(formData.startDate.getDate()).padStart(2, "0");
      const startDateStr = `${year}-${month}-${day}`;

      // Generate schedule using Personal Coach service
      await personalCoachService.generateSchedule({
        userId,
        goal: formData.goal,
        durationDays: formData.durationDays,
        difficultyLevel: formData.difficultyLevel,
        availableDays: formData.availableDays,
        equipmentAvailable: formData.equipmentAvailable,
        additionalNotes: formData.additionalNotes,
        startDate: startDateStr,
      });
      console.log("✅ Schedule generated");

      // Refetch schedules and AI credit balance
      await fetchSchedules();
      await fetchAICreditBalance();

      setToast({
        open: true,
        message: `Workout plan generated successfully! (${credits?.remainingMessages ?? "?"}/${credits?.dailyLimit ?? "?"} AI credits remaining)`,
        severity: "success",
      });
    } catch (err) {
      console.error("❌ Error generating schedule:", err);
      setError(err instanceof Error ? err.message : "Failed to generate schedule");
      throw err; // Let the modal handle the error display
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmGeneration = async () => {
    if (!pendingGeneration) return;

    setShowConflictDialog(false);
    await executeGeneration(pendingGeneration);
    setPendingGeneration(null);
    setConflictingWorkouts([]);
  };

  const handleConfirmTemplateReplace = async () => {
    if (!pendingTemplateReplace) return;

    setShowTemplateReplaceDialog(false);
    const { template, date } = pendingTemplateReplace;

    try {
      const dateStrForComparison = formatDateString(date);
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dateStrForBackend = utcDate.toISOString();

      const scheduleId = workoutSchedules[0]?.scheduleId;
      if (!scheduleId) return;

      const dayNumber = calculateDayNumber(date);

      const customExercises = template.exercises.map((ex: any, index: number) => ({
        exerciseLibraryId: ex.exerciseId || null,
        exerciseName: ex.exerciseName || ex.exerciseNameVi || "Unknown Exercise",
        category: ex.category || "Strength",
        sets: ex.sets || 3,
        reps: String(ex.reps || "10"),
        restSeconds: ex.restSeconds || 60,
        orderIndex: index,
        notes: ex.notes || "",
      }));

      await personalCoachService.addCustomDay(scheduleId, {
        date: dateStrForBackend,
        dayNumber,
        dayType: "workout",
        focusArea: template.focusArea,
        estimatedDuration: template.estimatedDuration,
        exercises: customExercises,
        replaceExisting: true,
      });

      showToast({
        message: `"${template.templateName}" applied to ${dateStrForComparison}`,
        severity: "success",
      });

      await fetchSchedules();
    } catch (error: any) {
      console.error("Failed to apply template:", error);
      showToast({
        message: error?.response?.data?.message || "Failed to apply template. Please try again.",
        severity: "error",
      });
    } finally {
      setPendingTemplateReplace(null);
    }
  };

  const handleSubmitFeedback = async (feedbackData: WorkoutFeedbackData) => {
    try {
      await personalCoachService.submitWorkoutFeedback(feedbackData);
      setToast({
        open: true,
        message: "Thank you for your feedback! We'll use it to improve your next workouts.",
        severity: "success",
      });
      setShowFeedbackModal(false);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      setToast({
        open: true,
        message: "Failed to submit feedback. Please try again.",
        severity: "error",
      });
    }
  };

  const handleRegenerateSchedule = async (requestData: RegenerateRequestData) => {
    try {
      // Track AI action and get credits
      const credits = await chatService.trackAiAction();
      console.log("Credits response:", credits);

      // Regenerate schedule using Personal Coach service
      await personalCoachService.regenerateSchedule(requestData);
      console.log("✅ Schedule regenerated");

      // Refetch schedules and AI credit balance
      await fetchSchedules();
      await fetchAICreditBalance();

      setShowRegenerateModal(false);
      setToast({
        open: true,
        message: `Schedule regenerated successfully! Your progress has been preserved. (${credits?.remainingMessages ?? "?"}/${credits?.dailyLimit ?? "?"} AI credits remaining)`,
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to regenerate schedule:", error);
      setToast({
        open: true,
        message: "Failed to regenerate schedule. Please try again.",
        severity: "error",
      });
      throw error;
    }
  };

  const handleEditWorkoutDay = async (editData: EditWorkoutDayData) => {
    try {
      await personalCoachService.editWorkoutDay(editData);

      // Refetch schedules to show updated data
      await fetchSchedules();

      setShowEditModal(false);
      setToast({
        open: true,
        message: "Workout day updated successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to edit workout day:", error);
      setToast({
        open: true,
        message: "Failed to edit workout day. Please try again.",
        severity: "error",
      });
      throw error;
    }
  };

  const handleToggleChallengeTask = async (challengeEvent: ChallengeCalendarEvent) => {
    if (!userId) return;

    const { task, participantId, completed, date, challengeId } = challengeEvent;

    try {
      // If there's no specific task on the event, it means it's a daily-tracking challenge.
      // We need to find or create a task to track progress against.
      let taskToUpdate = task;
      if (!taskToUpdate) {
        const tasks = await challengeService.getTasksByChallengeId(challengeId);
        if (tasks.length > 0) {
          taskToUpdate = tasks[0]; // Assume the first task is the one to track daily
        } else {
          // No tasks exist, create a default daily check-in task for this day.
          console.log(
            `No tasks found for challenge ${challengeId}. Creating a new one for ${date}.`
          );
          const newTaskPayload = {
            challengeId: challengeId,
            name: `Daily Check-in: ${new Date(date!).toLocaleDateString()}`,
            description: `Daily check-in for challenge: ${challengeEvent.challengeTitle}`,
            taskType: "DailyCheckIn",
            isRequired: true,
            // scheduledDate is not in the DTO, but the backend might handle it based on targetDate of progress.
          };
          taskToUpdate = await challengeService.createChallengeTask(newTaskPayload);
          console.log("✅ New task created:", taskToUpdate);
        }
      }

      if (!taskToUpdate) {
        showToast({ message: "Could not find or create a task to track.", severity: "error" });
        return;
      }

      // Find the participant object to get the progress array
      // Fetch the latest progress for the participant to find the specific taskProgress
      const currentParticipantProgress =
        await challengeService.getProgressByParticipantId(participantId);
      const taskProgress = currentParticipantProgress?.find(
        (p) => p.challengeTaskId === taskToUpdate!.id && toDateOnlyString(p.targetDate) === date
      );

      const newStatus = completed ? "Pending" : "Completed";

      if (taskProgress) {
        // Update existing progress
        const updatedProgress: ChallengeTaskProgressDTO = {
          ...taskProgress,
          status: newStatus,
          completedAt: newStatus === "Completed" ? new Date().toISOString() : undefined,
        };
        await challengeService.updateChallengeTaskProgress(taskProgress.id, updatedProgress);
      } else {
        // Create new progress
        const newProgress: ChallengeTaskProgressDTO = {
          participantId: participantId,
          challengeTaskId: taskToUpdate!.id,
          targetDate: date,
          status: newStatus,
          completedAt: newStatus === "Completed" ? new Date().toISOString() : undefined,
        };
        await challengeService.createChallengeTaskProgress(newProgress);
      }

      showToast({ message: `Task marked as ${newStatus.toLowerCase()}`, severity: "success" });
      await fetchChallenges(); // Refresh challenge data
    } catch (error) {
      console.error("Failed to update challenge task status:", error);
      showToast({ message: "Failed to update task status.", severity: "error" });
    }
  };

  // Helper function to create an empty manual schedule if none exists
  const ensureScheduleExists = async (): Promise<string | null> => {
    if (!userId) {
      showToast({ message: "Please log in to create a schedule", severity: "warning" });
      return null;
    }

    // Check if schedule already exists
    if (workoutSchedules.length > 0 && workoutSchedules[0]?.scheduleId) {
      return workoutSchedules[0].scheduleId;
    }

    try {
      // Create an empty manual schedule
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 90); // Default 90 days duration

      const newSchedule = await personalCoachService.createManualSchedule({
        userId,
        scheduleName: "My Workout Schedule",
        goal: "Custom Training Plan",
        startDate: today.toISOString(),
        endDate: endDate.toISOString(),
        durationDays: 90,
        difficultyLevel: "Intermediate",
      });

      // Refresh schedules to update state
      await fetchSchedules();

      console.log("✅ Empty schedule created:", newSchedule.scheduleId);
      return newSchedule.scheduleId;
    } catch (error: any) {
      console.error("❌ Failed to create schedule:", error);
      showToast({
        message: error?.response?.data?.message || "Failed to create schedule. Please try again.",
        severity: "error",
      });
      return null;
    }
  };
  // Drag-and-drop handlers
  // Format date for display and comparison (YYYY-MM-DD)
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Format date for backend API (full ISO string with UTC)
  const formatDateISO = (date: Date): string => {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return utcDate.toISOString();
  };

  const calculateDayNumber = (date: Date): number => {
    if (!workoutSchedules[0]?.days[0]?.date) return 1;
    const firstDayDate = new Date(workoutSchedules[0].days[0].date);
    const diffTime = date.getTime() - firstDayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    if (isGenerating) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const dateStr = formatDateString(date);
    setDragOverDate(dateStr);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleTemplateDrop = async (template: any, date: Date) => {
    try {
      const dateStrForComparison = formatDateString(date);
      // Create UTC date at midnight for backend
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dateStrForBackend = utcDate.toISOString();

      // Ensure schedule exists before proceeding
      const scheduleId = await ensureScheduleExists();
      if (!scheduleId) return;

      // Check if day already has a workout
      const existingWorkout = events.find((ev) => ev.date === dateStrForComparison);
      const dayNumber = calculateDayNumber(date);

      // Convert template exercises to custom day exercises
      const customExercises = template.exercises.map((ex: any, index: number) => ({
        exerciseLibraryId: ex.exerciseId || null,
        exerciseName: ex.exerciseName || ex.exerciseNameVi || "Unknown Exercise",
        category: ex.category || "Strength",
        sets: ex.sets || 3,
        reps: String(ex.reps || "10"),
        restSeconds: ex.restSeconds || 60,
        orderIndex: index,
        notes: ex.notes || "",
      }));

      // If existing workout, show confirmation dialog
      if (existingWorkout) {
        setPendingTemplateReplace({ template, date, existingWorkout });
        setShowTemplateReplaceDialog(true);
        return;
      }

      const payload = {
        date: dateStrForBackend,
        dayNumber,
        dayType: "workout",
        focusArea: template.focusArea,
        estimatedDuration: template.estimatedDuration,
        exercises: customExercises,
        replaceExisting: false,
      };

      await personalCoachService.addCustomDay(scheduleId, payload);

      showToast({
        message: `"${template.templateName}" applied to ${new Date(date).toLocaleDateString()}`,
        severity: "success",
      });

      await fetchSchedules();
    } catch (error: any) {
      console.error("Failed to apply template:", error);
      showToast({
        message: error?.response?.data?.message || "Failed to apply template. Please try again.",
        severity: "error",
      });
    }
  };

  const handleDrop = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    setDragOverDate(null);

    if (isGenerating) {
      showToast({
        message: "Please wait for the current generation to complete",
        severity: "warning",
      });
      return;
    }

    // Check if dropping a template
    const templateData = e.dataTransfer.getData("template");
    if (templateData) {
      await handleTemplateDrop(JSON.parse(templateData), date);
      return;
    }

    // Otherwise, handle exercise drop
    const exerciseData = e.dataTransfer.getData("exercise");
    if (!exerciseData) return;

    try {
      const exercise: ExerciseLibraryDTO = JSON.parse(exerciseData);
      const dateStrForComparison = formatDateString(date);
      const dateStrForBackend = formatDateISO(date);

      // Ensure schedule exists before proceeding
      const scheduleId = await ensureScheduleExists();
      if (!scheduleId) return;

      // Check if day already has a workout
      const existingWorkout = events.find((ev) => ev.date === dateStrForComparison);

      if (existingWorkout) {
        // Check if the same exercise already exists in this workout
        const exerciseExists = existingWorkout.dayDetail.exercises.some(
          (ex) => ex.exerciseName.toLowerCase() === exercise.exerciseName.toLowerCase()
        );

        if (exerciseExists) {
          // Show confirmation dialog only if exercise already exists
          setPendingDrop({
            exercise,
            date,
            dateStr: dateStrForBackend,
            existingWorkout,
          });
          setShowDropConfirm(true);
          return;
        } else {
          // Append directly without asking
          try {
            await personalCoachService.editWorkoutDay({
              scheduleDayId: existingWorkout.dayDetail.scheduleDayId,
              exercisesToAdd: [
                {
                  exerciseName: exercise.exerciseName,
                  sets: exercise.defaultSets,
                  reps: String(exercise.defaultReps),
                  restSeconds: exercise.defaultRestSeconds,
                  orderIndex: existingWorkout.dayDetail.exercises.length,
                },
              ],
            });

            // Refresh schedule to get updated data
            await fetchSchedules();

            // Manually update the selected workout with fresh data
            if (userId) {
              const updatedSchedules = await personalCoachService.getUserSchedules(userId);
              if (updatedSchedules.length > 0) {
                const latestSchedule =
                  updatedSchedules.find((s) => s.isLatest) || updatedSchedules[0];
                const updatedDay = latestSchedule.days.find(
                  (d) => d.date.split("T")[0] === dateStrForComparison
                );
                if (updatedDay) {
                  setSelectedWorkout(updatedDay);
                  setSelectedWorkoutDate(updatedDay.date.split("T")[0]);
                }
              }
            }

            showToast({
              message: `${exercise.exerciseName} added to ${dateStrForComparison}`,
              severity: "success",
            });
          } catch (error: any) {
            console.error("Failed to append exercise:", error);
            showToast({
              message:
                error?.response?.data?.message || "Failed to add exercise. Please try again.",
              severity: "error",
            });
          }
          return;
        }
      } else {
        // Create new custom day
        const dayNumber = calculateDayNumber(date);
        await personalCoachService.addCustomDay(scheduleId, {
          date: dateStrForBackend,
          dayNumber,
          dayType: "workout",
          focusArea: exercise.category || "general",
          estimatedDuration: 30,
          exercises: [
            {
              exerciseLibraryId: exercise.id,
              exerciseName: exercise.exerciseName,
              category: exercise.category,
              sets: exercise.defaultSets,
              reps: exercise.defaultReps,
              restSeconds: exercise.defaultRestSeconds,
              orderIndex: 0,
              notes: "",
            },
          ],
        });
        showToast({
          message: `New workout created with ${exercise.exerciseName} on ${dateStrForComparison}`,
          severity: "success",
        });
      }

      // Refresh schedule
      await fetchSchedules();
    } catch (error: any) {
      console.error("Failed to add exercise:", error);
      showToast({
        message: error?.response?.data?.message || "Failed to add exercise. Please try again.",
        severity: "error",
      });
    }
  };

  const handleAppendExercise = async () => {
    if (!pendingDrop) return;

    try {
      const { exercise, dateStr, existingWorkout } = pendingDrop;

      // Add to existing workout
      await personalCoachService.editWorkoutDay({
        scheduleDayId: existingWorkout.dayDetail.scheduleDayId,
        exercisesToAdd: [
          {
            exerciseName: exercise.exerciseName,
            sets: exercise.defaultSets,
            reps: String(exercise.defaultReps), // Ensure it's a string
            restSeconds: exercise.defaultRestSeconds,
            orderIndex: existingWorkout.dayDetail.exercises.length,
          },
        ],
      });

      // Refresh schedule to get updated data
      await fetchSchedules();

      // Manually update the selected workout with fresh data
      if (userId) {
        const updatedSchedules = await personalCoachService.getUserSchedules(userId);
        if (updatedSchedules.length > 0) {
          const latestSchedule = updatedSchedules.find((s) => s.isLatest) || updatedSchedules[0];
          const dateForComparison = existingWorkout.date;
          const updatedDay = latestSchedule.days.find(
            (d) => d.date.split("T")[0] === dateForComparison
          );
          if (updatedDay) {
            setSelectedWorkout(updatedDay);
            setSelectedWorkoutDate(updatedDay.date.split("T")[0]);
          }
        }
      }

      showToast({
        message: `${exercise.exerciseName} added to ${dateStr}`,
        severity: "success",
      });
    } catch (error: any) {
      console.error("Failed to add exercise:", error);
      showToast({
        message: error?.response?.data?.message || "Failed to add exercise. Please try again.",
        severity: "error",
      });
    } finally {
      setShowDropConfirm(false);
      setPendingDrop(null);
    }
  };

  const handleOverrideWorkout = async () => {
    if (!pendingDrop) return;

    try {
      const { exercise, date, dateStr, existingWorkout } = pendingDrop;

      // Ensure schedule exists before proceeding
      const scheduleId = await ensureScheduleExists();
      if (!scheduleId) return;

      // Delete existing workout
      await personalCoachService.deleteWorkoutDay(
        scheduleId,
        existingWorkout.dayDetail.scheduleDayId
      );

      // Create new custom day with the dropped exercise
      const dayNumber = calculateDayNumber(date);
      await personalCoachService.addCustomDay(scheduleId, {
        date: dateStr,
        dayNumber,
        dayType: "workout",
        focusArea: exercise.category || "general",
        estimatedDuration: 30,
        exercises: [
          {
            exerciseLibraryId: exercise.id,
            exerciseName: exercise.exerciseName,
            category: exercise.category,
            sets: exercise.defaultSets,
            reps: exercise.defaultReps,
            restSeconds: exercise.defaultRestSeconds,
            orderIndex: 0,
            notes: "",
          },
        ],
      });

      showToast({
        message: `Workout replaced with ${exercise.exerciseName}`,
        severity: "success",
      });

      await fetchSchedules();
    } catch (error: any) {
      console.error("Failed to override workout:", error);
      showToast({
        message: error?.response?.data?.message || "Failed to override workout. Please try again.",
        severity: "error",
      });
    } finally {
      setShowDropConfirm(false);
      setPendingDrop(null);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Convert Sunday (0) to 7 for Monday-first week
    return day === 0 ? 6 : day - 1;
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

  // Helper function to format date as YYYY-MM-DD without timezone conversion
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getEventCountForDate = (date: Date) => {
    const dateStr = formatDateLocal(date);
    return allEvents.filter((event) => event.date === dateStr).length;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDateLocal(date);
    return allEvents.filter((event) => event.date === dateStr);
  };

  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    const dateStr = formatDateLocal(selectedDate);
    return allEvents.filter((event) => event.date === dateStr);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    const rows: JSX.Element[][] = [];
    let days: JSX.Element[] = [];

    // Previous month's last days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
      const eventCount = getEventCountForDate(date);

      days.push(
        <div
          key={`prev-${day}`}
          className="h-20 flex items-center justify-center font-bold cursor-pointer relative text-base border-r border-b border-green-300 hover:border-green-400 hover:bg-green-50 rounded-lg"
          style={{ opacity: 0.35, fontWeight: 700, color: "#0b3d33" }}
          onClick={() => setSelectedDate(date)}
        >
          <span className="flex items-center justify-center w-full h-full">{day}</span>
          {eventCount > 0 &&
            (() => {
              const dayEvents = getEventsForDate(date);
              const hasWorkout = dayEvents.some(
                (e) => "dayDetail" in e && e.dayDetail.dayType === "workout"
              );
              const hasChallenge = dayEvents.some((e) => "challengeId" in e);

              // Calculate progress
              let progressPercentage = 0;
              if (hasWorkout) {
                const workoutEvent = dayEvents.find(
                  (e) => "dayDetail" in e && e.dayDetail.dayType === "workout"
                ) as WorkoutEvent;
                if (workoutEvent) {
                  const completedExercises = workoutEvent.dayDetail.exercises.filter(
                    (ex) => ex.completed
                  ).length;
                  const totalExercises = workoutEvent.dayDetail.exercises.length;
                  progressPercentage =
                    totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
                }
              }

              return (
                <>
                  <div
                    className="absolute w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      background: hasWorkout
                        ? progressPercentage === 100
                          ? "#22c55e"
                          : progressPercentage > 0
                            ? "#f59e0b"
                            : "#0a6a56"
                        : hasChallenge
                          ? "#ff9800"
                          : "#69c68d",
                      color: "white",
                      top: "4px",
                      right: "4px",
                      opacity: 0.6,
                    }}
                  >
                    {hasWorkout ? (
                      progressPercentage === 100 ? (
                        <CheckCircle style={{ fontSize: 14 }} />
                      ) : (
                        <FitnessCenter style={{ fontSize: 14 }} />
                      )
                    ) : hasChallenge ? (
                      <EmojiEvents style={{ fontSize: 14 }} />
                    ) : (
                      <Hotel style={{ fontSize: 14 }} />
                    )}
                  </div>
                  {hasWorkout && (
                    <div
                      className="absolute bottom-1 left-1 right-1 h-1 rounded-full overflow-hidden"
                      style={{ background: "rgba(10, 106, 86, 0.1)", opacity: 0.5 }}
                    >
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${progressPercentage}%`,
                          background:
                            progressPercentage === 100
                              ? "#22c55e"
                              : progressPercentage > 0
                                ? "#f59e0b"
                                : "#0a6a56",
                        }}
                      />
                    </div>
                  )}
                </>
              );
            })()}
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday =
        currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() === today.getMonth() &&
        day === today.getDate();
      const isSelected =
        selectedDate &&
        selectedDate.getFullYear() === date.getFullYear() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getDate() === day;
      const dayOfWeek = date.getDay();
      const isSunday = dayOfWeek === 0;
      const eventCount = getEventCountForDate(date);

      days.push(
        <div
          key={day}
          className={`h-20 flex items-center justify-center font-bold cursor-pointer relative transition-all hover:scale-105 text-base border-r border-b border-green-300 hover:border-green-400 hover:bg-green-50 rounded-lg ${
            dragOverDate === formatDateString(date) ? "drag-over" : ""
          }`}
          onClick={() => setSelectedDate(date)}
          onDragOver={(e) => handleDragOver(e, date)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, date)}
        >
          {/* Current date background circle */}
          {isToday && !isSelected && (
            <div
              className="absolute w-8 h-8 rounded-full border-2 flex items-center justify-center"
              style={{
                background: "rgba(10, 106, 86, 0.1)",
                borderColor: "#0a6a56",
              }}
            />
          )}

          {/* Selected date background circle */}
          {isSelected && (
            <div
              className="absolute w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "#c8ead6",
                border: "2px solid transparent",
                backgroundImage:
                  "linear-gradient(#c8ead6, #c8ead6), linear-gradient(90deg, #d6ea44, #ff9c50)",
                backgroundOrigin: "border-box",
                backgroundClip: "content-box, border-box",
              }}
            />
          )}

          {/* Date number */}
          <span
            className="flex items-center justify-center w-full h-full relative z-10"
            style={{
              color: isSelected
                ? "#0a6a56"
                : isToday
                  ? "#0a6a56"
                  : isSunday
                    ? "#ff7b17"
                    : "#0b3d33",
              fontWeight: isSelected ? 900 : 700,
            }}
          >
            {day}
          </span>

          {/* Event indicator with progress */}
          {eventCount > 0 &&
            (() => {
              const dayEvents = getEventsForDate(date);
              const hasWorkout = dayEvents.some(
                (e) => "dayDetail" in e && e.dayDetail.dayType === "workout"
              );
              const hasChallenge = dayEvents.some((e) => "challengeId" in e);
              const hasChallengeTask = dayEvents.some(
                (e) => "challengeId" in e && !e.isChallengeDurationEvent
              );
              const hasChallengeDuration = dayEvents.some(
                (e) => "challengeId" in e && e.isChallengeDurationEvent
              );
              const hasRest = dayEvents.some(
                (e) => "dayDetail" in e && e.dayDetail.dayType === "rest"
              );

              // Calculate progress for workout days
              let progressPercentage = 0;
              if (hasWorkout) {
                const workoutEvent = dayEvents.find(
                  (e) => "dayDetail" in e && e.dayDetail.dayType === "workout"
                ) as WorkoutEvent;
                if (workoutEvent) {
                  const completedExercises = workoutEvent.dayDetail.exercises.filter(
                    (ex) => ex.completed
                  ).length;
                  const totalExercises = workoutEvent.dayDetail.exercises.length;
                  progressPercentage =
                    totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
                }
              }

              return (
                <>
                  {/* Icon badge */}
                  {!isSelected && (
                    <div
                      className="absolute w-7 h-7 rounded-full flex items-center justify-center"
                      style={{
                        background: hasWorkout
                          ? progressPercentage === 100
                            ? "#22c55e"
                            : progressPercentage > 0
                              ? "#f59e0b"
                              : "#0a6a56"
                          : hasChallenge
                            ? "#ff9800"
                            : "#69c68d",
                        color: "white",
                        top: "4px",
                        right: "4px",
                      }}
                    >
                      {hasWorkout ? (
                        progressPercentage === 100 ? (
                          <CheckCircle style={{ fontSize: 16 }} />
                        ) : (
                          <FitnessCenter style={{ fontSize: 16 }} />
                        )
                      ) : hasChallengeTask ? (
                        // If there is a specific task, show the trophy
                        <EmojiEvents style={{ fontSize: 16 }} />
                      ) : hasChallenge ? (
                        // If it's just a duration event, show the schedule icon
                        <ScheduleIcon style={{ fontSize: 16 }} />
                      ) : (
                        <Hotel style={{ fontSize: 16 }} />
                      )}
                    </div>
                  )}

                  {/* Progress bar at bottom */}
                  {hasWorkout && (
                    <div
                      className="absolute bottom-1 left-1 right-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: "rgba(10, 106, 86, 0.15)" }}
                    >
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${progressPercentage}%`,
                          background:
                            progressPercentage === 100
                              ? "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)"
                              : progressPercentage > 0
                                ? "linear-gradient(90deg, #f59e0b 0%, #f97316 100%)"
                                : "linear-gradient(90deg, #0a6a56 0%, #069668 100%)",
                        }}
                      />
                    </div>
                  )}
                </>
              );
            })()}
        </div>
      );

      if (days.length === 7) {
        rows.push([...days]);
        days = [];
      }
    }

    // Next month's first days
    if (days.length > 0) {
      const remaining = 7 - days.length;
      for (let day = 1; day <= remaining; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
        const eventCount = getEventCountForDate(date);

        days.push(
          <div
            key={`next-${day}`}
            className="h-20 flex items-center justify-center font-bold cursor-pointer relative text-base border-r border-b border-green-300 hover:border-green-400 hover:bg-green-50 rounded-lg"
            style={{ opacity: 0.35, fontWeight: 700, color: "#0b3d33" }}
            onClick={() => setSelectedDate(date)}
          >
            <span className="flex items-center justify-center w-full h-full">{day}</span>
            {eventCount > 0 &&
              (() => {
                const dayEvents = getEventsForDate(date);
                const hasWorkout = dayEvents.some(
                  (e) => "dayDetail" in e && e.dayDetail.dayType === "workout"
                );
                const hasChallenge = dayEvents.some((e) => "challengeId" in e);

                // Calculate progress
                let progressPercentage = 0;
                if (hasWorkout) {
                  const workoutEvent = dayEvents.find(
                    (e) => "dayDetail" in e && e.dayDetail.dayType === "workout"
                  ) as WorkoutEvent;
                  if (workoutEvent) {
                    const completedExercises = workoutEvent.dayDetail.exercises.filter(
                      (ex) => ex.completed
                    ).length;
                    const totalExercises = workoutEvent.dayDetail.exercises.length;
                    progressPercentage =
                      totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
                  }
                }

                return (
                  <>
                    <div
                      className="absolute w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        background: hasWorkout
                          ? progressPercentage === 100
                            ? "#22c55e"
                            : progressPercentage > 0
                              ? "#f59e0b"
                              : "#0a6a56"
                          : hasChallenge
                            ? "#ff9800"
                            : "#69c68d",
                        color: "white",
                        top: "4px",
                        right: "4px",
                        opacity: 0.6,
                      }}
                    >
                      {hasWorkout ? (
                        progressPercentage === 100 ? (
                          <CheckCircle style={{ fontSize: 14 }} />
                        ) : (
                          <FitnessCenter style={{ fontSize: 14 }} />
                        )
                      ) : hasChallenge ? (
                        <EmojiEvents style={{ fontSize: 14 }} />
                      ) : (
                        <Hotel style={{ fontSize: 14 }} />
                      )}
                    </div>
                    {hasWorkout && (
                      <div
                        className="absolute bottom-1 left-1 right-1 h-1 rounded-full overflow-hidden"
                        style={{ background: "rgba(10, 106, 86, 0.1)", opacity: 0.5 }}
                      >
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${progressPercentage}%`,
                            background:
                              progressPercentage === 100
                                ? "#22c55e"
                                : progressPercentage > 0
                                  ? "#f59e0b"
                                  : "#0a6a56",
                          }}
                        />
                      </div>
                    )}
                  </>
                );
              })()}
          </div>
        );
      }
      rows.push([...days]);
    }

    return rows;
  };

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  const selectedDateStr = selectedDate
    ? `${selectedDate.toLocaleDateString("en-US", { month: "long" })} ${selectedDate.getDate()}`
    : "";

  const displayEvents = getEventsForSelectedDate();

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main Calendar Section */}
      <div
        className="flex-1 flex flex-col overflow-y-auto no-scrollbar px-4 py-3 rounded-3xl transition-all duration-300"
        style={{
          background: "linear-gradient(180deg, #bfe8d6 0%, #dff4e9 50%, #f1f8d6 100%)",
          color: "#022c3c",
        }}
      >
        {/* Calendar content */}
        <main className="flex flex-col h-full">
          {/* Heading row */}
          <div className="flex items-center justify-between px-3 py-1 flex-shrink-0">
            <div className="font-black text-4xl" style={{ color: "#0b3d33" }}>
              Schedule
            </div>
            <div className="flex items-center gap-4">
              {/* AI Usage Badge */}
              {!isPaidUser && aiUsageLimits && (
                <div className="flex items-center gap-2 text-sm">
                  <span style={{ color: "#0a6a56", fontWeight: "500" }}>AI:</span>
                  <span
                    className="px-2 py-1 rounded-lg font-semibold"
                    style={{
                      background: aiUsageLimits.remainingGenerations > 0 ? "#dcfce7" : "#fee2e2",
                      color: aiUsageLimits.remainingGenerations > 0 ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {aiUsageLimits.remainingGenerations}/{aiUsageLimits.monthlyLimit}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateMonth("prev")}
                  className="w-8 h-8 flex items-center justify-center hover:bg-opacity-10 hover:bg-white transition-all rounded-full"
                  style={{ color: "#0a6a56" }}
                >
                  <ChevronLeft fontSize="small" />
                </button>

                <div className="flex items-center gap-2">
                  <Select
                    value={currentDate.getMonth().toString()}
                    onValueChange={(value) => {
                      const newDate = new Date(currentDate);
                      newDate.setMonth(parseInt(value));
                      setCurrentDate(newDate);
                    }}
                  >
                    <SelectTrigger
                      className="w-32 border-2 rounded-xl focus:ring-2 focus:ring-green-500/20"
                      style={{ borderColor: "#c8ead6" }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className="border border-green-200 bg-white shadow-lg z-[10000]"
                      style={{ zIndex: 10000 }}
                      position="popper"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const monthName = new Date(0, i).toLocaleDateString("en-US", {
                          month: "long",
                        });
                        return (
                          <SelectItem key={i} value={i.toString()}>
                            {monthName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <Select
                    value={currentDate.getFullYear().toString()}
                    onValueChange={(value) => {
                      const newDate = new Date(currentDate);
                      newDate.setFullYear(parseInt(value));
                      setCurrentDate(newDate);
                    }}
                  >
                    <SelectTrigger
                      className="w-24 border-2 rounded-xl focus:ring-2 focus:ring-green-500/20"
                      style={{ borderColor: "#c8ead6" }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className="border border-green-200 bg-white shadow-lg z-[10000]"
                      style={{ zIndex: 10000 }}
                      position="popper"
                    >
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - 5 + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <button
                  onClick={() => navigateMonth("next")}
                  className="w-8 h-8 flex items-center justify-center hover:bg-opacity-10 hover:bg-white transition-all rounded-full"
                  style={{ color: "#0a6a56" }}
                >
                  <ChevronRight fontSize="small" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <section className="flex-1 flex flex-col">
            {/* Weekdays */}
            <div
              className="grid grid-cols-7 px-3 pt-2 pb-2 font-bold text-base"
              style={{ color: "#0a6a56" }}
            >
              {weekdays.map((d, i) => (
                <div
                  key={d}
                  className="flex items-center justify-center py-3 border-b-2 border-green-400 font-semibold"
                  style={{ color: i === 6 ? "#ff7b17" : "#0a6a56" }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="border-l border-t border-green-300 rounded-2xl overflow-hidden">
                {renderCalendar().map((row, ri) => (
                  <div key={ri} className="grid grid-cols-7 px-3 flex-1">
                    {row}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Separator */}
          <div
            className="h-0.5 mx-3 my-6 rounded-sm flex-shrink-0"
            style={{
              background: "#0a6a56",
              opacity: 0.6,
              height: "2px",
            }}
          />

          {/* Event tiles - fixed height, no scroll */}
          <div className="px-3 py-2" style={{ maxHeight: "280px" }}>
            {isLoading || challengeLoading ? (
              <div className="text-center py-8 text-opacity-60" style={{ color: "#0a6a56" }}>
                Loading activities...
              </div>
            ) : error ? (
              <div className="text-center py-4 text-red-600">{error}</div>
            ) : challengeError ? (
              <div className="text-center py-4 text-red-600">{challengeError}</div>
            ) : displayEvents.length > 0 ? (
              displayEvents.map((event) => {
                if ("dayDetail" in event) {
                  const workoutEvent = event as WorkoutEvent;
                  const completedExercises = workoutEvent.dayDetail.exercises.filter(
                    (ex) => ex.completed
                  ).length;
                  const totalExercises = workoutEvent.dayDetail.exercises.length;
                  const progressPercentage =
                    totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

                  return (
                    <div
                      key={workoutEvent.id}
                      onClick={() => {
                        setSelectedWorkout(workoutEvent.dayDetail);
                        setSelectedWorkoutDate(workoutEvent.date);
                        setWorkoutClickTrigger((prev) => prev + 1); // Force sidebar to show workout detail
                      }}
                      className="rounded-xl px-3 py-3 flex flex-col gap-2 mb-2 cursor-pointer hover:shadow-lg transition-all"
                      style={{
                        background: "linear-gradient(90deg, #dce642 0%, #ffaf72 100%)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      {/* Header Row */}
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(255, 123, 23, 0.2)", color: "#ff7b17" }}
                        >
                          <FitnessCenter fontSize="small" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-base" style={{ color: "#0a6a56" }}>
                            {workoutEvent.title}
                          </div>
                          <div
                            className="text-xs mt-0.5 flex items-center gap-3"
                            style={{ color: "#0b3d33", opacity: 0.85 }}
                          >
                            <span className="flex items-center gap-1">
                              <AccessTime style={{ fontSize: 14 }} />
                              {workoutEvent.time}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <FitnessCenter style={{ fontSize: 14 }} />
                              {workoutEvent.exercises} exercises
                            </span>
                          </div>
                        </div>
                        <div
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: "#0a6a56", color: "white" }}
                        >
                          {workoutEvent.focusArea}
                        </div>
                      </div>

                      {/* Progress Section */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium" style={{ color: "#0a6a56" }}>
                            {completedExercises}/{totalExercises} exercises •{" "}
                            {Math.round(progressPercentage)}%
                          </span>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-md"
                            style={{
                              color: "white",
                              background: progressPercentage === 100 ? "#10b981" : "#0a6a56",
                            }}
                          >
                            {progressPercentage === 100
                              ? "Complete!"
                              : `${totalExercises - completedExercises} left`}
                          </span>
                        </div>

                        {/* Progress Bar with Orange to Green Gradient */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${progressPercentage}%`,
                              background:
                                "linear-gradient(90deg, #fbbf24 0%, #f59e0b 25%, #84cc16 75%, #22c55e 100%)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  const challengeEvent = event as ChallengeCalendarEvent;
                  return (
                    <div
                      key={challengeEvent.id}
                      className="rounded-xl px-3 py-3 flex flex-col gap-2 mb-2 cursor-pointer hover:shadow-lg transition-all"
                      style={{
                        background: "linear-gradient(90deg, #ffcc80 0%, #ffb74d 100%)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      {/* Header Row */}
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(255, 152, 0, 0.2)", color: "#ff9800" }}
                        >
                          <EmojiEvents fontSize="small" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-base" style={{ color: "#bf360c" }}>
                            {challengeEvent.title}
                          </div>
                          <div
                            className="text-xs mt-0.5 flex items-center gap-3"
                            style={{ color: "#bf360c", opacity: 0.85 }}
                          >
                            <span>{challengeEvent.challengeTitle}</span>
                          </div>
                        </div>
                        <div
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: "#ff9800", color: "white" }}
                        >
                          Challenge
                        </div>
                      </div>
                      {/* Progress Section */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/* Logic to determine if checkbox should be disabled */}
                            {(() => {
                              const today = new Date();
                              const eventDateObj = new Date(challengeEvent.date);
                              const todayMidnight = today.setHours(0, 0, 0, 0);
                              const eventDateMidnight = eventDateObj.setHours(0, 0, 0, 0);

                              const isFutureDate = eventDateMidnight > todayMidnight;
                              const isPastDate = eventDateMidnight < todayMidnight;
                              // const isCurrentDate = eventDateMidnight === todayMidnight; // Not strictly needed for disabled logic

                              // Disable checkbox if:
                              // 1. It's a future date.
                              // 2. It's a past date AND the task is not completed.
                              // 3. It's a duration event (no specific task to check).
                              const isCheckboxDisabled =
                                isFutureDate ||
                                (isPastDate && !challengeEvent.completed) ||
                                challengeEvent.isChallengeDurationEvent;

                              // Determine the status text
                              let statusText = "In Progress";
                              if (challengeEvent.completed) {
                                statusText = "Completed";
                              } else if (isFutureDate) {
                                statusText = "Upcoming";
                              } else if (isPastDate && !challengeEvent.completed) {
                                statusText = "Not Completed"; // Explicitly for past, uncompleted
                              }

                              return (
                                <>
                                  {!challengeEvent.isChallengeDurationEvent && (
                                    <input
                                      type="checkbox"
                                      checked={challengeEvent.completed}
                                      onChange={() => handleToggleChallengeTask(challengeEvent)}
                                      className="w-4 h-4 rounded text-orange-600 bg-orange-100 border-orange-300 focus:ring-orange-500"
                                      onClick={(e) => e.stopPropagation()} // Prevent card click when toggling
                                      disabled={isCheckboxDisabled} // Apply disabled attribute
                                    />
                                  )}
                                  <span
                                    className="text-xs font-medium"
                                    style={{ color: "#bf360c" }}
                                  >
                                    {statusText} {/* Use the new statusText */}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                          <span className="text-xs font-bold" style={{ color: "#bf360c" }}>
                            {Math.round(challengeEvent.completionPercentage ?? 0)}%
                          </span>
                        </div>
                        {/* Overall Challenge Progress Bar */}
                        <div className="w-full bg-orange-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${challengeEvent.completionPercentage ?? 0}%`,
                              background:
                                challengeEvent.completionPercentage === 100
                                  ? "linear-gradient(90deg, #4caf50 0%, #81c784 100%)" // Green gradient for 100%
                                  : "linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)", // Orange gradient
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
              })
            ) : (
              <div className="text-center py-4">
                <div className="flex justify-center mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(10, 106, 86, 0.1)" }}
                  >
                    <ScheduleIcon style={{ fontSize: 24, color: "#0a6a56", opacity: 0.5 }} />
                  </div>
                </div>
                <div
                  className="font-semibold text-base mb-1"
                  style={{ color: "#0a6a56", opacity: 0.7 }}
                >
                  No activities scheduled for this day
                </div>
                {!userId && (
                  <div className="text-xs" style={{ color: "#0a6a56", opacity: 0.5 }}>
                    Please log in to view your schedule
                  </div>
                )}
                {userId && workoutSchedules.length === 0 && challengeEvents.length === 0 && (
                  <div className="text-xs mt-1" style={{ color: "#0a6a56", opacity: 0.5 }}>
                    Click the + button to generate your first AI workout plan or join a challenge.
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Schedule Sidebar - Always Visible */}
      <ScheduleSidebar
        onGenerateSubmit={handleGenerateWorkout}
        isGenerating={isGenerating}
        hasSchedules={workoutSchedules.length > 0}
        userId={userId || ""}
        aiUsageLimits={aiUsageLimits}
        creditBalance={creditBalance}
        selectedWorkout={selectedWorkout}
        selectedWorkoutDate={selectedWorkoutDate}
        workoutClickTrigger={workoutClickTrigger}
        onWorkoutClose={() => {
          setSelectedWorkout(null);
          setSelectedWorkoutDate("");
        }}
        onExerciseComplete={() => {
          // Refetch schedules to update the UI with latest completion status
          fetchSchedules();
        }}
        onFeedbackClick={() => {
          if (selectedWorkout && workoutSchedules[0]) {
            setFeedbackWorkout({
              scheduleId: workoutSchedules[0].scheduleId,
              scheduleDayId: selectedWorkout.scheduleDayId,
              dayNumber: selectedWorkout.dayNumber,
              title: selectedWorkout.focusArea,
            });
            setShowFeedbackModal(true);
          }
        }}
        onEditClick={() => {
          if (selectedWorkout) {
            setEditingWorkout(selectedWorkout);
            setShowEditModal(true);
          }
        }}
        onRegenerateClick={() => {
          if (selectedWorkout && workoutSchedules[0]) {
            setShowRegenerateModal(true);
          }
        }}
        scheduleId={workoutSchedules[0]?.scheduleId}
        onScheduleUpdated={fetchSchedules}
        ensureScheduleExists={ensureScheduleExists}
      />

      {/* Workout Feedback Modal */}
      {feedbackWorkout && (
        <WorkoutFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setFeedbackWorkout(null);
          }}
          onSubmit={handleSubmitFeedback}
          scheduleId={feedbackWorkout.scheduleId}
          scheduleDayId={feedbackWorkout.scheduleDayId}
          dayNumber={feedbackWorkout.dayNumber}
          workoutTitle={feedbackWorkout.title}
        />
      )}

      {/* Regenerate Schedule Modal */}
      {workoutSchedules.length > 0 && (
        <RegenerateScheduleModal
          isOpen={showRegenerateModal}
          onClose={() => setShowRegenerateModal(false)}
          onRegenerate={handleRegenerateSchedule}
          currentScheduleId={workoutSchedules[0].scheduleId}
          completedDays={
            workoutSchedules[0].days.filter((d) => d.exercises.every((e) => e.completed)).length
          }
          totalDays={workoutSchedules[0].durationDays}
          currentDifficulty={workoutSchedules[0].difficultyLevel}
          aiUsageLimits={aiUsageLimits}
        />
      )}

      {/* Edit Workout Day Modal */}
      <EditWorkoutDayModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingWorkout(null);
        }}
        onSave={handleEditWorkoutDay}
        workout={editingWorkout}
      />

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        aiUsageLimits={aiUsageLimits}
        creditBalance={creditBalance}
      />

      {/* Schedule Conflict Dialog */}
      <ScheduleConflictDialog
        isOpen={showConflictDialog}
        onClose={() => {
          setShowConflictDialog(false);
          setPendingGeneration(null);
          setConflictingWorkouts([]);
        }}
        onConfirm={handleConfirmGeneration}
        conflicts={conflictingWorkouts}
        isGenerating={isGenerating}
      />

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ zIndex: 10001 }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Drop Confirmation Dialog */}
      <AlertDialog open={showDropConfirm} onOpenChange={setShowDropConfirm}>
        <AlertDialogContent
          className="bg-white rounded-3xl"
          style={{ border: "2px solid #c8ead6" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "#0a6a56" }}>
              Exercise Already Exists
            </AlertDialogTitle>
            <AlertDialogDescription>
              This workout already contains "{pendingDrop?.exercise?.exerciseName}".
              <br />
              <br />
              <strong>Append:</strong> Add another set of this exercise to the workout.
              <br />
              <strong>Override:</strong> Replace the entire workout with just this exercise.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDropConfirm(false);
                setPendingDrop(null);
              }}
              className="rounded-xl"
              style={{ borderColor: "#c8ead6" }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAppendExercise}
              className="rounded-xl text-white hover:opacity-90"
              style={{ background: "#0a6a56" }}
            >
              Append
            </AlertDialogAction>
            <AlertDialogAction
              onClick={handleOverrideWorkout}
              className="rounded-xl text-white hover:opacity-90"
              style={{ background: "#dc2626" }}
            >
              Override
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Template Replace Confirmation Dialog */}
      <AlertDialog open={showTemplateReplaceDialog} onOpenChange={setShowTemplateReplaceDialog}>
        <AlertDialogContent
          className="bg-white rounded-3xl"
          style={{ border: "2px solid #c8ead6" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "#0a6a56" }}>
              Replace Existing Workout?
            </AlertDialogTitle>
            <AlertDialogDescription>
              A workout already exists on {pendingTemplateReplace?.date.toLocaleDateString()}.
              <br />
              <br />
              Do you want to replace it with "
              <strong>{pendingTemplateReplace?.template?.templateName}</strong>"?
              <br />
              <br />
              <span style={{ color: "#dc2626" }}>
                This will remove all exercises from the existing workout.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowTemplateReplaceDialog(false);
                setPendingTemplateReplace(null);
              }}
              className="rounded-xl"
              style={{ borderColor: "#c8ead6" }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmTemplateReplace}
              className="rounded-xl text-white hover:opacity-90"
              style={{ background: "#0a6a56" }}
            >
              Replace Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Drag-and-Drop CSS */}
      <style>{`
        .drag-over {
          border: 2px dashed #0a6a56 !important;
          background: rgba(10, 106, 86, 0.1) !important;
          transform: scale(1.02);
        }
        
        .exercise-card[draggable="true"] {
          cursor: grab;
        }
        
        .exercise-card[draggable="true"]:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
};

export default Schedule;
