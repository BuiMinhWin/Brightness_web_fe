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
  ExpandMore,
  ExpandLess,
  Create,
  Bookmark,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import AIGenerateTab, { GenerateWorkoutFormData } from "./AIGenerateTab";
import HistoryTab from "./HistoryTab";
import WorkoutDetailTab from "./WorkoutDetailTab";
import ExerciseLibraryTab from "./ExerciseLibraryTab";
import WorkoutTemplatesTab from "./WorkoutTemplatesTab";
import CustomBuilderTab from "./CustomBuilderTab";
import { ScheduleDayDetail, AICreditBalance } from "@/services/personalCoachService";
import CreditBalance from "../CreditBalance";

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
  creditBalance?: AICreditBalance | null;
  // Workout detail props
  selectedWorkout?: ScheduleDayDetail | null;
  selectedWorkoutDate?: string;
  workoutClickTrigger?: number;
  onWorkoutClose?: () => void;
  onExerciseComplete?: (exerciseId: string, completed: boolean) => void;
  onFeedbackClick?: () => void;
  onEditClick?: () => void;
  onRegenerateClick?: () => void;
  scheduleId?: string;
  // Schedule management
  onScheduleUpdated?: () => void;
  ensureScheduleExists?: () => Promise<string | null>;
}

type SidebarSection = "ai-generate" | "history" | "exercises" | "templates" | "custom" | "custom-create" | "custom-saved" | "workout-detail" | null;

const ScheduleSidebar: React.FC<ScheduleSidebarProps> = ({ 
  onGenerateSubmit,
  isGenerating,
  hasSchedules,
  userId,
  aiUsageLimits,
  creditBalance,
  selectedWorkout,
  selectedWorkoutDate,
  workoutClickTrigger,
  onWorkoutClose,
  onExerciseComplete,
  onFeedbackClick,
  onEditClick,
  onRegenerateClick,
  scheduleId,
  onScheduleUpdated,
  ensureScheduleExists,
}) => {
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed
  const [activeSection, setActiveSection] = useState<SidebarSection>(null);
  const [customMenuExpanded, setCustomMenuExpanded] = useState(false); // Track Custom Builder sub-menu expansion
  
  // Shared state for custom template builder (persists across view switches)
  const [loadedTemplateData, setLoadedTemplateData] = useState<any>(null);

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

  // Force show workout detail when user clicks on a workout tile
  React.useEffect(() => {
    if (workoutClickTrigger && workoutClickTrigger > 0 && selectedWorkout) {
      setIsExpanded(true);
      setActiveSection("workout-detail");
    }
  }, [workoutClickTrigger, selectedWorkout]);

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
      case "custom-create":
        return "Create New Template";
      case "custom-saved":
        return "Your Saved Templates";
      case "workout-detail":
        return "Workout Details";
      default:
        return "Builder";
    }
  };

  const handleCustomMenuToggle = () => {
    if (isExpanded) {
      // If expanded, toggle the sub-menu
      setCustomMenuExpanded(!customMenuExpanded);
    } else {
      // If collapsed, expand sidebar and show sub-menu
      setIsExpanded(true);
      setCustomMenuExpanded(true);
    }
  };

  const handleTemplateLoadedForEdit = (templateData: any) => {
    // Store the loaded template data and switch to the create view
    setLoadedTemplateData(templateData);
    setActiveSection("custom-create");
  };
  
  // Clear loaded template data when navigating away from custom builder
  React.useEffect(() => {
    if (activeSection !== "custom-create" && activeSection !== "custom-saved" && activeSection !== "custom") {
      setLoadedTemplateData(null);
    }
  }, [activeSection]);

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
        className="shadow-2xl transition-all duration-300 ease-in-out flex flex-col overflow-hidden h-full rounded-l-2xl ml-2"
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
              <>
                {/* Credit Balance Display */}
                {creditBalance && (
                  <div className="mb-4">
                    <CreditBalance balance={creditBalance} compact={false} />
                  </div>
                )}
                
                <AIGenerateTab
                  onSubmit={onGenerateSubmit}
                  isGenerating={isGenerating}
                  aiUsageLimits={aiUsageLimits}
                  creditBalance={creditBalance}
                />
              </>
            )}
            {activeSection === "history" && (
              <HistoryTab userId={userId} isVisible={activeSection === "history"} />
            )}
            {activeSection === "exercises" && (
              <ExerciseLibraryTab isDragDisabled={isGenerating} />
            )}
            {activeSection === "templates" && (
              <WorkoutTemplatesTab
                scheduleId={scheduleId}
                onTemplateApplied={onScheduleUpdated}
                ensureScheduleExists={ensureScheduleExists}
              />
            )}
            {activeSection === "custom" && (
              <CustomBuilderTab 
                onTemplateLoaded={handleTemplateLoadedForEdit} 
                loadedTemplateData={loadedTemplateData}
                scheduleId={scheduleId}
                onTemplateApplied={onScheduleUpdated}
                ensureScheduleExists={ensureScheduleExists}
              />
            )}
            {activeSection === "custom-create" && (
              <CustomBuilderTab 
                mode="create" 
                onTemplateLoaded={handleTemplateLoadedForEdit} 
                loadedTemplateData={loadedTemplateData}
                scheduleId={scheduleId}
                onTemplateApplied={onScheduleUpdated}
                ensureScheduleExists={ensureScheduleExists}
              />
            )}
            {activeSection === "custom-saved" && (
              <CustomBuilderTab 
                mode="saved" 
                onTemplateLoaded={handleTemplateLoadedForEdit} 
                loadedTemplateData={loadedTemplateData}
                scheduleId={scheduleId}
                onTemplateApplied={onScheduleUpdated}
                ensureScheduleExists={ensureScheduleExists}
              />
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

            {/* Custom Builder with Sub-menu */}
            <div>
              <Tooltip title={isExpanded ? "" : "Custom Builder"} arrow placement="right">
                <button
                  onClick={handleCustomMenuToggle}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white hover:bg-opacity-30 transition-all"
                >
                  <Add style={{ color: "#0a6a56", fontSize: isExpanded ? 20 : 24 }} />
                  {isExpanded && (
                    <>
                      <span className="font-semibold text-sm flex-1 text-left" style={{ color: "#0b3d33" }}>
                        Custom
                      </span>
                      {customMenuExpanded ? (
                        <ExpandLess style={{ color: "#0a6a56", fontSize: 20 }} />
                      ) : (
                        <ExpandMore style={{ color: "#0a6a56", fontSize: 20 }} />
                      )}
                    </>
                  )}
                </button>
              </Tooltip>

              {/* Sub-menu items */}
              {isExpanded && customMenuExpanded && (
                <div className="pl-4" style={{ background: "rgba(10, 106, 86, 0.05)" }}>
                  <Tooltip title="" arrow>
                    <button
                      onClick={() => handleSectionClick("custom-create")}
                      className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white hover:bg-opacity-30 transition-all"
                    >
                      <Create style={{ color: "#0a6a56", fontSize: 18 }} />
                      <span className="font-medium text-sm" style={{ color: "#0b3d33" }}>
                        Create New
                      </span>
                    </button>
                  </Tooltip>

                  <Tooltip title="" arrow>
                    <button
                      onClick={() => handleSectionClick("custom-saved")}
                      className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white hover:bg-opacity-30 transition-all"
                    >
                      <Bookmark style={{ color: "#0a6a56", fontSize: 18 }} />
                      <span className="font-medium text-sm" style={{ color: "#0b3d33" }}>
                        Saved Templates
                      </span>
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ScheduleSidebar;
