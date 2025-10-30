import React, { useState } from "react";
import {
  Close,
  AutoAwesome,
  CalendarMonth,
  TrendingUp,
  Refresh,
  Warning,
  CheckCircle,
} from "@mui/icons-material";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RegenerateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (request: RegenerateRequestData) => Promise<void>;
  currentScheduleId: string;
  completedDays: number;
  totalDays: number;
  currentDifficulty: string;
  creditBalance?: {
    remainingCredits: number;
    monthlyCredits: number;
    usedCreditsThisMonth: number;
    canAffordOperation: boolean;
    subscriptionTier: string;
    daysUntilReset: number;
  } | null;
}

export interface RegenerateRequestData {
  currentScheduleId: string;
  fromDayNumber: number;
  reason: string;
  additionalNotes?: string;
  preserveCompleted: boolean;
  newDifficultyLevel?: string;
}

const RegenerateScheduleModal: React.FC<RegenerateScheduleModalProps> = ({
  isOpen,
  onClose,
  onRegenerate,
  currentScheduleId,
  completedDays,
  totalDays,
  currentDifficulty,
  creditBalance,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<RegenerateRequestData>({
    currentScheduleId,
    fromDayNumber: completedDays + 1,
    reason: "user_request",
    preserveCompleted: true,
    additionalNotes: "",
  });

  const reasonOptions = [
    {
      value: "too_hard",
      label: "Workouts are too challenging",
      icon: <Warning />,
      color: "#ef4444",
    },
    { value: "too_easy", label: "Workouts are too easy", icon: <TrendingUp />, color: "#10b981" },
    {
      value: "busy",
      label: "Schedule conflict / Too busy",
      icon: <CalendarMonth />,
      color: "#f59e0b",
    },
    { value: "injury", label: "Injury or health concern", icon: <Warning />, color: "#ef4444" },
    {
      value: "user_request",
      label: "Want different exercises",
      icon: <Refresh />,
      color: "#0a6a56",
    },
  ];

  const handleSubmit = async () => {
    setIsGenerating(true);
    try {
      await onRegenerate(formData);
      onClose();
    } catch (error) {
      console.error("Failed to regenerate schedule:", error);
    } finally {
      setIsGenerating(false);
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
            <AutoAwesome style={{ color: "#0a6a56", fontSize: 32 }} />
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "#0a6a56" }}>
                Regenerate Workout Plan
              </h2>
              <p className="text-sm mt-1" style={{ color: "#0b3d33", opacity: 0.7 }}>
                Keep your progress, get a fresh plan
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

        {/* AI Credit Warning */}
        {creditBalance && !creditBalance.canAffordOperation && (
          <div className="px-6">
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Warning style={{ color: "#dc2626", fontSize: 24 }} />
                <div>
                  <h3 className="font-bold text-sm" style={{ color: "#991b1b" }}>
                    Insufficient AI Credits
                  </h3>
                  <p className="text-xs mt-1" style={{ color: "#991b1b", opacity: 0.9 }}>
                    You have {(creditBalance.remainingCredits ?? 0).toLocaleString()} of {(creditBalance.monthlyCredits ?? 0).toLocaleString()} tokens remaining.
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#991b1b", opacity: 0.7 }}>
                    Resets in {creditBalance.daysUntilReset ?? 30}{" "}
                    {(creditBalance.daysUntilReset ?? 30) === 1 ? "day" : "days"} or upgrade for more tokens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-5 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
          {/* Progress Info */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle style={{ color: "#10b981", fontSize: 20 }} />
              <span className="font-semibold" style={{ color: "#0a6a56" }}>
                Your Progress Will Be Saved
              </span>
            </div>
            <p className="text-sm" style={{ color: "#0b3d33", opacity: 0.8 }}>
              You've completed {completedDays} out of {totalDays} workouts. We'll keep all your
              completed workouts and regenerate the remaining days.
            </p>
          </div>

          {/* Regenerate From Day - Visual Selector */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#0a6a56" }}>
              Choose where to start regenerating
            </label>
            
            {/* Visual Day Timeline */}
            <div className="space-y-3">
              {/* Completed Days Preview */}
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle style={{ color: "#10b981", fontSize: 16 }} />
                <span className="text-xs font-medium" style={{ color: "#0b3d33", opacity: 0.8 }}>
                  Days 1-{completedDays} completed (will be kept)
                </span>
              </div>

              {/* Day Selector Cards */}
              <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1">
                {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
                  const isCompleted = day <= completedDays;
                  const isSelected = day === formData.fromDayNumber;
                  const willBeRegenerated = day >= formData.fromDayNumber;

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        if (!isCompleted) {
                          setFormData({ ...formData, fromDayNumber: day });
                        }
                      }}
                      disabled={isCompleted}
                      className={`
                        relative p-3 rounded-lg border-2 transition-all text-center
                        ${isCompleted ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-105"}
                        ${isSelected ? "shadow-lg ring-2 ring-offset-1" : ""}
                      `}
                      style={{
                        borderColor: isCompleted
                          ? "#10b981"
                          : isSelected
                          ? "#0a6a56"
                          : willBeRegenerated
                          ? "#f59e0b"
                          : "#c8ead6",
                        background: isCompleted
                          ? "#d1fae5"
                          : isSelected
                          ? "#d1f4e0"
                          : willBeRegenerated
                          ? "#fef3c7"
                          : "white",
                        ringColor: isSelected ? "#0a6a56" : undefined,
                      }}
                    >
                      <div
                        className="text-xs font-bold"
                        style={{
                          color: isCompleted ? "#059669" : willBeRegenerated ? "#d97706" : "#0a6a56",
                        }}
                      >
                        Day {day}
                      </div>
                      {isCompleted && (
                        <CheckCircle
                          style={{
                            fontSize: 12,
                            color: "#059669",
                            position: "absolute",
                            top: 2,
                            right: 2,
                          }}
                        />
                      )}
                      {isSelected && !isCompleted && (
                        <div
                          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                          style={{ background: "#0a6a56" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 pt-2 border-t" style={{ borderColor: "#e5e7eb" }}>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2" style={{ borderColor: "#10b981", background: "#d1fae5" }} />
                  <span className="text-xs" style={{ color: "#0b3d33", opacity: 0.7 }}>
                    Completed & Saved
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2" style={{ borderColor: "#f59e0b", background: "#fef3c7" }} />
                  <span className="text-xs" style={{ color: "#0b3d33", opacity: 0.7 }}>
                    Will Regenerate
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2" style={{ borderColor: "#0a6a56", background: "#d1f4e0" }} />
                  <span className="text-xs" style={{ color: "#0b3d33", opacity: 0.7 }}>
                    Selected Start
                  </span>
                </div>
              </div>

              {/* Summary Text */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3">
                <p className="text-sm font-medium" style={{ color: "#d97706" }}>
                  Days {formData.fromDayNumber}-{totalDays} will be regenerated ({totalDays - formData.fromDayNumber + 1} days)
                </p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#0a6a56" }}>
              Why do you want to regenerate?
            </label>
            <div className="space-y-2">
              {reasonOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, reason: option.value })}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    formData.reason === option.value ? "shadow-md" : "hover:shadow-sm"
                  }`}
                  style={{
                    borderColor: formData.reason === option.value ? option.color : "#c8ead6",
                    background: formData.reason === option.value ? `${option.color}15` : "white",
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

          {/* Difficulty Adjustment */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0a6a56" }}>
              Adjust Difficulty (Optional)
            </label>
            <Select
              value={formData.newDifficultyLevel || currentDifficulty}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  newDifficultyLevel: value === currentDifficulty ? undefined : value,
                })
              }
            >
              <SelectTrigger
                className="w-full border-2 rounded-xl focus:ring-2 focus:ring-green-500/20"
                style={{ borderColor: "#c8ead6" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className="border border-green-200 bg-white shadow-lg z-[10000]"
                style={{ zIndex: 10000 }}
                position="popper"
              >
                <SelectItem value="beginner">Beginner (Easier)</SelectItem>
                <SelectItem value="intermediate">Intermediate (Moderate)</SelectItem>
                <SelectItem value="advanced">Advanced (Harder)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs mt-1" style={{ color: "#0b3d33", opacity: 0.6 }}>
              Current: {currentDifficulty}. AI will auto-adjust based on your feedback if left
              unchanged.
            </p>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0a6a56" }}>
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              placeholder="Tell the AI how you want the new plan to be different..."
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
              style={{ borderColor: "#c8ead6", minHeight: "80px" }}
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
            disabled={isGenerating}
            className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 hover:bg-opacity-10 hover:bg-gray-200 transition-all disabled:opacity-50"
            style={{ borderColor: "#0a6a56", color: "#0a6a56" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isGenerating || !!(creditBalance && !creditBalance.canAffordOperation)}
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: "#0a6a56" }}
          >
            {isGenerating ? (
              <>
                <AutoAwesome className="animate-spin" fontSize="small" />
                Regenerating...
              </>
            ) : (
              <>
                <Refresh fontSize="small" />
                Regenerate Plan
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

export default RegenerateScheduleModal;
