import React, { useState, useEffect } from "react";
import {
  History,
  TrendingUp,
  CheckCircle,
  Schedule,
  Refresh,
  Star,
} from "@mui/icons-material";
import { personalCoachService } from "@/services/personalCoachService";

interface HistoryTabProps {
  userId: string;
  isVisible: boolean;
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

const HistoryTab: React.FC<HistoryTabProps> = ({ userId, isVisible }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [versions, setVersions] = useState<ScheduleVersion[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (isVisible && userId) {
      loadHistory();
    }
  }, [isVisible, userId]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await personalCoachService.getScheduleHistory(userId);
      setVersions((response as any).versions || []);
      setAnalytics((response as any).analytics || null);
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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
        <p style={{ color: "#0a6a56" }}>Loading your history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 gap-3">
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
              {analytics.totalWorkoutsCompleted} of {analytics.totalWorkoutsPlanned} workouts
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                Iterations
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Versions */}
      <div>
        <h3 className="text-base font-bold mb-3" style={{ color: "#0a6a56" }}>
          Schedule Versions
        </h3>
        <div className="space-y-3">
          {versions.length === 0 ? (
            <div className="text-center py-8" style={{ color: "#6b7280" }}>
              <History style={{ fontSize: 48, opacity: 0.3 }} />
              <p className="mt-2 text-sm">No schedule history yet</p>
            </div>
          ) : (
            versions.map((version) => (
              <div
                key={version.scheduleId}
                className={`p-3 rounded-xl border-2 ${version.isLatest ? "shadow-md" : ""}`}
                style={{
                  borderColor: version.isLatest ? "#0a6a56" : "#c8ead6",
                  background: version.isLatest ? "#f0fdf4" : "white",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Schedule style={{ color: "#0a6a56", fontSize: 18 }} />
                    <span className="font-bold text-sm" style={{ color: "#0a6a56" }}>
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

                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div>
                    <div className="text-xs" style={{ color: "#0b3d33", opacity: 0.6 }}>
                      Progress
                    </div>
                    <div className="text-xs font-semibold" style={{ color: "#0a6a56" }}>
                      {version.completedDays}/{version.totalDays}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: "#0b3d33", opacity: 0.6 }}>
                      Rate
                    </div>
                    <div className="text-xs font-semibold" style={{ color: "#0a6a56" }}>
                      {version.completionPercentage}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: "#0b3d33", opacity: 0.6 }}>
                      Status
                    </div>
                    <div
                      className="text-xs font-semibold capitalize"
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
                    <Refresh style={{ fontSize: 14, color: "#f59e0b" }} />
                    <span className="text-xs" style={{ color: "#0b3d33", opacity: 0.7 }}>
                      Regenerated: {version.regenerationReason.replace(/_/g, " ")}
                    </span>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${version.completionPercentage}%`,
                        background:
                          "linear-gradient(90deg, #fbbf24 0%, #f59e0b 25%, #84cc16 75%, #22c55e 100%)",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Feedback */}
      {analytics && analytics.recentFeedback.length > 0 && (
        <div>
          <h3 className="text-base font-bold mb-3" style={{ color: "#0a6a56" }}>
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
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: getDifficultyColor(feedback.difficultyRating) }}
                    />
                    <span className="text-xs font-medium" style={{ color: "#0b3d33" }}>
                      {feedback.difficultyRating.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: "#0b3d33", opacity: 0.6 }}>
                    {formatDate(feedback.date)}
                  </span>
                </div>
                {feedback.notes && (
                  <p className="text-xs mt-1" style={{ color: "#0b3d33", opacity: 0.7 }}>
                    {feedback.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;

