import React, { useState, useEffect } from "react";
import {
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
  Flag,
} from "@mui/icons-material";
import {
  ExerciseDetail,
  ScheduleDayDetail,
  personalCoachService,
} from "@/services/personalCoachService";
import ReportBrokenLinkDialog from "./ReportBrokenLinkDialog";
import { useToast } from "@/hooks/useToast";

interface WorkoutDetailTabProps {
  workout: ScheduleDayDetail | null;
  date: string;
  onExerciseComplete?: (exerciseId: string, completed: boolean) => void;
  onFeedbackClick?: () => void;
  onEditClick?: () => void;
  onRegenerateClick?: () => void;
  scheduleId?: string;
}

const WorkoutDetailTab: React.FC<WorkoutDetailTabProps> = ({
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
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportingExercise, setReportingExercise] = useState<ExerciseDetail | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (workout) {
      setExercises(workout.exercises);
    }
  }, [workout]);

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
      showToast("You can only mark exercises as complete on the scheduled workout day!", "warning");
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

      setExercises((prev) =>
        prev.map((e) =>
          e.exerciseId === exercise.exerciseId ? { ...e, completed: newCompleted } : e
        )
      );

      if (onExerciseComplete) {
        onExerciseComplete(exercise.exerciseId, newCompleted);
      }

      showToast(
        newCompleted ? "Exercise marked as complete!" : "Exercise marked as incomplete",
        "success"
      );
    } catch (error) {
      console.error("Error toggling exercise completion:", error);
      showToast("Failed to update exercise status", "error");
    } finally {
      setUpdatingExercise(null);
    }
  };

  if (!workout) {
    return (
      <div className="text-center py-8" style={{ color: "#6b7280" }}>
        <FitnessCenter style={{ fontSize: 48, opacity: 0.3 }} />
        <p className="mt-2 text-sm">No workout selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Workout Header */}
      <div>
        <h3 className="text-lg font-bold" style={{ color: "#0b3d33" }}>
          {workout.focusArea}
        </h3>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
          {new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Workout Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className="p-3 rounded-xl border-2"
          style={{ borderColor: "#c8ead6", background: "#f0fdf4" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <FitnessCenter style={{ color: "#0a6a56", fontSize: 18 }} />
            <span className="text-xs font-medium" style={{ color: "#0b3d33", opacity: 0.7 }}>
              Exercises
            </span>
          </div>
          <div className="text-xl font-bold" style={{ color: "#0a6a56" }}>
            {exercises.length}
          </div>
        </div>

        <div
          className="p-3 rounded-xl border-2"
          style={{ borderColor: "#c8ead6", background: "#f0fdf4" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <AccessTime style={{ color: "#0a6a56", fontSize: 18 }} />
            <span className="text-xs font-medium" style={{ color: "#0b3d33", opacity: 0.7 }}>
              Duration
            </span>
          </div>
          <div className="text-xl font-bold" style={{ color: "#0a6a56" }}>
            {workout.estimatedDuration}m
          </div>
        </div>

        <div
          className="p-3 rounded-xl border-2"
          style={{ borderColor: "#c8ead6", background: allCompleted ? "#dcfce7" : "#f0fdf4" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle
              style={{
                color: allCompleted ? "#16a34a" : "#0a6a56",
                fontSize: 18,
              }}
            />
            <span className="text-xs font-medium" style={{ color: "#0b3d33", opacity: 0.7 }}>
              Progress
            </span>
          </div>
          <div
            className="text-xl font-bold"
            style={{ color: allCompleted ? "#16a34a" : "#0a6a56" }}
          >
            {exercises.filter((e) => e.completed).length}/{exercises.length}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {onFeedbackClick && allCompleted && (
          <button
            onClick={onFeedbackClick}
            className="flex-1 px-3 py-2 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
          >
            <div className="flex items-center justify-center gap-2">
              <RateReview fontSize="small" />
              Feedback
            </div>
          </button>
        )}
        {onEditClick && (
          <button
            onClick={onEditClick}
            className="flex-1 px-3 py-2 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)" }}
          >
            <div className="flex items-center justify-center gap-2">
              <Edit fontSize="small" />
              Edit
            </div>
          </button>
        )}
        {onRegenerateClick && (
          <button
            onClick={onRegenerateClick}
            className="flex-1 px-3 py-2 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
          >
            <div className="flex items-center justify-center gap-2">
              <Refresh fontSize="small" />
              Regenerate
            </div>
          </button>
        )}
      </div>

      {/* Exercises List */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold" style={{ color: "#0b3d33" }}>
          Exercises
        </h4>
        {exercises.map((exercise, index) => (
          <div
            key={exercise.exerciseId}
            className="p-3 rounded-xl border-2 transition-all"
            style={{
              borderColor: exercise.completed ? "#86efac" : "#c8ead6",
              background: exercise.completed ? "#dcfce7" : "white",
              opacity: updatingExercise === exercise.exerciseId ? 0.6 : 1,
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: "#6b7280" }}>
                    {index + 1}
                  </span>
                  <h5 className="text-sm font-bold" style={{ color: "#0b3d33" }}>
                    {exercise.exerciseName}
                  </h5>
                </div>
                {exercise.category && (
                  <div className="flex items-center gap-1 mt-1">
                    <Label style={{ fontSize: 14, color: "#0a6a56" }} />
                    <span className="text-xs" style={{ color: "#6b7280" }}>
                      {exercise.category}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleToggleComplete(exercise)}
                disabled={!canComplete || updatingExercise === exercise.exerciseId}
                className="transition-all disabled:opacity-50"
              >
                {exercise.completed ? (
                  <CheckCircle style={{ color: "#16a34a", fontSize: 24 }} />
                ) : (
                  <CheckCircleOutline style={{ color: "#9ca3af", fontSize: 24 }} />
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Repeat style={{ fontSize: 14, color: "#0a6a56" }} />
                <span style={{ color: "#6b7280" }}>
                  {exercise.sets} sets
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Timer style={{ fontSize: 14, color: "#0a6a56" }} />
                <span style={{ color: "#6b7280" }}>
                  {exercise.reps} reps
                </span>
              </div>
              {exercise.restSeconds && (
                <div className="flex items-center gap-1">
                  <AccessTime style={{ fontSize: 14, color: "#0a6a56" }} />
                  <span style={{ color: "#6b7280" }}>
                    {exercise.restSeconds}s
                  </span>
                </div>
              )}
            </div>

            {exercise.notes && (
              <div className="mt-2 pt-2 border-t" style={{ borderColor: "#e5e7eb" }}>
                <div className="flex items-start gap-1">
                  <Info style={{ fontSize: 14, color: "#6b7280", marginTop: 2 }} />
                  <p className="text-xs" style={{ color: "#6b7280" }}>
                    {exercise.notes}
                  </p>
                </div>
              </div>
            )}

            {exercise.videoUrl && (
              <div className="mt-2 flex items-center gap-3">
                <a
                  href={exercise.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs hover:underline"
                  style={{ color: "#0a6a56" }}
                >
                  <PlayCircleOutline style={{ fontSize: 14 }} />
                  Watch Tutorial
                </a>
                <button
                  onClick={() => {
                    setReportingExercise(exercise);
                    setShowReportDialog(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs hover:underline"
                  style={{ color: "#dc2626" }}
                  title="Report broken video link"
                >
                  <Flag style={{ fontSize: 12 }} />
                  Report
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Report Broken Link Dialog */}
      {reportingExercise && (
        <ReportBrokenLinkDialog
          isOpen={showReportDialog}
          onClose={() => {
            setShowReportDialog(false);
            setReportingExercise(null);
          }}
          exerciseId={reportingExercise.exerciseId}
          exerciseName={reportingExercise.exerciseName}
          videoUrl={reportingExercise.videoUrl || ""}
          onReportSuccess={() => {
            showToast("Thank you for reporting! We'll review this issue soon.", "success");
          }}
        />
      )}
    </div>
  );
};

export default WorkoutDetailTab;

