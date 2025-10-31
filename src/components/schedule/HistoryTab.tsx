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

interface ScheduleHistoryEntry {
  id: string;
  scheduleId: string;
  version: number;
  actionType: string;
  changeReason?: string;
  userNotes?: string;
  fromDayNumber?: number;
  previousDifficulty?: string;
  newDifficulty?: string;
  totalDays: number;
  completedDays: number;
  completionRate: number;
  tokensUsed: number;
  createdAt: string;
  configurationSnapshot?: string;
}

interface Analytics {
  userId: string;
  totalScheduleHistoryEntries: number;
  totalRegenerations: number;
  totalTokensUsed: number;
  averageCompletionRate: number;
  mostCommonChangeReason: string;
  lastActivityDate?: string;
  scheduleVersions: Array<{
    scheduleId: string;
    version: number;
    createdAt: string;
    actionType: string;
    tokensUsed: number;
  }>;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ userId, isVisible }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<ScheduleHistoryEntry[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (isVisible && userId) {
      loadHistory();
    }
  }, [isVisible, userId]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const [history, analyticsData] = await Promise.all([
        personalCoachService.getScheduleHistory(userId, 50),
        personalCoachService.getScheduleAnalytics(userId)
      ]);
      setHistoryEntries((history as any) || []);
      setAnalytics((analyticsData as any) || null);
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

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case "created":
        return <Star style={{ color: "#10b981", fontSize: 18 }} />;
      case "regenerated":
        return <Refresh style={{ color: "#f59e0b", fontSize: 18 }} />;
      case "reverted":
        return <History style={{ color: "#8b5cf6", fontSize: 18 }} />;
      case "modified":
        return <Schedule style={{ color: "#0ea5e9", fontSize: 18 }} />;
      default:
        return <Schedule style={{ color: "#6b7280", fontSize: 18 }} />;
    }
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case "created":
        return "#10b981";
      case "regenerated":
        return "#f59e0b";
      case "reverted":
        return "#8b5cf6";
      case "modified":
        return "#0ea5e9";
      default:
        return "#6b7280";
    }
  };

  const formatTokens = (tokens: number) => {
    return tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}K` : tokens.toString();
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
                Average Completion Rate
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: "#0a6a56" }}>
              {analytics.averageCompletionRate}%
            </div>
            <div className="text-xs mt-1" style={{ color: "#0b3d33", opacity: 0.6 }}>
              Across {analytics.totalScheduleHistoryEntries} schedule {analytics.totalScheduleHistoryEntries === 1 ? 'version' : 'versions'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-4 rounded-xl border-2"
              style={{ borderColor: "#c8ead6", background: "#fef3c7" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Refresh style={{ color: "#f59e0b", fontSize: 20 }} />
                <span
                  className="text-xs font-medium"
                  style={{ color: "#0b3d33", opacity: 0.7 }}
                >
                  Regenerations
                </span>
              </div>
              <div className="text-2xl font-bold" style={{ color: "#0a6a56" }}>
                {analytics.totalRegenerations}
              </div>
              <div className="text-xs mt-1" style={{ color: "#0b3d33", opacity: 0.6 }}>
                AI adjustments
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
                  Tokens Used
                </span>
              </div>
              <div className="text-2xl font-bold" style={{ color: "#0a6a56" }}>
                {formatTokens(analytics.totalTokensUsed)}
              </div>
              <div className="text-xs mt-1" style={{ color: "#0b3d33", opacity: 0.6 }}>
                Total AI credits
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule History */}
      <div>
        <h3 className="text-base font-bold mb-3" style={{ color: "#0a6a56" }}>
          Schedule History
        </h3>
        <div className="space-y-3">
          {historyEntries.length === 0 ? (
            <div className="text-center py-8" style={{ color: "#6b7280" }}>
              <History style={{ fontSize: 48, opacity: 0.3 }} />
              <p className="mt-2 text-sm">No schedule history yet</p>
            </div>
          ) : (
            historyEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-xl border-2"
                style={{
                  borderColor: getActionTypeColor(entry.actionType) + "40",
                  background: "white",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getActionTypeIcon(entry.actionType)}
                    <span className="font-bold text-sm" style={{ color: "#0a6a56" }}>
                      Version {entry.version}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold text-white capitalize"
                      style={{ background: getActionTypeColor(entry.actionType) }}
                    >
                      {entry.actionType}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: "#0b3d33", opacity: 0.6 }}>
                    {formatDate(entry.createdAt)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div>
                    <div className="text-xs" style={{ color: "#0b3d33", opacity: 0.6 }}>
                      Progress
                    </div>
                    <div className="text-xs font-semibold" style={{ color: "#0a6a56" }}>
                      {entry.completedDays}/{entry.totalDays}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: "#0b3d33", opacity: 0.6 }}>
                      Rate
                    </div>
                    <div className="text-xs font-semibold" style={{ color: "#0a6a56" }}>
                      {entry.completionRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: "#0b3d33", opacity: 0.6 }}>
                      Tokens
                    </div>
                    <div className="text-xs font-semibold" style={{ color: "#0a6a56" }}>
                      {formatTokens(entry.tokensUsed)}
                    </div>
                  </div>
                </div>

                {/* Difficulty Change */}
                {entry.previousDifficulty && entry.newDifficulty && (
                  <div className="mb-2 p-2 rounded-lg" style={{ background: "#f0fdf4" }}>
                    <div className="text-xs font-medium" style={{ color: "#0b3d33", opacity: 0.7 }}>
                      Difficulty: <span className="capitalize">{entry.previousDifficulty}</span> → <span className="capitalize font-bold" style={{ color: "#0a6a56" }}>{entry.newDifficulty}</span>
                    </div>
                  </div>
                )}

                {/* Change Reason */}
                {entry.changeReason && (
                  <div
                    className="flex items-center gap-2 mt-2 pt-2 border-t"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <Refresh style={{ fontSize: 14, color: getActionTypeColor(entry.actionType) }} />
                    <span className="text-xs" style={{ color: "#0b3d33", opacity: 0.7 }}>
                      {entry.fromDayNumber ? `From day ${entry.fromDayNumber}: ` : ""}{entry.changeReason.replace(/_/g, " ")}
                    </span>
                  </div>
                )}

                {/* User Notes */}
                {entry.userNotes && (
                  <div className="mt-2 p-2 rounded-lg" style={{ background: "#fef3c7" }}>
                    <div className="text-xs" style={{ color: "#0b3d33", opacity: 0.8 }}>
                      💭 {entry.userNotes}
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${entry.completionRate}%`,
                        background: getActionTypeColor(entry.actionType),
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default HistoryTab;


