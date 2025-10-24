import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  FitnessCenter,
  FilterList,
  AutoAwesome,
  Close,
  DragIndicator,
  Info,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  personalCoachService,
  ExerciseLibraryDTO,
  ExerciseFilters,
} from "@/services/personalCoachService";
import { useToast } from "@/hooks/useToast";

interface ExerciseLibraryTabProps {
  isDragDisabled?: boolean;
}

const ExerciseLibraryTab: React.FC<ExerciseLibraryTabProps> = ({
  isDragDisabled = false,
}) => {
  const { showToast } = useToast();
  const [exercises, setExercises] = useState<ExerciseLibraryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseLibraryDTO | null>(null);
  const [aiFocusArea, setAiFocusArea] = useState("ai_decide");
  const [aiDifficulty, setAiDifficulty] = useState("ai_decide");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadExercises();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await personalCoachService.getExerciseCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadExercises = async () => {
    setIsLoading(true);
    try {
      const data = await personalCoachService.getExerciseLibrary({
        ...filters,
        searchQuery: searchQuery || undefined,
      });
      setExercises(data);
      
      // Only show message if user has actively searched/filtered
      if ((searchQuery || Object.keys(filters).length > 0) && data.length === 0) {
        showToast({
          message: "No exercises found matching your criteria.",
          severity: "info",
        });
      }
    } catch (error: any) {
      console.error("Failed to load exercises:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load exercises";
      showToast({
        message: `${errorMessage}. The exercise database may still be initializing.`,
        severity: "warning",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, exercise: ExerciseLibraryDTO) => {
    if (isDragDisabled) return;
    e.dataTransfer.setData("exercise", JSON.stringify(exercise));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleGetAISuggestions = async (focusArea: string, difficulty: string) => {
    setIsLoading(true);
    try {
      const suggestions = await personalCoachService.getAISuggestions({
        focusArea,
        difficulty,
        count: 10,
      });
      
      if (suggestions.length === 0) {
        showToast({
          message: "No exercises found matching your criteria. Try different filters.",
          severity: "info",
        });
      } else {
        setExercises(suggestions);
        showToast({
          message: `AI generated ${suggestions.length} personalized exercise suggestions for you!`,
          severity: "success",
        });
      }
      setShowAISuggestions(false);
    } catch (error: any) {
      console.error("Failed to get AI suggestions:", error);
      
      // Check if it's an AI limit error
      const status = error?.response?.status;
      const responseData = error?.response?.data;
      
      if (status === 403 && responseData?.upgradeRequired) {
        // AI limit reached - show upgrade prompt
        showToast({
          message: responseData.message || "AI generation limit reached. Upgrade to premium for unlimited access!",
          severity: "error",
        });
        setShowAISuggestions(false);
        // TODO: Show upgrade modal/prompt
      } else {
        // Other errors - show generic message
        const errorMessage = responseData?.message || error?.message || "Failed to get AI suggestions";
        showToast({
          message: `${errorMessage}. Try using the search/filter instead.`,
          severity: "warning",
        });
        setShowAISuggestions(false);
      }
    } finally {
      setIsLoading(false);
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

  const getCategoryIcon = (category: string) => {
    return <FitnessCenter style={{ fontSize: 16 }} />;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#6b7280",
            fontSize: 20,
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search exercises..."
          className="w-full pl-10 pr-10 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm"
          style={{ borderColor: "#c8ead6", color: "#0b3d33" }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
          >
            <Close style={{ fontSize: 18, color: "#6b7280" }} />
          </button>
        )}
      </div>

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
        <button
          onClick={() => setShowAISuggestions(true)}
          className="flex-1 px-4 py-2 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-semibold transition-colors hover:bg-green-50"
          style={{ borderColor: "#c8ead6", color: "#0a6a56" }}
        >
          <AutoAwesome style={{ fontSize: 18 }} />
          AI Suggestions
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 rounded-xl border-2" style={{ borderColor: "#c8ead6", background: "#f0fdf4" }}>
          <h4 className="text-sm font-bold mb-3" style={{ color: "#0a6a56" }}>
            Filter Exercises
          </h4>

          {/* Category Filter */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-2" style={{ color: "#0b3d33" }}>
              Category
            </label>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) => setFilters({ ...filters, category: value === "all" ? undefined : value })}
            >
              <SelectTrigger className="w-full border-2 rounded-xl text-sm" style={{ borderColor: "#c8ead6", color: "#0b3d33" }}>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
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

      {/* AI Suggestions Modal */}
      {showAISuggestions && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[9999]"
          style={{
            background: "rgba(10, 106, 86, 0.15)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setShowAISuggestions(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6"
            style={{ border: "2px solid #c8ead6" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: "#0a6a56" }}>
                AI Exercise Suggestions
              </h3>
              <button
                onClick={() => setShowAISuggestions(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <Close style={{ color: "#0a6a56" }} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#0b3d33" }}>
                  Focus Area
                </label>
                <Select value={aiFocusArea} onValueChange={setAiFocusArea}>
                  <SelectTrigger className="w-full border-2 rounded-xl" style={{ borderColor: "#c8ead6", color: "#0b3d33" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[10000]">
                    <SelectItem value="ai_decide">Let AI Decide (Recommended)</SelectItem>
                    <SelectItem value="full_body">Full Body</SelectItem>
                    <SelectItem value="upper_body">Upper Body</SelectItem>
                    <SelectItem value="lower_body">Lower Body</SelectItem>
                    <SelectItem value="core">Core</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#0b3d33" }}>
                  Difficulty
                </label>
                <Select value={aiDifficulty} onValueChange={setAiDifficulty}>
                  <SelectTrigger className="w-full border-2 rounded-xl" style={{ borderColor: "#c8ead6", color: "#0b3d33" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[10000]">
                    <SelectItem value="ai_decide">Let AI Decide (Recommended)</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <button
                onClick={() => handleGetAISuggestions(aiFocusArea, aiDifficulty)}
                className="w-full px-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: "#0a6a56" }}
              >
                <AutoAwesome fontSize="small" />
                Get Suggestions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Count */}
      <div className="text-xs" style={{ color: "#6b7280" }}>
        {isLoading ? "Loading..." : `${exercises.length} exercises found`}
      </div>

      {/* Exercise Grid */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
        {isLoading ? (
          // Skeleton Loaders
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="p-3 rounded-xl border-2 animate-pulse"
              style={{ borderColor: "#c8ead6", background: "#f0fdf4" }}
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))
        ) : exercises.length === 0 ? (
          <div className="text-center py-12" style={{ color: "#6b7280" }}>
            <FitnessCenter style={{ fontSize: 48, opacity: 0.3 }} />
            <p className="mt-2 text-sm font-semibold">No exercises found</p>
            {searchQuery || Object.keys(filters).length > 0 ? (
              <p className="text-xs mt-1">Try adjusting your filters or search term</p>
            ) : (
              <>
                <p className="text-xs mt-1">The exercise database may still be initializing</p>
                <p className="text-xs mt-1">Try refreshing the page in a moment</p>
              </>
            )}
          </div>
        ) : (
          exercises.map((exercise) => (
            <div
              key={exercise.id}
              draggable={!isDragDisabled}
              onDragStart={(e) => handleDragStart(e, exercise)}
              className={`exercise-card p-3 rounded-xl border-2 transition-all ${
                isDragDisabled ? "opacity-50 cursor-not-allowed" : "cursor-grab hover:shadow-md active:cursor-grabbing"
              }`}
              style={{ borderColor: "#c8ead6", background: "white" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {!isDragDisabled && (
                      <DragIndicator style={{ fontSize: 16, color: "#6b7280" }} />
                    )}
                    {getCategoryIcon(exercise.category)}
                    <h5 className="text-sm font-bold truncate" style={{ color: "#0b3d33" }}>
                      {exercise.exerciseName}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: getDifficultyColor(exercise.difficulty) + "20",
                        color: getDifficultyColor(exercise.difficulty),
                      }}
                    >
                      {exercise.difficulty}
                    </span>
                    <span className="text-xs" style={{ color: "#6b7280" }}>
                      {exercise.category}
                    </span>
                    {exercise.equipmentRequired?.length > 0 && (
                      <span className="text-xs" style={{ color: "#6b7280" }}>
                        • {exercise.equipmentRequired.slice(0, 2).join(", ")}
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-2" style={{ color: "#6b7280" }}>
                    {exercise.defaultSets} sets × {exercise.defaultReps} reps
                    {exercise.defaultRestSeconds > 0 && ` • ${exercise.defaultRestSeconds}s rest`}
                  </div>
                </div>
                <Tooltip title="View Details" arrow>
                  <button
                    onClick={() => setSelectedExercise(exercise)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Info style={{ fontSize: 18, color: "#0a6a56" }} />
                  </button>
                </Tooltip>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[9999]"
          style={{
            background: "rgba(10, 106, 86, 0.15)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setSelectedExercise(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
            style={{ border: "2px solid #c8ead6" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold" style={{ color: "#0a6a56" }}>
                  {selectedExercise.exerciseName}
                </h3>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <Close style={{ color: "#0a6a56" }} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      background: getDifficultyColor(selectedExercise.difficulty) + "20",
                      color: getDifficultyColor(selectedExercise.difficulty),
                    }}
                  >
                    {selectedExercise.difficulty}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{ background: "#e0f2fe", color: "#0369a1" }}
                  >
                    {selectedExercise.category}
                  </span>
                </div>

                {/* Description */}
                {selectedExercise.description && (
                  <div>
                    <h4 className="text-sm font-bold mb-2" style={{ color: "#0a6a56" }}>
                      Description
                    </h4>
                    <p className="text-sm" style={{ color: "#0b3d33" }}>
                      {selectedExercise.description}
                    </p>
                  </div>
                )}

                {/* Target Muscles */}
                {selectedExercise.targetMuscles?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold mb-2" style={{ color: "#0a6a56" }}>
                      Target Muscles
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.targetMuscles.map((muscle, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-lg text-xs font-medium"
                          style={{ background: "#f0fdf4", color: "#0a6a56" }}
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Equipment */}
                {selectedExercise.equipmentRequired?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold mb-2" style={{ color: "#0a6a56" }}>
                      Equipment Required
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.equipmentRequired.map((equipment, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-lg text-xs font-medium"
                          style={{ background: "#fef3c7", color: "#f59e0b" }}
                        >
                          {equipment}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Default Sets/Reps */}
                <div
                  className="p-4 rounded-xl border-2"
                  style={{ borderColor: "#c8ead6", background: "#f0fdf4" }}
                >
                  <h4 className="text-sm font-bold mb-2" style={{ color: "#0a6a56" }}>
                    Recommended Volume
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs" style={{ color: "#6b7280" }}>Sets</div>
                      <div className="text-lg font-bold" style={{ color: "#0a6a56" }}>
                        {selectedExercise.defaultSets}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: "#6b7280" }}>Reps</div>
                      <div className="text-lg font-bold" style={{ color: "#0a6a56" }}>
                        {selectedExercise.defaultReps}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: "#6b7280" }}>Rest</div>
                      <div className="text-lg font-bold" style={{ color: "#0a6a56" }}>
                        {selectedExercise.defaultRestSeconds}s
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Link */}
                {selectedExercise.videoUrl && (
                  <a
                    href={selectedExercise.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-6 py-3 rounded-xl font-semibold text-center transition-all hover:opacity-90"
                    style={{ background: "#0a6a56", color: "white" }}
                  >
                    Watch Tutorial Video
                  </a>
                )}
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

export default ExerciseLibraryTab;

