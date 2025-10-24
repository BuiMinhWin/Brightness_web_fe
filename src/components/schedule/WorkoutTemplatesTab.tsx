import React, { useState, useEffect } from "react";
import {
  ViewList,
  FilterList,
  ExpandMore,
  Close,
  FitnessCenter,
  AccessTime,
  CalendarMonth,
  Check,
} from "@mui/icons-material";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  personalCoachService,
  WorkoutTemplateDTO,
  TemplateFilters,
} from "@/services/personalCoachService";
import { useToast } from "@/hooks/useToast";

interface WorkoutTemplatesTabProps {
  scheduleId?: string;
  onTemplateApplied?: () => void;
}

const WorkoutTemplatesTab: React.FC<WorkoutTemplatesTabProps> = ({
  scheduleId,
  onTemplateApplied,
}) => {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<WorkoutTemplateDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<TemplateFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplateDTO | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [filters]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await personalCoachService.getWorkoutTemplates(filters);
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates:", error);
      showToast({
        message: "Failed to load templates. Please try again.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickApply = (template: WorkoutTemplateDTO) => {
    setSelectedTemplate(template);
    setShowApplyModal(true);
    // Set default date to today
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setSelectedDate(dateStr);
  };

  const handleApplyTemplate = async () => {
    if (!scheduleId) {
      showToast({
        message: "Please create a schedule first (use AI Generate or add exercises manually)",
        severity: "warning",
      });
      return;
    }

    if (!selectedTemplate || !selectedDate) {
      showToast({
        message: "Please select a date",
        severity: "warning",
      });
      return;
    }

    setIsApplying(true);
    try {
      // Calculate day number from date (simplified - you may need more complex logic)
      const dayNumber = Math.floor((new Date(selectedDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + 1;

      await personalCoachService.addDayFromTemplate(scheduleId, {
        templateId: selectedTemplate.id,
        date: selectedDate,
        dayNumber: Math.max(1, dayNumber),
      });

      showToast({
        message: `Template "${selectedTemplate.templateName}" applied successfully!`,
        severity: "success",
      });

      setShowApplyModal(false);
      setSelectedTemplate(null);
      
      if (onTemplateApplied) {
        onTemplateApplied();
      }
    } catch (error: any) {
      console.error("Failed to apply template:", error);
      showToast({
        message: error?.response?.data?.message || "Failed to apply template. Please try again.",
        severity: "error",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "#10b981";
      case "intermediate":
        return "#f59e0b";
      case "advanced":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getFocusAreaIcon = (focusArea: string) => {
    return <FitnessCenter style={{ fontSize: 16 }} />;
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex-1 px-4 py-2 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-semibold transition-colors hover:bg-green-50"
          style={{
            borderColor: showFilters ? "#0a6a56" : "#c8ead6",
            color: "#0a6a56",
            background: showFilters ? "rgba(10, 106, 86, 0.05)" : "white",
          }}
        >
          <FilterList style={{ fontSize: 18 }} />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 rounded-xl border-2" style={{ borderColor: "#c8ead6", background: "#f0fdf4" }}>
          <h4 className="text-sm font-bold mb-3" style={{ color: "#0a6a56" }}>
            Filter Templates
          </h4>

          {/* Focus Area Filter */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-2" style={{ color: "#0b3d33" }}>
              Focus Area
            </label>
            <Select
              value={filters.focusArea || "all"}
              onValueChange={(value) => setFilters({ ...filters, focusArea: value === "all" ? undefined : value })}
            >
              <SelectTrigger className="w-full border-2 rounded-xl text-sm" style={{ borderColor: "#c8ead6", color: "#0b3d33" }}>
                <SelectValue placeholder="All Focus Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Focus Areas</SelectItem>
                <SelectItem value="full_body">Full Body</SelectItem>
                <SelectItem value="upper_body">Upper Body</SelectItem>
                <SelectItem value="lower_body">Lower Body</SelectItem>
                <SelectItem value="core">Core</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Filter */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-2" style={{ color: "#0b3d33" }}>
              Difficulty
            </label>
            <Select
              value={filters.difficulty || "all"}
              onValueChange={(value) => setFilters({ ...filters, difficulty: value === "all" ? undefined : value })}
            >
              <SelectTrigger className="w-full border-2 rounded-xl text-sm" style={{ borderColor: "#c8ead6", color: "#0b3d33" }}>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => setFilters({})}
            className="w-full px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: "#0a6a56", color: "white" }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Template Count */}
      <div className="text-xs" style={{ color: "#6b7280" }}>
        {isLoading ? "Loading..." : `${templates.length} templates found`}
      </div>

      {/* Templates List */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
        {isLoading ? (
          // Skeleton Loaders
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border-2 animate-pulse"
              style={{ borderColor: "#c8ead6", background: "#f0fdf4" }}
            >
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))
        ) : templates.length === 0 ? (
          <div className="text-center py-12" style={{ color: "#6b7280" }}>
            <ViewList style={{ fontSize: 48, opacity: 0.3 }} />
            <p className="mt-2 text-sm">No templates found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="p-4 rounded-xl border-2 transition-all"
              style={{ borderColor: "#c8ead6", background: "white" }}
            >
              {/* Template Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getFocusAreaIcon(template.focusArea)}
                    <h5 className="text-base font-bold" style={{ color: "#0b3d33" }}>
                      {template.templateName}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: getDifficultyColor(template.difficulty) + "20",
                        color: getDifficultyColor(template.difficulty),
                      }}
                    >
                      {template.difficulty}
                    </span>
                    <span className="text-xs" style={{ color: "#6b7280" }}>
                      {template.focusArea.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setExpandedTemplate(expandedTemplate === template.id ? null : template.id)
                  }
                  className="p-1 rounded-full hover:bg-gray-100 transition-all"
                  style={{
                    transform: expandedTemplate === template.id ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <ExpandMore style={{ color: "#0a6a56", fontSize: 20 }} />
                </button>
              </div>

              {/* Template Stats */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <FitnessCenter style={{ fontSize: 14, color: "#6b7280" }} />
                  <span className="text-xs" style={{ color: "#6b7280" }}>
                    {template.exercises.length} exercises
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <AccessTime style={{ fontSize: 14, color: "#6b7280" }} />
                  <span className="text-xs" style={{ color: "#6b7280" }}>
                    ~{template.estimatedDuration} min
                  </span>
                </div>
              </div>

              {/* Template Description */}
              {template.description && (
                <p className="text-xs mb-3" style={{ color: "#6b7280" }}>
                  {template.description}
                </p>
              )}

              {/* Expanded Exercise List */}
              {expandedTemplate === template.id && (
                <div
                  className="mt-3 pt-3 border-t space-y-2"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <h6 className="text-xs font-bold" style={{ color: "#0a6a56" }}>
                    Exercises:
                  </h6>
                  {template.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="p-2 rounded-lg flex items-center justify-between"
                      style={{ background: "#f0fdf4" }}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span
                          className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
                          style={{ background: "#0a6a56", color: "white" }}
                        >
                          {index + 1}
                        </span>
                        <span className="text-xs font-medium truncate" style={{ color: "#0b3d33" }}>
                          {exercise.exerciseName}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: "#6b7280" }}>
                        {exercise.sets}×{exercise.reps}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleQuickApply(template)}
                  className="flex-1 px-4 py-2 rounded-xl font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ background: "#0a6a56" }}
                >
                  <CalendarMonth style={{ fontSize: 16 }} />
                  Apply to Day
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Apply Template Modal */}
      {showApplyModal && selectedTemplate && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[9999]"
          style={{
            background: "rgba(10, 106, 86, 0.15)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setShowApplyModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6"
            style={{ border: "2px solid #c8ead6" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: "#0a6a56" }}>
                Apply Template
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <Close style={{ color: "#0a6a56" }} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Template Info */}
              <div
                className="p-3 rounded-xl border-2"
                style={{ borderColor: "#c8ead6", background: "#f0fdf4" }}
              >
                <h4 className="font-bold text-sm mb-1" style={{ color: "#0b3d33" }}>
                  {selectedTemplate.templateName}
                </h4>
                <p className="text-xs" style={{ color: "#6b7280" }}>
                  {selectedTemplate.exercises.length} exercises • ~{selectedTemplate.estimatedDuration} min
                </p>
              </div>

              {/* Date Selector */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#0b3d33" }}>
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  style={{ borderColor: "#c8ead6", color: "#0b3d33" }}
                />
              </div>

              {/* Warning if no schedule */}
              {!scheduleId && (
                <div
                  className="p-3 rounded-xl border-2"
                  style={{ borderColor: "#fbbf24", background: "#fef3c7" }}
                >
                  <p className="text-xs font-medium" style={{ color: "#78350f" }}>
                    You need to create a schedule first. Use AI Generate or add exercises manually to create one.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowApplyModal(false)}
                  disabled={isApplying}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold border-2 transition-all hover:bg-gray-100 disabled:opacity-50"
                  style={{ borderColor: "#0a6a56", color: "#0a6a56" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyTemplate}
                  disabled={isApplying || !scheduleId}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "#0a6a56" }}
                >
                  {isApplying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Check fontSize="small" />
                      Apply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scrollbar hiding CSS */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default WorkoutTemplatesTab;

