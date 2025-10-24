import React, { useState } from "react";
import {
  FitnessCenter,
  ViewList,
  Add,
  AutoAwesome,
  History,
  ChevronLeft,
  ChevronRight,
  ArrowBack,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import AIGenerateTab, { GenerateWorkoutFormData } from "./AIGenerateTab";
import HistoryTab from "./HistoryTab";
import WorkoutDetailTab from "./WorkoutDetailTab";
import { ScheduleDayDetail } from "@/services/personalCoachService";

export type { GenerateWorkoutFormData };

interface ScheduleSidebarProps {
  onGenerateSubmit: (formData: GenerateWorkoutFormData) => Promise<void>;
  isGenerating: boolean;
  hasSchedules: boolean;
  userId: string;
  aiUsageLimits?: {
    remainingGenerations: number;
    monthlyLimit: number;
    canGenerate: boolean;
    subscriptionTier: string;
  } | null;
  // Workout detail props
  selectedWorkout?: ScheduleDayDetail | null;
  selectedWorkoutDate?: string;
  onWorkoutClose?: () => void;
  onExerciseComplete?: (exerciseId: string, completed: boolean) => void;
  onFeedbackClick?: () => void;
  onEditClick?: () => void;
  onRegenerateClick?: () => void;
  scheduleId?: string;
}

type SidebarSection = "ai-generate" | "history" | "exercises" | "templates" | "custom" | "workout-detail" | null;

const ScheduleSidebar: React.FC<ScheduleSidebarProps> = ({ 
  onGenerateSubmit,
  isGenerating,
  hasSchedules,
  userId,
  aiUsageLimits,
  selectedWorkout,
  selectedWorkoutDate,
  onWorkoutClose,
  onExerciseComplete,
  onFeedbackClick,
  onEditClick,
  onRegenerateClick,
  scheduleId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed
  const [activeSection, setActiveSection] = useState<SidebarSection>(null);

  // Auto-expand sidebar when workout is selected (only if not viewing other sections)
  React.useEffect(() => {
    if (!selectedWorkout) return;
    
    // Only auto-switch to workout-detail if user is on main navigation or already viewing workout-detail
    // We check the current activeSection state to decide
    setActiveSection((currentSection) => {
      // If user is viewing other sections (ai-generate, history, exercises, templates, custom), don't interrupt
      if (currentSection !== null && currentSection !== "workout-detail") {
        return currentSection;
      }
      
      // Auto-switch to workout detail
      setIsExpanded(true);
      return "workout-detail";
    });
  }, [selectedWorkout]);

  const handleSectionClick = (section: SidebarSection) => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    setActiveSection(section);
  };

  const handleBack = () => {
    setActiveSection(null);
    // Don't call onWorkoutClose - keep the workout selected so user can navigate back to it
    // The workout will be cleared when user selects a different date without a workout
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "ai-generate":
        return "AI Generate";
      case "history":
        return "History & Analytics";
      case "exercises":
        return "Exercise Library";
      case "templates":
        return "Workout Templates";
      case "custom":
        return "Custom Builder";
      case "workout-detail":
        return "Workout Details";
      default:
        return "Builder";
    }
  };

  const sidebarWidth = isExpanded ? "420px" : "64px";

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div
        className="shadow-2xl transition-all duration-300 ease-in-out flex flex-col overflow-hidden h-full rounded-l-3xl ml-2"
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          background: "linear-gradient(180deg, #d4f1e6 0%, #e5f7ed 50%, #f5fce8 100%)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-3 border-b flex-shrink-0"
          style={{ borderColor: "rgba(10, 106, 86, 0.2)" }}
        >
          {activeSection && isExpanded ? (
            /* Section Detail Header */
            <>
              <button
                onClick={handleBack}
                className="p-1.5 rounded-lg transition-colors"
                style={{ background: "rgba(255, 255, 255, 0.5)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.5)")}
              >
                <ArrowBack style={{ color: "#0a6a56", fontSize: 20 }} />
              </button>
              <h3 className="text-lg font-bold flex-1 text-center" style={{ color: "#0b3d33" }}>
                {getSectionTitle()}
              </h3>
              <div className="w-9" /> {/* Spacer for centering */}
            </>
          ) : isExpanded ? (
            /* Builder Header */
            <>
              <h3 className="text-lg font-bold truncate" style={{ color: "#0b3d33" }}>
                Builder
              </h3>
              <Tooltip title="Collapse" arrow>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ background: "rgba(255, 255, 255, 0.5)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.5)")}
                >
                  <ChevronLeft style={{ color: "#0a6a56", fontSize: 20 }} />
                </button>
              </Tooltip>
            </>
          ) : (
            /* Collapsed Header */
            <div className="w-full flex justify-center">
              <Tooltip title="Expand" arrow placement="right">
                <button
                  onClick={() => setIsExpanded(true)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ background: "rgba(255, 255, 255, 0.5)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.5)")}
                >
                  <ChevronRight style={{ color: "#0a6a56", fontSize: 20 }} />
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Content Area */}
        {activeSection && isExpanded ? (
          /* Section Content View */
          <div className="flex-1 overflow-y-auto no-scrollbar p-4">
            {activeSection === "ai-generate" && (
              <AIGenerateTab
                onSubmit={onGenerateSubmit}
                isGenerating={isGenerating}
                aiUsageLimits={aiUsageLimits}
              />
            )}
            {activeSection === "history" && (
              <HistoryTab userId={userId} isVisible={activeSection === "history"} />
            )}
            {activeSection === "exercises" && (
              <div className="text-center py-8" style={{ color: "#6b7280" }}>
                <FitnessCenter style={{ fontSize: 48, opacity: 0.3 }} />
                <p className="mt-2 text-sm">Coming soon...</p>
              </div>
            )}
            {activeSection === "templates" && (
              <div className="text-center py-8" style={{ color: "#6b7280" }}>
                <ViewList style={{ fontSize: 48, opacity: 0.3 }} />
                <p className="mt-2 text-sm">Coming soon...</p>
              </div>
            )}
            {activeSection === "custom" && (
              <div className="text-center py-8" style={{ color: "#6b7280" }}>
                <Add style={{ fontSize: 48, opacity: 0.3 }} />
                <p className="mt-2 text-sm">Coming soon...</p>
              </div>
            )}
            {activeSection === "workout-detail" && (
              selectedWorkout ? (
                <WorkoutDetailTab
                  workout={selectedWorkout}
                  date={selectedWorkoutDate || ""}
                  onExerciseComplete={onExerciseComplete}
                  onFeedbackClick={onFeedbackClick}
                  onEditClick={onEditClick}
                  onRegenerateClick={onRegenerateClick}
                  scheduleId={scheduleId}
                />
              ) : (
                <div className="text-center py-8" style={{ color: "#6b7280" }}>
                  <ScheduleIcon style={{ fontSize: 48, opacity: 0.3 }} />
                  <p className="mt-2 text-sm">Select a workout from the calendar to view details</p>
                </div>
              )
            )}
          </div>
        ) : (
          /* Navigation Icons List */
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* AI Generate */}
            <Tooltip title={isExpanded ? "" : "AI Generate"} arrow placement="right">
              <button
                onClick={() => handleSectionClick("ai-generate")}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white hover:bg-opacity-30 transition-all"
              >
                <AutoAwesome style={{ color: "#0a6a56", fontSize: isExpanded ? 20 : 24 }} />
                {isExpanded && (
                  <span className="font-semibold text-sm" style={{ color: "#0b3d33" }}>
                    AI Generate
                  </span>
                )}
              </button>
            </Tooltip>

            {/* History */}
            {hasSchedules && (
              <Tooltip title={isExpanded ? "" : "History & Analytics"} arrow placement="right">
                <button
                  onClick={() => handleSectionClick("history")}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white hover:bg-opacity-30 transition-all"
                >
                  <History style={{ color: "#0a6a56", fontSize: isExpanded ? 20 : 24 }} />
                  {isExpanded && (
                    <span className="font-semibold text-sm" style={{ color: "#0b3d33" }}>
                      History
                    </span>
                  )}
                </button>
              </Tooltip>
            )}

            {/* Workout Detail */}
            <Tooltip title={isExpanded ? "" : "Workout Details"} arrow placement="right">
              <button
                onClick={() => handleSectionClick("workout-detail")}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white hover:bg-opacity-30 transition-all"
                style={{ opacity: selectedWorkout ? 1 : 0.5 }}
              >
                <ScheduleIcon style={{ color: "#0a6a56", fontSize: isExpanded ? 20 : 24 }} />
                {isExpanded && (
                  <span className="font-semibold text-sm" style={{ color: "#0b3d33" }}>
                    Workout Detail
                  </span>
                )}
              </button>
            </Tooltip>

            {/* Exercises */}
            <Tooltip title={isExpanded ? "" : "Exercise Library"} arrow placement="right">
              <button
                onClick={() => handleSectionClick("exercises")}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white hover:bg-opacity-30 transition-all"
              >
                <FitnessCenter style={{ color: "#0a6a56", fontSize: isExpanded ? 20 : 24 }} />
                {isExpanded && (
                  <span className="font-semibold text-sm" style={{ color: "#0b3d33" }}>
                    Exercises Library
                  </span>
                )}
              </button>
            </Tooltip>

            {/* Templates */}
            <Tooltip title={isExpanded ? "" : "Workout Templates"} arrow placement="right">
              <button
                onClick={() => handleSectionClick("templates")}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white hover:bg-opacity-30 transition-all"
              >
                <ViewList style={{ color: "#0a6a56", fontSize: isExpanded ? 20 : 24 }} />
                {isExpanded && (
                  <span className="font-semibold text-sm" style={{ color: "#0b3d33" }}>
                    Workout Templates
                  </span>
                )}
              </button>
            </Tooltip>

            {/* Custom */}
            <Tooltip title={isExpanded ? "" : "Custom Builder"} arrow placement="right">
              <button
                onClick={() => handleSectionClick("custom")}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white hover:bg-opacity-30 transition-all"
              >
                <Add style={{ color: "#0a6a56", fontSize: isExpanded ? 20 : 24 }} />
                {isExpanded && (
                  <span className="font-semibold text-sm" style={{ color: "#0b3d33" }}>
                    Custom
                  </span>
                )}
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </>
  );
};

export default ScheduleSidebar;
