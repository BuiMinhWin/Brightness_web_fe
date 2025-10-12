import React, { useState, useEffect } from "react";
import { Close, Edit, FitnessCenter, Add, Remove, Save, Delete } from "@mui/icons-material";
import { ScheduleDayDetail } from "@/services/personalCoachService";

interface EditWorkoutDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (editData: EditWorkoutDayData) => Promise<void>;
  workout: ScheduleDayDetail | null;
}

export interface EditWorkoutDayData {
  scheduleDayId: string;
  newFocusArea?: string;
  modifiedExercises?: Array<{
    exerciseId: string;
    newSets?: number;
    newReps?: string;
    newRestSeconds?: number;
  }>;
  exercisesToRemove?: string[];
}

const EditWorkoutDayModal: React.FC<EditWorkoutDayModalProps> = ({
  isOpen,
  onClose,
  onSave,
  workout,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [focusArea, setFocusArea] = useState("");
  const [exercises, setExercises] = useState<any[]>([]);
  const [removedExercises, setRemovedExercises] = useState<string[]>([]);

  useEffect(() => {
    if (workout) {
      setFocusArea(workout.focusArea);
      setExercises(
        workout.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          name: e.exerciseName,
          sets: e.sets,
          reps: e.reps,
          restSeconds: e.restSeconds,
        }))
      );
      setRemovedExercises([]);
    }
  }, [workout, isOpen]);

  const handleSave = async () => {
    if (!workout) return;

    setIsSaving(true);
    try {
      const modifiedExercises = exercises
        .filter((e) => {
          const original = workout.exercises.find((ex) => ex.exerciseId === e.exerciseId);
          return (
            original &&
            (original.sets !== e.sets ||
              original.reps !== e.reps ||
              original.restSeconds !== e.restSeconds)
          );
        })
        .map((e) => ({
          exerciseId: e.exerciseId,
          newSets: e.sets,
          newReps: e.reps,
          newRestSeconds: e.restSeconds,
        }));

      const editData: EditWorkoutDayData = {
        scheduleDayId: workout.scheduleDayId,
        newFocusArea: focusArea !== workout.focusArea ? focusArea : undefined,
        modifiedExercises: modifiedExercises.length > 0 ? modifiedExercises : undefined,
        exercisesToRemove: removedExercises.length > 0 ? removedExercises : undefined,
      };

      await onSave(editData);
      onClose();
    } catch (error) {
      console.error("Failed to save edits:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setRemovedExercises([...removedExercises, exerciseId]);
    setExercises(exercises.filter((e) => e.exerciseId !== exerciseId));
  };

  const handleUpdateExercise = (exerciseId: string, field: string, value: any) => {
    setExercises(
      exercises.map((e) => (e.exerciseId === exerciseId ? { ...e, [field]: value } : e))
    );
  };

  if (!isOpen || !workout) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      style={{
        background: "rgba(10, 106, 86, 0.15)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col"
        style={{
          maxHeight: "90vh",
          border: "2px solid #c8ead6",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Edit style={{ color: "#0a6a56", fontSize: 32 }} />
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "#0a6a56" }}>
                Edit Workout Day
              </h2>
              <p className="text-sm mt-1" style={{ color: "#0b3d33", opacity: 0.7 }}>
                Day {workout.dayNumber}: {workout.focusArea}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all"
          >
            <Close style={{ color: "#0a6a56" }} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto space-y-4 flex-1 scrollbar-hide">
          {/* Focus Area */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0a6a56" }}>
              Focus Area
            </label>
            <input
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
              style={{ borderColor: "#c8ead6" }}
            />
          </div>

          {/* Exercises List */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#0a6a56" }}>
              <FitnessCenter style={{ fontSize: 18, verticalAlign: "middle", marginRight: 4 }} />
              Exercises
            </label>
            <div className="space-y-3">
              {exercises.map((exercise) => (
                <div
                  key={exercise.exerciseId}
                  className="p-4 border-2 rounded-xl"
                  style={{ borderColor: "#c8ead6" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold" style={{ color: "#0a6a56" }}>
                      {exercise.name}
                    </span>
                    <button
                      onClick={() => handleRemoveExercise(exercise.exerciseId)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-all"
                      style={{ color: "#ef4444" }}
                    >
                      <Delete fontSize="small" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label
                        className="block text-xs font-medium mb-1"
                        style={{ color: "#0b3d33", opacity: 0.7 }}
                      >
                        Sets
                      </label>
                      <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) =>
                          handleUpdateExercise(
                            exercise.exerciseId,
                            "sets",
                            parseInt(e.target.value)
                          )
                        }
                        min="1"
                        max="10"
                        className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        style={{ borderColor: "#c8ead6" }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium mb-1"
                        style={{ color: "#0b3d33", opacity: 0.7 }}
                      >
                        Reps
                      </label>
                      <input
                        type="text"
                        value={exercise.reps}
                        onChange={(e) =>
                          handleUpdateExercise(exercise.exerciseId, "reps", e.target.value)
                        }
                        className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        style={{ borderColor: "#c8ead6" }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium mb-1"
                        style={{ color: "#0b3d33", opacity: 0.7 }}
                      >
                        Rest (sec)
                      </label>
                      <input
                        type="number"
                        value={exercise.restSeconds}
                        onChange={(e) =>
                          handleUpdateExercise(
                            exercise.exerciseId,
                            "restSeconds",
                            parseInt(e.target.value)
                          )
                        }
                        min="15"
                        max="300"
                        step="15"
                        className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        style={{ borderColor: "#c8ead6" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 pb-6 flex gap-3 mt-6 pt-4 border-t-2"
          style={{ borderColor: "#c8ead6" }}
        >
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 hover:bg-opacity-10 hover:bg-gray-200 transition-all disabled:opacity-50"
            style={{ borderColor: "#0a6a56", color: "#0a6a56" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: "#0a6a56" }}
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save fontSize="small" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditWorkoutDayModal;
