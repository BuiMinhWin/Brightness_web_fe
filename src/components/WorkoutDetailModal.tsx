import React, { useState } from "react";
import {
  Close,
  FitnessCenter,
  AccessTime,
  Repeat,
  Timer,
  Info,
  PlayCircleOutline,
  Label,
  CheckCircle,
  CheckCircleOutline,
  RateReview,
  Edit,
  Refresh,
} from "@mui/icons-material";
import { Snackbar, Alert } from "@mui/material";
import {
  ExerciseDetail,
  ScheduleDayDetail,
  personalCoachService,
} from "@/services/personalCoachService";

interface WorkoutDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: ScheduleDayDetail | null;
  date: string;
  onExerciseComplete?: (exerciseId: string, completed: boolean) => void;
  onFeedbackClick?: () => void;
  onEditClick?: () => void;
  onRegenerateClick?: () => void;
  scheduleId?: string;
}

const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  isOpen,
  onClose,
  workout,
  date,
  onExerciseComplete,
  onFeedbackClick,
  onEditClick,
  onRegenerateClick,
  scheduleId,
}) => {
  const [exercises, setExercises] = useState<ExerciseDetail[]>([]);
  const [updatingExercise, setUpdatingExercise] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Initialize exercises from workout prop and reset toast
  React.useEffect(() => {
    if (workout) {
      setExercises(workout.exercises);
    }
    // Reset toast when modal opens with new workout
    setToast({ open: false, message: "", severity: "info" });
  }, [workout, isOpen]);

  // Check if the workout date is today (allow completion only for today's workout)
  const isToday = () => {
    if (!date) return false;
    const today = new Date();
    const workoutDate = new Date(date);
    return (
      today.getFullYear() === workoutDate.getFullYear() &&
      today.getMonth() === workoutDate.getMonth() &&
      today.getDate() === workoutDate.getDate()
    );
  };

  const canComplete = isToday();
  const allCompleted = exercises.length > 0 && exercises.every((e) => e.completed);

  const handleToggleComplete = async (exercise: ExerciseDetail) => {
    if (!canComplete) {
      setToast({
        open: true,
        message: "You can only mark exercises as complete on the scheduled workout day!",
        severity: "warning",
      });
      return;
    }
    setUpdatingExercise(exercise.exerciseId);

    try {
      const newCompleted = !exercise.completed;
      await personalCoachService.markExerciseComplete(
        exercise.exerciseId,
        newCompleted,
        exercise.actualSets,
        exercise.actualReps
      );

      // Update local state
      setExercises((prev) =>
        prev.map((ex) =>
          ex.exerciseId === exercise.exerciseId ? { ...ex, completed: newCompleted } : ex
        )
      );

      // Notify parent if callback provided
      if (onExerciseComplete) {
        onExerciseComplete(exercise.exerciseId, newCompleted);
      }

      // Show success toast
      setToast({
        open: true,
        message: newCompleted ? "Exercise marked as complete!" : "Exercise marked as incomplete",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to update exercise:", error);
      setToast({
        open: true,
        message: "Failed to update exercise completion. Please try again.",
        severity: "error",
      });
    } finally {
      setUpdatingExercise(null);
    }
  };

  if (!isOpen || !workout) return null;

  const completedCount = exercises.filter((e) => e.completed).length;
  const totalCount = exercises.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{
        backgroundColor: "rgba(10, 106, 86, 0.15)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl"
        style={{
          maxHeight: "90vh",
          border: "3px solid #0a6a56",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 10000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FitnessCenter style={{ color: "#0a6a56", fontSize: 32 }} />
                <h2 className="text-2xl font-bold" style={{ color: "#0a6a56" }}>
                  {workout.focusArea || workout.dayType}
                </h2>
              </div>
              <div
                className="flex items-center gap-4 text-sm"
                style={{ color: "#0b3d33", opacity: 0.8 }}
              >
                <span className="flex items-center gap-1">
                  <AccessTime fontSize="small" />
                  {workout.estimatedDuration} min
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FitnessCenter fontSize="small" />
                  {totalCount} exercises
                </span>
                <span>•</span>
                <span>{date}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
              style={{ color: "#0a6a56" }}
            >
              <Close />
            </button>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: "#0b3d33" }}>
                Progress: {completedCount}/{totalCount} exercises
              </span>
              <span className="text-sm font-bold" style={{ color: "#0a6a56" }}>
                {progress}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: "#c8ead6" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #0a6a56 0%, #69c68d 100%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Workout Type Badge */}
        <div className="flex gap-2 mb-6">
          <div
            className="px-4 py-2 rounded-full text-sm font-semibold"
            style={{ background: "#c8ead6", color: "#0a6a56" }}
          >
            Day {workout.dayNumber}
          </div>
          <div
            className="px-4 py-2 rounded-full text-sm font-semibold"
            style={{ background: "#0a6a56", color: "white" }}
          >
            {workout.dayType}
          </div>
        </div>

        {/* Exercises List */}
        <div
          className="overflow-y-auto pr-2"
          style={{
            flex: 1,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style>{`
            .overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <div
                key={exercise.exerciseId}
                className="rounded-2xl p-5 border-2 hover:shadow-lg transition-all"
                style={{
                  borderColor: exercise.completed ? "#69c68d" : "#c8ead6",
                  background: exercise.completed ? "#f0fdf4" : "#f8fdf9",
                  opacity: updatingExercise === exercise.exerciseId ? 0.6 : 1,
                }}
              >
                {/* Exercise Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: exercise.completed ? "#69c68d" : "#0a6a56" }}
                      >
                        {index + 1}
                      </span>
                      <h3
                        className="font-bold text-lg"
                        style={{
                          color: "#0a6a56",
                          textDecoration: exercise.completed ? "line-through" : "none",
                          opacity: exercise.completed ? 0.7 : 1,
                        }}
                      >
                        {exercise.exerciseName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 ml-9">
                      <div
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: "#dce642", color: "#0b3d33" }}
                      >
                        <Label fontSize="inherit" style={{ fontSize: 10, marginRight: 4 }} />
                        {exercise.category}
                      </div>
                    </div>
                  </div>
                  {exercise.videoUrl && (
                    <a
                      href={exercise.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 rounded-lg hover:opacity-80 transition-all"
                      style={{ background: "#ff7b17", color: "white", fontSize: 12 }}
                    >
                      <PlayCircleOutline fontSize="small" />
                      Video
                    </a>
                  )}
                </div>

                {/* Exercise Details */}
                <div className="grid grid-cols-3 gap-4 ml-9">
                  <div className="flex items-center gap-2">
                    <Repeat style={{ color: "#0a6a56", fontSize: 20 }} />
                    <div>
                      <div className="text-xs" style={{ color: "#0b3d33", opacity: 0.6 }}>
                        Sets
                      </div>
                      <div className="font-bold" style={{ color: "#0a6a56" }}>
                        {exercise.sets}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FitnessCenter style={{ color: "#0a6a56", fontSize: 20 }} />
                    <div>
                      <div className="text-xs" style={{ color: "#0b3d33", opacity: 0.6 }}>
                        Reps
                      </div>
                      <div className="font-bold" style={{ color: "#0a6a56" }}>
                        {exercise.reps}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer style={{ color: "#0a6a56", fontSize: 20 }} />
                    <div>
                      <div className="text-xs" style={{ color: "#0b3d33", opacity: 0.6 }}>
                        Rest
                      </div>
                      <div className="font-bold" style={{ color: "#0a6a56" }}>
                        {exercise.restSeconds}s
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exercise Notes */}
                {exercise.notes && (
                  <div
                    className="mt-3 ml-9 p-3 rounded-lg flex items-start gap-2"
                    style={{ background: "#fff9e6", border: "1px solid #dce642" }}
                  >
                    <Info style={{ color: "#ff7b17", fontSize: 18 }} />
                    <p className="text-sm" style={{ color: "#0b3d33" }}>
                      {exercise.notes}
                    </p>
                  </div>
                )}

                {/* Completion Button */}
                <div className="mt-4 ml-9">
                  <button
                    onClick={() => handleToggleComplete(exercise)}
                    disabled={!canComplete || updatingExercise === exercise.exerciseId}
                    className="w-full px-4 py-3 rounded-xl font-bold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: exercise.completed
                        ? "linear-gradient(90deg, #69c68d 0%, #0a6a56 100%)"
                        : "linear-gradient(90deg, #0a6a56 0%, #69c68d 100%)",
                      boxShadow: canComplete ? "0 4px 12px rgba(10, 106, 86, 0.3)" : "none",
                    }}
                  >
                    {exercise.completed ? (
                      <>
                        <CheckCircle style={{ fontSize: 24 }} />
                        Completed
                      </>
                    ) : (
                      <>
                        <CheckCircleOutline style={{ fontSize: 24 }} />
                        {canComplete ? "Mark as Complete" : "Available on Workout Day"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 pb-6 border-t-2" style={{ borderColor: "#c8ead6" }}>
          {/* Action Buttons Row */}
          {(onEditClick || onRegenerateClick || (allCompleted && onFeedbackClick)) && (
            <div className="flex gap-3 mb-3">
              {/* Edit Button */}
              {onEditClick && (
                <button
                  onClick={() => {
                    onEditClick();
                    onClose();
                  }}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 hover:bg-opacity-10 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                  style={{ borderColor: "#0ea5e9", color: "#0ea5e9" }}
                >
                  <Edit fontSize="small" />
                  Edit
                </button>
              )}

              {/* Regenerate Button */}
              {onRegenerateClick && (
                <button
                  onClick={() => {
                    onRegenerateClick();
                    onClose();
                  }}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 hover:bg-opacity-10 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                  style={{ borderColor: "#f59e0b", color: "#f59e0b" }}
                >
                  <Refresh fontSize="small" />
                  Regenerate
                </button>
              )}

              {/* Feedback Button - show for completed workouts */}
              {allCompleted && onFeedbackClick && (
                <button
                  onClick={() => {
                    onFeedbackClick();
                    onClose();
                  }}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 hover:bg-opacity-10 hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                  style={{ borderColor: "#10b981", color: "#10b981" }}
                >
                  <RateReview fontSize="small" />
                  Rate
                </button>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl font-semibold border-2 hover:bg-opacity-10 hover:bg-gray-200 transition-all"
            style={{ borderColor: "#0a6a56", color: "#0a6a56" }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
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
    </div>
  );
};

export default WorkoutDetailModal;
