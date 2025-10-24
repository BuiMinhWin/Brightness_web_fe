import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/hooks/useToast";
import {
  personalCoachService,
  WorkoutScheduleResponse,
  ScheduleDayDetail,
  AIUsageLimits,
  ExerciseLibraryDTO,
} from "@/services/personalCoachService";
import chatService from "@/services/chatService";
import WorkoutFeedbackModal, { WorkoutFeedbackData } from "@/components/WorkoutFeedbackModal";
import RegenerateScheduleModal, {
  RegenerateRequestData,
} from "@/components/RegenerateScheduleModal";
import EditWorkoutDayModal, { EditWorkoutDayData } from "@/components/EditWorkoutDayModal";
import UpgradePrompt from "@/components/UpgradePrompt";
import ScheduleSidebar, { GenerateWorkoutFormData } from "@/components/schedule/ScheduleSidebar";
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

const Schedule: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [workoutSchedules, setWorkoutSchedules] = useState<WorkoutScheduleResponse[]>([]);
  const [events, setEvents] = useState<WorkoutEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const userId = useAppSelector((state) => state.auth.userId);
  const userInfo = useAppSelector((state) => state.auth.userInfo);
  const isPaidUser = userInfo?.subscriptionPlanId != null;

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Fetch AI usage limits
  const fetchAIUsageLimits = async () => {
    if (!userId) return;
    
    try {
      const limits = await personalCoachService.getAIUsageLimits(userId);
      setAiUsageLimits(limits);
    } catch (error) {
      console.error("Failed to fetch AI usage limits:", error);
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
        const latestSchedule = schedules.find(s => s.isLatest) || schedules[0];
        console.log("📌 Using latest schedule:", latestSchedule.scheduleName, "IsLatest:", latestSchedule.isLatest);

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

  useEffect(() => {
    fetchSchedules();
    fetchAIUsageLimits();
  }, [userId]);

  // Auto-select workout when date is selected
  useEffect(() => {
    if (!selectedDate) return;
    
    // Format date as YYYY-MM-DD
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    
    const workoutsForDate = events.filter((event) => event.date === dateStr);
    
    if (workoutsForDate.length > 0) {
      // Automatically select the first workout for this date
      setSelectedWorkout(workoutsForDate[0].dayDetail);
      setSelectedWorkoutDate(workoutsForDate[0].date);
    } else {
      // Clear selection if no workout on this date
      setSelectedWorkout(null);
      setSelectedWorkoutDate("");
    }
  }, [selectedDate, events]);

  const handleGenerateWorkout = async (formData: GenerateWorkoutFormData) => {
    if (!userId) {
      showToast({ message: "Please log in to generate a workout schedule", severity: "warning" });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log("🎯 Generating workout schedule...");
      
      // Track AI action and get credits
      const credits = await chatService.trackAiAction();
      console.log("Credits response:", credits);
      
      // Generate schedule using Personal Coach service
      await personalCoachService.generateSchedule({
        userId,
        goal: formData.goal,
        durationDays: formData.durationDays,
        difficultyLevel: formData.difficultyLevel,
        availableDays: formData.availableDays,
        equipmentAvailable: formData.equipmentAvailable,
        additionalNotes: formData.additionalNotes,
      });
      console.log("✅ Schedule generated");

      // Refetch schedules and AI usage limits
      await fetchSchedules();
      await fetchAIUsageLimits();

      setToast({
        open: true,
        message: `Workout plan generated successfully! (${credits?.remainingMessages ?? '?'}/${credits?.dailyLimit ?? '?'} AI credits remaining)`,
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

      // Refetch schedules and AI usage limits
      await fetchSchedules();
      await fetchAIUsageLimits();

      setShowRegenerateModal(false);
      setToast({
        open: true,
        message: `Schedule regenerated successfully! Your progress has been preserved. (${credits?.remainingMessages ?? '?'}/${credits?.dailyLimit ?? '?'} AI credits remaining)`,
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

  // Drag-and-drop handlers
  const formatDateISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const calculateDayNumber = (date: Date): number => {
    if (!workoutSchedules[0]?.days[0]?.date) return 1;
    const firstDayDate = new Date(workoutSchedules[0].days[0].date);
    const diffTime = date.getTime() - firstDayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    if (isGenerating || !workoutSchedules[0]?.scheduleId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const dateStr = formatDateISO(date);
    setDragOverDate(dateStr);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleTemplateDrop = async (template: any, date: Date) => {
    try {
      const dateStr = formatDateISO(date);
      const scheduleId = workoutSchedules[0]?.scheduleId;
      if (!scheduleId) return;

      // Check if day already has a workout
      const existingWorkout = events.find((ev) => ev.date === dateStr);
      const dayNumber = calculateDayNumber(date);

      // Convert template exercises to custom day exercises
      const customExercises = template.exercises.map((ex: any, index: number) => ({
        exerciseLibraryId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        exerciseNameVi: ex.exerciseNameVi,
        category: ex.category,
        sets: ex.sets,
        reps: ex.reps,
        restSeconds: ex.restSeconds,
        orderIndex: index,
        notes: ex.notes || "",
      }));

      // If existing workout, ask user to replace or cancel
      const replaceExisting = existingWorkout
        ? window.confirm(
            `A workout already exists on ${new Date(date).toLocaleDateString()}. Replace it with "${template.templateName}"?`
          )
        : true;

      if (!replaceExisting) return;

      await personalCoachService.addCustomDay(scheduleId, {
        date: dateStr,
        dayNumber,
        dayType: "workout",
        focusArea: template.focusArea,
        estimatedDuration: template.estimatedDuration,
        exercises: customExercises,
        replaceExisting,
      });

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

    if (!workoutSchedules[0]?.scheduleId) {
      showToast({
        message: "Please create a schedule first (use AI Generate or add exercises manually)",
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
      const dateStr = formatDateISO(date);
      const scheduleId = workoutSchedules[0].scheduleId;

      // Check if day already has a workout
      const existingWorkout = events.find((ev) => ev.date === dateStr);

      if (existingWorkout) {
        // Show confirmation dialog
        setPendingDrop({
          exercise,
          date,
          dateStr,
          existingWorkout,
        });
        setShowDropConfirm(true);
        return;
      } else {
        // Create new custom day
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
          message: `New workout created with ${exercise.exerciseName} on ${dateStr}`,
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
            reps: exercise.defaultReps,
            restSeconds: exercise.defaultRestSeconds,
            orderIndex: existingWorkout.dayDetail.exercises.length,
          },
        ],
      });

      showToast({
        message: `${exercise.exerciseName} added to ${dateStr}`,
        severity: "success",
      });

      await fetchSchedules();
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
    if (!pendingDrop || !workoutSchedules[0]?.scheduleId) return;

    try {
      const { exercise, date, dateStr, existingWorkout } = pendingDrop;
      const scheduleId = workoutSchedules[0].scheduleId;

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
    return events.filter((event) => event.date === dateStr).length;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDateLocal(date);
    return events.filter((event) => event.date === dateStr);
  };

  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    const dateStr = formatDateLocal(selectedDate);
    return events.filter((event) => event.date === dateStr);
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
          className="h-20 flex items-center justify-center font-bold cursor-pointer relative text-base border-r border-b border-green-300 hover:border-green-400 hover:bg-green-50"
          style={{ opacity: 0.35, fontWeight: 700, color: "#0b3d33" }}
          onClick={() => setSelectedDate(date)}
        >
          <span className="flex items-center justify-center w-full h-full">{day}</span>
          {eventCount > 0 &&
            (() => {
              const dayEvents = getEventsForDate(date);
              const hasWorkout = dayEvents.some((e) => e.dayDetail.dayType === "workout");
              
              // Calculate progress
              let progressPercentage = 0;
              if (hasWorkout) {
                const workoutEvent = dayEvents.find((e) => e.dayDetail.dayType === "workout");
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
          className={`h-20 flex items-center justify-center font-bold cursor-pointer relative transition-all hover:scale-105 text-base border-r border-b border-green-300 hover:border-green-400 hover:bg-green-50 ${
            dragOverDate === formatDateISO(date) ? "drag-over" : ""
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
              const hasWorkout = dayEvents.some((e) => e.dayDetail.dayType === "workout");
              const hasRest = dayEvents.some((e) => e.dayDetail.dayType === "rest");
              
              // Calculate progress for workout days
              let progressPercentage = 0;
              if (hasWorkout) {
                const workoutEvent = dayEvents.find((e) => e.dayDetail.dayType === "workout");
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
            className="h-20 flex items-center justify-center font-bold cursor-pointer relative text-base border-r border-b border-green-300 hover:border-green-400 hover:bg-green-50"
            style={{ opacity: 0.35, fontWeight: 700, color: "#0b3d33" }}
            onClick={() => setSelectedDate(date)}
          >
            <span className="flex items-center justify-center w-full h-full">{day}</span>
            {eventCount > 0 &&
              (() => {
                const dayEvents = getEventsForDate(date);
                const hasWorkout = dayEvents.some((e) => e.dayDetail.dayType === "workout");
                
                // Calculate progress
                let progressPercentage = 0;
                if (hasWorkout) {
                  const workoutEvent = dayEvents.find((e) => e.dayDetail.dayType === "workout");
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
                <span style={{ color: "#0a6a56", fontWeight: "500" }}>
                  AI:
                </span>
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
            <div className="border-l border-t border-green-300 rounded-lg overflow-hidden">
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
          {isLoading ? (
            <div className="text-center py-8 text-opacity-60" style={{ color: "#0a6a56" }}>
              Loading workouts...
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-600">{error}</div>
          ) : displayEvents.length > 0 ? (
            displayEvents.map((event) => {
              // Calculate progress based on completed exercises
              const completedExercises = event.dayDetail.exercises.filter(
                (ex) => ex.completed
              ).length;
              const totalExercises = event.dayDetail.exercises.length;
              const progressPercentage =
                totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

              return (
                <div
                  key={event.id}
                  onClick={() => {
                    setSelectedWorkout(event.dayDetail);
                    setSelectedWorkoutDate(event.date);
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
                        {event.title}
                      </div>
                      <div
                        className="text-xs mt-0.5 flex items-center gap-3"
                        style={{ color: "#0b3d33", opacity: 0.85 }}
                      >
                        <span className="flex items-center gap-1">
                          <AccessTime style={{ fontSize: 14 }} />
                          {event.time}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FitnessCenter style={{ fontSize: 14 }} />
                          {event.exercises} exercises
                        </span>
                      </div>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: "#0a6a56", color: "white" }}
                    >
                      {event.focusArea}
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
                No workouts scheduled for this day
              </div>
              {!userId && (
                <div className="text-xs" style={{ color: "#0a6a56", opacity: 0.5 }}>
                  Please log in to view your workout schedule
                </div>
              )}
              {userId && workoutSchedules.length === 0 && (
                <div className="text-xs mt-1" style={{ color: "#0a6a56", opacity: 0.5 }}>
                  Click the + button to generate your first AI workout plan
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
        selectedWorkout={selectedWorkout}
        selectedWorkoutDate={selectedWorkoutDate}
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
        <AlertDialogContent className="bg-white rounded-3xl" style={{ border: "2px solid #c8ead6" }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "#0a6a56" }}>
              Workout Already Exists
            </AlertDialogTitle>
            <AlertDialogDescription>
              This day already has a workout scheduled ({pendingDrop?.existingWorkout?.dayDetail?.exercises?.length || 0} exercises).
              <br /><br />
              <strong>Append:</strong> Add this exercise to the existing workout.
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
