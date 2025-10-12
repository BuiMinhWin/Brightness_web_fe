import React, { useState, useEffect } from "react";
import {
  Close,
  History,
  TrendingUp,
  CheckCircle,
  Schedule,
  Refresh,
  Star,
} from "@mui/icons-material";
import { personalCoachService } from "@/services/personalCoachService";

interface ScheduleHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface ScheduleVersion {
  scheduleId: string;
  version: number;
  createdAt: string;
  isLatest: boolean;
  status: string;
  totalDays: number;
  completedDays: number;
  completionPercentage: number;
  regenerationReason?: string;
}

interface Analytics {
  totalWorkoutsCompleted: number;
  totalWorkoutsPlanned: number;
  overallCompletionRate: number;
  completionByFocusArea: { [key: string]: number };
  mostCompletedExercises: string[];
  recentFeedback: Array<{
    date: string;
    difficultyRating: string;
    notes?: string;
  }>;
}

const ScheduleHistoryModal: React.FC<ScheduleHistoryModalProps> = ({ isOpen, onClose, userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [versions, setVersions] = useState<ScheduleVersion[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadHistory();
    }
  }, [isOpen, userId]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await personalCoachService.getScheduleHistory(userId);
      setVersions(response.versions || []);
      setAnalytics(response.analytics || null);
    } catch (error) {
      console.error("Failed to load schedule history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDifficultyColor = (rating: string) => {
    switch (rating) {
      case "too_easy":
        return "#10b981";
      case "just_right":
        return "#0a6a56";
      case "too_hard":
        return "#f59e0b";
      case "could_not_complete":
        return "#ef4444";
      default:
        return "#6b7280";
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-4 flex flex-col"
        style={{
          maxHeight: "90vh",
          border: "2px solid #c8ead6",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <History style={{ color: "#0a6a56", fontSize: 32 }} />
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "#0a6a56" }}>
                Schedule History
              </h2>
              <p className="text-sm mt-1" style={{ color: "#0b3d33", opacity: 0.7 }}>
                Your workout journey & analytics
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
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
              <p style={{ color: "#0a6a56" }}>Loading your history...</p>
            </div>
          ) : (
            <>
              {/* Analytics Summary */}
              {analytics && (
                <div className="mb-6 grid grid-cols-3 gap-4">
                  <div
                    className="p-4 rounded-xl border-2"
                    style={{ borderColor: "#c8ead6", background: "#f0fdf4" }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle style={{ color: "#10b981", fontSize: 20 }} />
                      <span
                        className="text-xs font-medium"
                        style={{ color: "#0b3d33", opacity: 0.7 }}
                      >
                        Completion Rate
                      </span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: "#0a6a56" }}>
                      {analytics.overallCompletionRate}%
                    </div>
                    <div className="text-xs mt-1" style={{ color: "#0b3d33", opacity: 0.6 }}>
                      {analytics.totalWorkoutsCompleted} of {analytics.totalWorkoutsPlanned}{" "}
                      workouts
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-xl border-2"
                    style={{ borderColor: "#c8ead6", background: "#fef3c7" }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Star style={{ color: "#f59e0b", fontSize: 20 }} />
                      <span
                        className="text-xs font-medium"
                        style={{ color: "#0b3d33", opacity: 0.7 }}
                      >
                        Top Exercise
                      </span>
                    </div>
                    <div className="text-sm font-bold truncate" style={{ color: "#0a6a56" }}>
                      {analytics.mostCompletedExercises[0] || "None yet"}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "#0b3d33", opacity: 0.6 }}>
                      Most completed
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-xl border-2"
                    style={{ borderColor: "#c8ead6", background: "#e0f2fe" }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp style={{ color: "#0ea5e9", fontSize: 20 }} />
                      <span
                        className="text-xs font-medium"
                        style={{ color: "#0b3d33", opacity: 0.7 }}
                      >
                        Versions
                      </span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: "#0a6a56" }}>
                      {versions.length}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "#0b3d33", opacity: 0.6 }}>
                      Schedule iterations
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Versions */}
              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: "#0a6a56" }}>
                  Schedule Versions
                </h3>
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div
                      key={version.scheduleId}
                      className={`p-4 rounded-xl border-2 ${version.isLatest ? "shadow-md" : ""}`}
                      style={{
                        borderColor: version.isLatest ? "#0a6a56" : "#c8ead6",
                        background: version.isLatest ? "#f0fdf4" : "white",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Schedule style={{ color: "#0a6a56", fontSize: 20 }} />
                          <span className="font-bold" style={{ color: "#0a6a56" }}>
                            Version {version.version}
                          </span>
                          {version.isLatest && (
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                              style={{ background: "#10b981" }}
                            >
                              Current
                            </span>
                          )}
                        </div>
                        <span className="text-xs" style={{ color: "#0b3d33", opacity: 0.6 }}>
                          {formatDate(version.createdAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-2">
                        <div>
                          <div className="text-xs" style={{ color: "#0b3d33", opacity: 0.6 }}>
                            Progress
                          </div>
                          <div className="text-sm font-semibold" style={{ color: "#0a6a56" }}>
                            {version.completedDays}/{version.totalDays} days
                          </div>
                        </div>
                        <div>
                          <div className="text-xs" style={{ color: "#0b3d33", opacity: 0.6 }}>
                            Completion
                          </div>
                          <div className="text-sm font-semibold" style={{ color: "#0a6a56" }}>
                            {version.completionPercentage}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs" style={{ color: "#0b3d33", opacity: 0.6 }}>
                            Status
                          </div>
                          <div
                            className="text-sm font-semibold capitalize"
                            style={{ color: "#0a6a56" }}
                          >
                            {version.status}
                          </div>
                        </div>
                      </div>

                      {version.regenerationReason && (
                        <div
                          className="flex items-center gap-2 mt-2 pt-2 border-t"
                          style={{ borderColor: "#e5e7eb" }}
                        >
                          <Refresh style={{ fontSize: 16, color: "#f59e0b" }} />
                          <span className="text-xs" style={{ color: "#0b3d33", opacity: 0.7 }}>
                            Regenerated: {version.regenerationReason.replace(/_/g, " ")}
                          </span>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${version.completionPercentage}%`,
                              background:
                                "linear-gradient(90deg, #fbbf24 0%, #f59e0b 25%, #84cc16 75%, #22c55e 100%)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Feedback */}
              {analytics && analytics.recentFeedback.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-3" style={{ color: "#0a6a56" }}>
                    Recent Feedback
                  </h3>
                  <div className="space-y-2">
                    {analytics.recentFeedback.map((feedback, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl border-2"
                        style={{ borderColor: "#c8ead6" }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ background: getDifficultyColor(feedback.difficultyRating) }}
                            />
                            <span className="text-sm font-medium" style={{ color: "#0b3d33" }}>
                              {feedback.difficultyRating.replace(/_/g, " ")}
                            </span>
                          </div>
                          <span className="text-xs" style={{ color: "#0b3d33", opacity: 0.6 }}>
                            {formatDate(feedback.date)}
                          </span>
                        </div>
                        {feedback.notes && (
                          <p className="text-xs mt-2" style={{ color: "#0b3d33", opacity: 0.7 }}>
                            {feedback.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 pb-6 flex gap-3 mt-6 pt-4 border-t-2"
          style={{ borderColor: "#c8ead6" }}
        >
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl font-semibold border-2 hover:bg-opacity-10 hover:bg-gray-200 transition-all"
            style={{ borderColor: "#0a6a56", color: "#0a6a56" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleHistoryModal;
