import React, { useState } from "react";
import {
  Close,
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
  Bolt,
  FitnessCenter,
  Schedule,
  Send,
} from "@mui/icons-material";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkoutFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: WorkoutFeedbackData) => Promise<void>;
  scheduleId: string;
  scheduleDayId: string;
  dayNumber: number;
  workoutTitle: string;
}

export interface WorkoutFeedbackData {
  scheduleId: string;
  scheduleDayId: string;
  dayNumber: number;
  difficultyRating: string;
  energyLevel?: number;
  sorenessLevel?: number;
  tookLongerThanExpected?: boolean;
  actualDurationMinutes?: number;
  notes?: string;
  contextTags?: string[];
}

const WorkoutFeedbackModal: React.FC<WorkoutFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  scheduleId,
  scheduleDayId,
  dayNumber,
  workoutTitle,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<WorkoutFeedbackData>({
    scheduleId,
    scheduleDayId,
    dayNumber,
    difficultyRating: "just_right",
    energyLevel: 3,
    sorenessLevel: 2,
    tookLongerThanExpected: false,
    notes: "",
    contextTags: [],
  });

  const difficultyOptions = [
    { value: "too_easy", label: "Too Easy", icon: <SentimentVeryDissatisfied />, color: "#10b981" },
    { value: "just_right", label: "Just Right", icon: <SentimentSatisfied />, color: "#0a6a56" },
    { value: "too_hard", label: "Too Hard", icon: <SentimentDissatisfied />, color: "#f59e0b" },
    {
      value: "could_not_complete",
      label: "Couldn't Complete",
      icon: <SentimentVeryDissatisfied />,
      color: "#ef4444",
    },
  ];

  const contextTagOptions = [
    "busy_day",
    "not_enough_sleep",
    "feeling_sick",
    "high_stress",
    "extra_motivated",
    "good_recovery",
    "injury_flare_up",
    "time_constrained",
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col"
        style={{
          maxHeight: "90vh",
          border: "2px solid #c8ead6",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FitnessCenter style={{ color: "#0a6a56", fontSize: 32 }} />
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "#0a6a56" }}>
                Workout Feedback
              </h2>
              <p className="text-sm mt-1" style={{ color: "#0b3d33", opacity: 0.7 }}>
                Day {dayNumber}: {workoutTitle}
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
        <div className="px-6 py-5 overflow-y-auto flex-1 scrollbar-hide">
          {/* Difficulty Rating */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3" style={{ color: "#0a6a56" }}>
              How was the workout difficulty?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, difficultyRating: option.value })}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    formData.difficultyRating === option.value ? "shadow-lg" : "hover:shadow-md"
                  }`}
                  style={{
                    borderColor:
                      formData.difficultyRating === option.value ? option.color : "#c8ead6",
                    background:
                      formData.difficultyRating === option.value ? `${option.color}15` : "white",
                  }}
                >
                  <div style={{ color: option.color }}>{option.icon}</div>
                  <span className="font-medium" style={{ color: "#0b3d33" }}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0a6a56" }}>
              <Bolt style={{ fontSize: 18, verticalAlign: "middle", marginRight: 4 }} />
              Energy Level (1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, energyLevel: level })}
                  className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${
                    formData.energyLevel === level ? "shadow-md" : ""
                  }`}
                  style={{
                    borderColor: formData.energyLevel === level ? "#0a6a56" : "#c8ead6",
                    background: formData.energyLevel === level ? "#0a6a5615" : "white",
                    color: "#0a6a56",
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Soreness Level */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0a6a56" }}>
              <FitnessCenter style={{ fontSize: 18, verticalAlign: "middle", marginRight: 4 }} />
              Muscle Soreness (1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, sorenessLevel: level })}
                  className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${
                    formData.sorenessLevel === level ? "shadow-md" : ""
                  }`}
                  style={{
                    borderColor: formData.sorenessLevel === level ? "#0a6a56" : "#c8ead6",
                    background: formData.sorenessLevel === level ? "#0a6a5615" : "white",
                    color: "#0a6a56",
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs mt-1" style={{ color: "#0b3d33", opacity: 0.6 }}>
              1 = No soreness, 5 = Very sore
            </p>
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0a6a56" }}>
              <Schedule style={{ fontSize: 18, verticalAlign: "middle", marginRight: 4 }} />
              Did it take longer than expected?
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormData({ ...formData, tookLongerThanExpected: false })}
                className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                  formData.tookLongerThanExpected === false ? "shadow-md" : ""
                }`}
                style={{
                  borderColor: formData.tookLongerThanExpected === false ? "#0a6a56" : "#c8ead6",
                  background: formData.tookLongerThanExpected === false ? "#0a6a5615" : "white",
                  color: "#0a6a56",
                }}
              >
                No, on time
              </button>
              <button
                onClick={() => setFormData({ ...formData, tookLongerThanExpected: true })}
                className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                  formData.tookLongerThanExpected === true ? "shadow-md" : ""
                }`}
                style={{
                  borderColor: formData.tookLongerThanExpected === true ? "#f59e0b" : "#c8ead6",
                  background: formData.tookLongerThanExpected === true ? "#f59e0b15" : "white",
                  color: "#f59e0b",
                }}
              >
                Yes, took longer
              </button>
            </div>
          </div>

          {/* Context Tags */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0a6a56" }}>
              Any factors affecting your workout?
            </label>
            <div className="flex flex-wrap gap-2">
              {contextTagOptions.map((tag) => {
                const isSelected = formData.contextTags?.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      const currentTags = formData.contextTags || [];
                      const newTags = isSelected
                        ? currentTags.filter((t) => t !== tag)
                        : [...currentTags, tag];
                      setFormData({ ...formData, contextTags: newTags });
                    }}
                    className={`px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                      isSelected ? "shadow-sm" : ""
                    }`}
                    style={{
                      borderColor: isSelected ? "#0a6a56" : "#c8ead6",
                      background: isSelected ? "#0a6a5615" : "white",
                      color: "#0a6a56",
                    }}
                  >
                    {tag.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0a6a56" }}>
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any specific comments about the workout?"
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
              style={{ borderColor: "#c8ead6", minHeight: "100px" }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 pb-6 flex gap-3 mt-6 pt-4 border-t-2"
          style={{ borderColor: "#c8ead6" }}
        >
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 hover:bg-opacity-10 hover:bg-gray-200 transition-all disabled:opacity-50"
            style={{ borderColor: "#0a6a56", color: "#0a6a56" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: "#0a6a56" }}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send fontSize="small" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global CSS for dropdown z-index */}
      <style>{`
        [data-radix-popper-content-wrapper],
        [data-radix-select-content] {
          z-index: 10000 !important;
        }
      `}</style>
    </div>
  );
};

export default WorkoutFeedbackModal;
