import React, { useState, useEffect } from "react";
import {
  Add,
  Search,
  Close,
  DragIndicator,
  Delete,
  Save,
  FitnessCenter,
  Bookmark,
  CalendarToday,
} from "@mui/icons-material";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  personalCoachService,
  ExerciseLibraryDTO,
  TemplateExerciseDTO,
} from "@/services/personalCoachService";
import { useToast } from "@/hooks/useToast";

interface CustomBuilderTabProps {
  mode?: "create" | "saved"; // Default: show both tabs, specific mode: show only that view
  onTemplateLoaded?: (templateData: CustomTemplate) => void; // Callback when template is loaded for editing
  loadedTemplateData?: CustomTemplate | null; // Template data loaded from parent
  scheduleId?: string; // Current schedule ID for applying templates
  onTemplateApplied?: () => void; // Callback after template is applied
  ensureScheduleExists?: () => Promise<string | null>; // Callback to ensure schedule exists
}

interface CustomTemplate {
  id: string;
  templateName: string;
  focusArea: string;
  difficulty: string;
  estimatedDuration: number;
  description: string;
  exercises: TemplateExerciseDTO[];
}

const CustomBuilderTab: React.FC<CustomBuilderTabProps> = ({ mode, onTemplateLoaded, loadedTemplateData, scheduleId, onTemplateApplied, ensureScheduleExists }) => {
  const { showToast } = useToast();
  const [templateName, setTemplateName] = useState("");
  const [focusArea, setFocusArea] = useState("full_body");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [description, setDescription] = useState("");
  const [exercises, setExercises] = useState<TemplateExerciseDTO[]>([]);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<ExerciseLibraryDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<CustomTemplate[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [templateToApply, setTemplateToApply] = useState<CustomTemplate | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [replaceExisting, setReplaceExisting] = useState(false);

  // Load saved templates from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("customWorkoutTemplates");
    if (stored) {
      try {
        setSavedTemplates(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse saved templates:", error);
      }
    }
  }, []);

  // Populate form when template is loaded from parent
  useEffect(() => {
    if (loadedTemplateData) {
      setTemplateName(loadedTemplateData.templateName + " (Copy)");
      setFocusArea(loadedTemplateData.focusArea);
      setDifficulty(loadedTemplateData.difficulty);
      setEstimatedDuration(loadedTemplateData.estimatedDuration);
      setDescription(loadedTemplateData.description);
      setExercises(loadedTemplateData.exercises);
    }
  }, [loadedTemplateData]);

  // Search exercises
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchExercises();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchExercises = async () => {
    setIsSearching(true);
    try {
      const results = await personalCoachService.searchExercises(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Failed to search exercises:", error);
      showToast({
        message: "Failed to search exercises. Please try again.",
        severity: "error",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addExercise = (exercise: ExerciseLibraryDTO) => {
    const newExercise: TemplateExerciseDTO = {
      exerciseLibraryId: exercise.id,
      exerciseName: exercise.exerciseName,
      exerciseNameVi: exercise.exerciseNameVi,
      orderIndex: exercises.length,
      sets: exercise.defaultSets,
      reps: exercise.defaultReps,
      restSeconds: exercise.defaultRestSeconds,
      notes: "",
    };
    setExercises([...exercises, newExercise]);
    setShowExerciseSearch(false);
    setSearchQuery("");
    showToast({
      message: `${exercise.exerciseName} added to template`,
      severity: "success",
    });
  };

  const removeExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    // Reindex
    setExercises(newExercises.map((ex, i) => ({ ...ex, orderIndex: i })));
  };

  const updateExercise = (index: number, field: keyof TemplateExerciseDTO, value: any) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  // Drag-and-drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newExercises = [...exercises];
    const draggedItem = newExercises[draggedIndex];
    newExercises.splice(draggedIndex, 1);
    newExercises.splice(index, 0, draggedItem);

    // Reindex
    const reindexed = newExercises.map((ex, i) => ({ ...ex, orderIndex: i }));
    setExercises(reindexed);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      showToast({
        message: "Please enter a template name",
        severity: "warning",
      });
      return;
    }

    if (exercises.length === 0) {
      showToast({
        message: "Please add at least one exercise",
        severity: "warning",
      });
      return;
    }

    const newTemplate: CustomTemplate = {
      id: Date.now().toString(),
      templateName,
      focusArea,
      difficulty,
      estimatedDuration,
      description,
      exercises,
    };

    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem("customWorkoutTemplates", JSON.stringify(updated));

    showToast({
      message: "Template saved successfully!",
      severity: "success",
    });

    // Reset form
    setTemplateName("");
    setFocusArea("full_body");
    setDifficulty("intermediate");
    setEstimatedDuration(30);
    setDescription("");
    setExercises([]);
  };

  const deleteTemplate = (id: string) => {
    const updated = savedTemplates.filter((t) => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem("customWorkoutTemplates", JSON.stringify(updated));
    showToast({
      message: "Template deleted",
      severity: "info",
    });
  };

  const loadTemplate = (template: CustomTemplate) => {
    showToast({
      message: "Template loaded for editing",
      severity: "info",
    });
    
    // Notify parent to switch to create view and pass template data
    if (onTemplateLoaded) {
      onTemplateLoaded(template);
    }
  };

  const openApplyModal = (template: CustomTemplate) => {
    setTemplateToApply(template);
    setSelectedDate(new Date()); // Default to today
    setShowApplyModal(true);
  };

  const applyTemplate = async () => {
    if (!templateToApply || !selectedDate) return;

    try {
      // Ensure schedule exists before applying template
      let activeScheduleId = scheduleId;
      if (!activeScheduleId && ensureScheduleExists) {
        const newScheduleId = await ensureScheduleExists();
        if (!newScheduleId) {
          return;
        }
        activeScheduleId = newScheduleId;
      } else if (!activeScheduleId) {
        showToast({
          message: "Please create a schedule first",
          severity: "warning",
        });
        return;
      }

      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      // Calculate day number based on selected date
      const dayNumber = Math.floor(
        (selectedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

      // Convert template exercises to custom day exercises
      const customExercises = templateToApply.exercises.map((ex, index) => ({
        exerciseLibraryId: ex.exerciseLibraryId,
        exerciseName: ex.exerciseName,
        exerciseNameVi: ex.exerciseNameVi,
        category: "general",
        sets: ex.sets,
        reps: ex.reps,
        restSeconds: ex.restSeconds,
        orderIndex: index,
        notes: ex.notes || "",
      }));

      await personalCoachService.addCustomDay(activeScheduleId, {
        date: dateStr,
        dayNumber,
        dayType: "workout",
        focusArea: templateToApply.focusArea,
        estimatedDuration: templateToApply.estimatedDuration,
        exercises: customExercises,
        replaceExisting,
      });

      showToast({
        message: `"${templateToApply.templateName}" applied to ${format(selectedDate, "MMM dd, yyyy")}`,
        severity: "success",
      });

      setShowApplyModal(false);
      setTemplateToApply(null);
      setSelectedDate(undefined);
      setReplaceExisting(false);

      if (onTemplateApplied) {
        onTemplateApplied();
      }
    } catch (error: any) {
      console.error("Failed to apply template:", error);
      
      // Check if it's a validation error from the backend
      const errorMessage = error?.message || "Failed to apply template";
      
      // Show detailed error message for validation issues
      if (errorMessage.includes("completed workout") || errorMessage.includes("progress history")) {
        showToast({
          message: "Cannot Modify Completed Workout",
          severity: "error",
          duration: 6000,
        });
        showToast({
          message: "This day is part of your progress history. Mark it incomplete first, or choose a different date.",
          severity: "warning",
          duration: 6000,
        });
      } else if (errorMessage.includes("already exists")) {
        showToast({
          message: "A workout already exists on this date. Enable 'Replace Existing' to overwrite it.",
          severity: "warning",
          duration: 5000,
        });
      } else {
        showToast({
          message: errorMessage,
          severity: "error",
        });
      }
    }
  };

  // Determine which sections to show based on mode
  const showCreateSection = !mode || mode === "create";
  const showSavedSection = !mode || mode === "saved";

  return (
    <div className="space-y-4">
      {/* Create New Template Section */}
      {showCreateSection && (
        <>
          {/* Form Section */}
          <div
            className="p-4 rounded-xl border-2"
            style={{ borderColor: "#c8ead6", background: "#f0fdf4" }}
          >
            <h4 className="text-sm font-bold mb-3" style={{ color: "#0a6a56" }}>
              Create New Template
            </h4>

        <div className="space-y-3">
          {/* Template Name */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#0b3d33" }}>
              Template Name *
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Morning Full Body Workout"
              className="w-full px-3 py-2 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              style={{ borderColor: "#c8ead6", color: "#0b3d33" }}
            />
          </div>

          {/* Focus Area and Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#0b3d33" }}>
                Focus Area *
              </label>
              <Select value={focusArea} onValueChange={setFocusArea}>
                <SelectTrigger className="w-full border-2 rounded-xl text-sm" style={{ borderColor: "#c8ead6", color: "#0b3d33" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#0b3d33" }}>
                Difficulty *
              </label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-full border-2 rounded-xl text-sm" style={{ borderColor: "#c8ead6", color: "#0b3d33" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estimated Duration */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#0b3d33" }}>
              Estimated Duration (minutes)
            </label>
            <input
              type="number"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(parseInt(e.target.value) || 30)}
              min="5"
              max="180"
              className="w-full px-3 py-2 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              style={{ borderColor: "#c8ead6", color: "#0b3d33" }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#0b3d33" }}>
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of this workout template"
              className="w-full px-3 py-2 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              style={{ borderColor: "#c8ead6", color: "#0b3d33" }}
            />
          </div>
        </div>
          </div>

          {/* Exercises Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold" style={{ color: "#0a6a56" }}>
                Exercises ({exercises.length})
              </h4>
              <button
                onClick={() => setShowExerciseSearch(true)}
                className="px-3 py-1.5 rounded-xl font-semibold text-white flex items-center gap-1 text-xs transition-all hover:opacity-90"
                style={{ background: "#0a6a56" }}
              >
                <Add style={{ fontSize: 16 }} />
                Add Exercise
              </button>
            </div>

            {/* Exercise List */}
            {exercises.length === 0 ? (
              <div
                className="text-center py-8 rounded-xl border-2"
                style={{ borderColor: "#c8ead6", color: "#6b7280" }}
              >
                <FitnessCenter style={{ fontSize: 36, opacity: 0.3 }} />
                <p className="mt-2 text-sm">No exercises added yet</p>
                <p className="text-xs mt-1">Click "Add Exercise" to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {exercises.map((exercise, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className="p-3 rounded-xl border-2 cursor-move transition-all hover:shadow-md"
                    style={{
                      borderColor: "#c8ead6",
                      background: "white",
                      opacity: draggedIndex === index ? 0.5 : 1,
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <DragIndicator style={{ fontSize: 18, color: "#6b7280", marginTop: 2 }} />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold" style={{ color: "#0b3d33" }}>
                            {index + 1}. {exercise.exerciseName}
                          </span>
                          <button
                            onClick={() => removeExercise(index)}
                            className="p-1 rounded-full hover:bg-red-50 transition-colors"
                          >
                            <Delete style={{ fontSize: 16, color: "#ef4444" }} />
                          </button>
                        </div>

                        {/* Exercise Parameters */}
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>
                              Sets
                            </label>
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) =>
                                updateExercise(index, "sets", parseInt(e.target.value) || 1)
                              }
                              min="1"
                              className="w-full px-2 py-1 border rounded-lg text-sm"
                              style={{ borderColor: "#c8ead6" }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>
                              Reps
                            </label>
                            <input
                              type="text"
                              value={exercise.reps}
                              onChange={(e) => updateExercise(index, "reps", e.target.value)}
                              placeholder="10-12"
                              className="w-full px-2 py-1 border rounded-lg text-sm"
                              style={{ borderColor: "#c8ead6" }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>
                              Rest (s)
                            </label>
                            <input
                              type="number"
                              value={exercise.restSeconds}
                              onChange={(e) =>
                                updateExercise(index, "restSeconds", parseInt(e.target.value) || 0)
                              }
                              min="0"
                              className="w-full px-2 py-1 border rounded-lg text-sm"
                              style={{ borderColor: "#c8ead6" }}
                            />
                          </div>
                        </div>

                        {/* Notes */}
                        <input
                          type="text"
                          value={exercise.notes}
                          onChange={(e) => updateExercise(index, "notes", e.target.value)}
                          placeholder="Notes (optional)"
                          className="w-full px-2 py-1 border rounded-lg text-xs"
                          style={{ borderColor: "#c8ead6", color: "#6b7280" }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={saveTemplate}
            disabled={!templateName.trim() || exercises.length === 0}
            className="w-full px-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "#0a6a56" }}
          >
            <Save fontSize="small" />
            Save Template
          </button>
        </>
      )}

      {/* Saved Templates Section */}
      {showSavedSection && (
        <div>
          {savedTemplates.length > 0 ? (
            <>
              <h4 className="text-sm font-bold mb-1" style={{ color: "#0a6a56" }}>
                Your Saved Templates ({savedTemplates.length})
              </h4>
              <p className="text-xs mb-3" style={{ color: "#6b7280" }}>
                💡 Drag templates onto calendar dates or click Apply
              </p>
          <div className="space-y-2 max-h-[40vh] overflow-y-auto no-scrollbar">
            {savedTemplates.map((template) => (
              <div
                key={template.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("template", JSON.stringify(template));
                  e.dataTransfer.effectAllowed = "copy";
                }}
                className="p-3 rounded-xl border-2 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all"
                style={{ borderColor: "#c8ead6", background: "white" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    <DragIndicator style={{ fontSize: 18, color: "#9ca3af", marginTop: 2 }} />
                    <div className="flex-1">
                      <h5 className="text-sm font-bold" style={{ color: "#0b3d33" }}>
                        {template.templateName}
                      </h5>
                      <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
                        {template.exercises.length} exercises • {template.estimatedDuration} min •{" "}
                        {template.difficulty}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openApplyModal(template)}
                      className="px-2 py-1 rounded-lg text-xs font-semibold text-white transition-colors hover:opacity-90"
                      style={{ background: "#0a6a56" }}
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => loadTemplate(template)}
                      className="px-2 py-1 rounded-lg text-xs font-semibold transition-colors hover:bg-green-50"
                      style={{ color: "#0a6a56", border: "1px solid #c8ead6" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="p-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Delete style={{ fontSize: 16, color: "#ef4444" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
            </>
          ) : (
            <div className="text-center py-12" style={{ color: "#6b7280" }}>
              <Bookmark style={{ fontSize: 48, opacity: 0.3 }} />
              <p className="mt-2 text-sm font-semibold">No Saved Templates</p>
              <p className="text-xs mt-1">Create your first template to save it here</p>
            </div>
          )}
        </div>
      )}

      {/* Exercise Search Modal */}
      {showExerciseSearch && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[9999]"
          style={{
            background: "rgba(10, 106, 86, 0.15)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setShowExerciseSearch(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col"
            style={{ border: "2px solid #c8ead6" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b" style={{ borderColor: "#c8ead6" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{ color: "#0a6a56" }}>
                  Add Exercise
                </h3>
                <button
                  onClick={() => setShowExerciseSearch(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <Close style={{ color: "#0a6a56" }} />
                </button>
              </div>

              {/* Search Input */}
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
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm"
                  style={{ borderColor: "#c8ead6", color: "#0b3d33" }}
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-6">
              {isSearching ? (
                <div className="text-center py-8" style={{ color: "#6b7280" }}>
                  <div className="inline-block w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-2" />
                  <p className="text-sm">Searching...</p>
                </div>
              ) : searchQuery && searchResults.length === 0 ? (
                <div className="text-center py-8" style={{ color: "#6b7280" }}>
                  <Search style={{ fontSize: 48, opacity: 0.3 }} />
                  <p className="mt-2 text-sm">No exercises found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              ) : searchQuery === "" ? (
                <div className="text-center py-8" style={{ color: "#6b7280" }}>
                  <Search style={{ fontSize: 48, opacity: 0.3 }} />
                  <p className="mt-2 text-sm">Start typing to search exercises</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() => addExercise(exercise)}
                      className="w-full p-3 rounded-xl border-2 text-left hover:bg-green-50 transition-all"
                      style={{ borderColor: "#c8ead6" }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-bold" style={{ color: "#0b3d33" }}>
                            {exercise.exerciseName}
                          </h5>
                          <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
                            {exercise.category} • {exercise.difficulty} •{" "}
                            {exercise.defaultSets}×{exercise.defaultReps}
                          </p>
                        </div>
                        <Add style={{ color: "#0a6a56" }} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply Template Modal */}
      {showApplyModal && templateToApply && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[9999]"
          style={{
            background: "rgba(10, 106, 86, 0.15)",
            backdropFilter: "blur(8px)",
            pointerEvents: "auto", // Ensure backdrop allows pointer events to pass through to higher z-index elements
          }}
          onClick={() => {
            setShowApplyModal(false);
            setSelectedDate(undefined);
            setReplaceExisting(false);
          }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 relative z-[10000]"
            style={{ border: "2px solid #c8ead6" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{ color: "#0a6a56" }}>
                  Apply Template
                </h3>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setSelectedDate(undefined);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <Close style={{ color: "#0a6a56" }} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Template Info */}
                <div
                  className="p-4 rounded-xl border-2"
                  style={{ borderColor: "#c8ead6", background: "#f0fdf4" }}
                >
                  <h4 className="text-sm font-bold" style={{ color: "#0b3d33" }}>
                    {templateToApply.templateName}
                  </h4>
                  <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
                    {templateToApply.exercises.length} exercises • {templateToApply.estimatedDuration} min
                  </p>
                </div>

                {/* Date Selector */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#0b3d33" }}>
                    Select Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="w-full px-4 py-3 border-2 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors"
                        style={{ borderColor: "#c8ead6", color: "#0b3d33" }}
                      >
                        <span className="flex items-center gap-2">
                          <CalendarToday style={{ fontSize: 18, color: "#0a6a56" }} />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-auto p-0" 
                      align="start"
                      sideOffset={8}
                    >
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Replace Existing Option */}
                <div 
                  className="p-3 rounded-xl border-2 cursor-pointer hover:bg-green-50 transition-colors"
                  style={{ borderColor: "#c8ead6" }}
                  onClick={() => setReplaceExisting(!replaceExisting)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                      style={{ 
                        borderColor: replaceExisting ? "#0a6a56" : "#c8ead6",
                        background: replaceExisting ? "#0a6a56" : "white"
                      }}
                    >
                      {replaceExisting && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                          <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: "#0b3d33" }}>
                        Replace existing workout
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                        If a workout already exists on this date, replace it with this template
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowApplyModal(false);
                      setSelectedDate(undefined);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold transition-colors hover:bg-gray-100"
                    style={{ color: "#6b7280", border: "2px solid #c8ead6" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyTemplate}
                    disabled={!selectedDate}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "#0a6a56" }}
                  >
                    Apply Template
                  </button>
                </div>
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

export default CustomBuilderTab;

