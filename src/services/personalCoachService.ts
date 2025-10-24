// personalCoachService.ts
import { httpRequest } from "./httpClientRedux";

// DTOs matching the backend
export interface GenerateScheduleRequest {
  userId: string;
  goal: string;
  durationDays?: number;
  difficultyLevel: string;
  availableDays: string[];
  equipmentAvailable: string[];
  additionalNotes?: string;
  startDate?: string;
}

export interface ExerciseDetail {
  exerciseId: string;
  exerciseName: string;
  category: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
  videoUrl?: string;
  completed: boolean;
  actualSets?: number;
  actualReps?: number;
}

export interface ScheduleDayDetail {
  scheduleDayId: string;
  dayNumber: number;
  date: string; // ISO date string from backend
  dayType: string;
  focusArea: string;
  estimatedDuration: number;
  exercises: ExerciseDetail[];
}

export interface WorkoutScheduleResponse {
  scheduleId: string;
  scheduleName: string;
  goal: string;
  difficultyLevel: string;
  durationDays: number;
  days: ScheduleDayDetail[];
  createdAt: string;
  isLatest: boolean;
  status: string;
  version: number;
}

// ==================== MANUAL SCHEDULE BUILDER TYPES ====================

export interface AIUsageLimits {
  remainingGenerations: number;
  monthlyLimit: number;
  canGenerate: boolean;
  usedThisMonth: number;
  daysUntilReset: number;
  subscriptionTier: "free" | "paid";
}

export interface ExerciseLibraryDTO {
  id: string;
  exerciseName: string;
  exerciseNameVi: string;
  category: string;
  targetMuscles: string[];
  difficulty: string;
  equipmentRequired: string[];
  description: string;
  videoUrl: string;
  defaultSets: number;
  defaultReps: string;
  defaultRestSeconds: number;
}

export interface ExerciseFilters {
  category?: string;
  difficulty?: string;
  equipmentAvailable?: string[];
  searchQuery?: string;
}

export interface ExerciseSuggestionRequest {
  focusArea: string;
  difficulty: string;
  equipmentAvailable?: string[];
  count?: number;
}

export interface WorkoutTemplateDTO {
  id: string;
  templateName: string;
  focusArea: string;
  difficulty: string;
  estimatedDuration: number;
  description: string;
  exercises: TemplateExerciseDTO[];
}

export interface TemplateExerciseDTO {
  exerciseLibraryId: string;
  exerciseName: string;
  exerciseNameVi: string;
  orderIndex: number;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
}

export interface TemplateFilters {
  focusArea?: string;
  difficulty?: string;
}

export interface ManualScheduleRequest {
  userId: string;
  scheduleName: string;
  goal: string;
  startDate: string;
  endDate?: string;
  durationDays: number;
  difficultyLevel: string;
}

export interface AddDayFromTemplateRequest {
  scheduleId?: string;
  templateId: string;
  date: string;
  dayNumber: number;
}

export interface CustomExerciseDTO {
  exerciseLibraryId?: string;
  exerciseName: string;
  category: string;
  sets: number;
  reps: string;
  restSeconds: number;
  orderIndex: number;
  notes?: string;
}

export interface AddCustomDayRequest {
  scheduleId?: string;
  date: string;
  dayNumber: number;
  dayType: string;
  focusArea: string;
  estimatedDuration: number;
  exercises: CustomExerciseDTO[];
  replaceExisting?: boolean;
}

export interface UpdateWorkoutDayRequest {
  dayType?: string;
  focusArea?: string;
  estimatedDuration?: number;
  exercises?: CustomExerciseDTO[];
}

export interface WorkoutDayResponse {
  dayId: string;
  scheduleId: string;
  dayNumber: number;
  date: string;
  dayType: string;
  focusArea: string;
  estimatedDuration: number;
  exercises: ExerciseDetailDTO[];
}

export interface ExerciseDetailDTO {
  exerciseId: string;
  exerciseName: string;
  category: string;
  sets: number;
  reps: string;
  restSeconds: number;
  orderIndex: number;
  notes: string;
}

export interface ModifyDayRequest {
  scheduleId: string;
  dayNumber: number;
  newFocusArea?: string;
  userRequest?: string;
}

export interface ModifiedDayResponse {
  scheduleId: string;
  dayNumber: number;
  modifiedDay: ScheduleDayDetail;
  modificationSummary: string;
}

export interface AdjustDifficultyRequest {
  scheduleId: string;
  adjustmentType: string; // "increase" or "decrease"
  percentage: number;
  reason?: string;
}

export interface DayAdjustment {
  dayNumber: number;
  changes: string[];
}

export interface ScheduleAdjustmentResponse {
  scheduleId: string;
  adjustmentType: string;
  adjustments: DayAdjustment[];
  summary: string;
}

export interface ConflictingWorkout {
  date: string;
  focusArea: string;
  exerciseCount: number;
  isCompleted: boolean;
}

export interface ScheduleConflictInfo {
  hasConflicts: boolean;
  conflictingWorkouts: ConflictingWorkout[];
  totalConflicts: number;
}

export interface CheckConflictsRequest {
  userId: string;
  startDate: string;
  durationDays: number;
  availableDays: string[];
}

export const personalCoachService = {
  /** Generate AI-powered workout schedule */
  async generateSchedule(request: GenerateScheduleRequest): Promise<WorkoutScheduleResponse> {
    return httpRequest<WorkoutScheduleResponse>("/coach/api/Schedule/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  },

  /** Check for conflicts with existing workouts before generating */
  async checkScheduleConflicts(request: CheckConflictsRequest): Promise<ScheduleConflictInfo> {
    return httpRequest<ScheduleConflictInfo>("/coach/api/Schedule/check-conflicts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  },

  /** Get schedule details by ID */
  async getSchedule(scheduleId: string): Promise<WorkoutScheduleResponse> {
    return httpRequest<WorkoutScheduleResponse>(`/coach/api/Schedule/${scheduleId}`, {
      method: "GET",
    });
  },

  /** Get all schedules for a user */
  async getUserSchedules(userId: string): Promise<WorkoutScheduleResponse[]> {
    return httpRequest<WorkoutScheduleResponse[]>(`/coach/api/Schedule/user/${userId}`, {
      method: "GET",
    });
  },

  /** Modify specific day in schedule */
  async modifyDay(
    scheduleId: string,
    dayNumber: number,
    userRequest: string
  ): Promise<ModifiedDayResponse> {
    return httpRequest<ModifiedDayResponse>(`/coach/api/Schedule/${scheduleId}/day/${dayNumber}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userRequest),
    });
  },

  /** Adjust schedule difficulty */
  async adjustDifficulty(
    scheduleId: string,
    request: Omit<AdjustDifficultyRequest, "scheduleId">
  ): Promise<ScheduleAdjustmentResponse> {
    return httpRequest<ScheduleAdjustmentResponse>(`/coach/api/Schedule/${scheduleId}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  },

  /** Mark exercise as completed */
  async markExerciseComplete(
    exerciseId: string,
    completed: boolean,
    actualSets?: number,
    actualReps?: number
  ): Promise<{ message: string }> {
    return httpRequest<{ message: string }>(`/coach/api/Schedule/exercise/${exerciseId}/complete`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed, actualSets, actualReps }),
    });
  },

  /** Submit workout feedback */
  async submitWorkoutFeedback(feedback: {
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
  }): Promise<{ message: string }> {
    return httpRequest<{ message: string }>("/coach/api/Schedule/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedback),
    });
  },

  /** Regenerate schedule from specific day */
  async regenerateSchedule(request: {
    currentScheduleId: string;
    fromDayNumber: number;
    reason: string;
    additionalNotes?: string;
    preserveCompleted: boolean;
    newDifficultyLevel?: string;
    newAvailableDays?: string[];
  }): Promise<WorkoutScheduleResponse> {
    return httpRequest<WorkoutScheduleResponse>("/coach/api/Schedule/regenerate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  },

  /** Edit workout day */
  async editWorkoutDay(request: {
    scheduleDayId: string;
    newFocusArea?: string;
    modifiedExercises?: Array<{
      exerciseId: string;
      newSets?: number;
      newReps?: string;
      newRestSeconds?: number;
      newNotes?: string;
    }>;
    exercisesToRemove?: string[];
    exercisesToAdd?: Array<{
      exerciseName: string;
      sets: number;
      reps: string;
      restSeconds: number;
      orderIndex: number;
    }>;
  }): Promise<ScheduleDayDetail> {
    return httpRequest<ScheduleDayDetail>("/coach/api/Schedule/day/edit", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  },

  /** Get schedule history */
  async getScheduleHistory(userId: string) {
    return httpRequest(`/coach/api/Schedule/history/user/${userId}`, {
      method: "GET",
    });
  },

  /** Get schedule analytics */
  async getScheduleAnalytics(userId: string) {
    return httpRequest(`/coach/api/Schedule/analytics/user/${userId}`, {
      method: "GET",
    });
  },

  /** Create or update user profile */
  async createOrUpdateProfile(request: {
    userId: string;
    heightCm: number;
    currentWeightKg: number;
    targetWeightKg: number;
    fitnessLevel: string;
    fitnessGoal: string;
    availableDays: string[];
    preferredWorkoutTime: string;
    workoutDurationMinutes: number;
    equipmentAvailable: string[];
    gymAccess: boolean;
    homeWorkoutOnly: boolean;
    dietaryRestrictions: string[];
    dislikedExercises: string[];
    favoriteExercises: string[];
    medicalConditions?: string;
  }) {
    return httpRequest(`/coach/api/UserProfile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  },

  /** Get user profile */
  async getUserProfile(userId: string): Promise<any> {
    return httpRequest(`/coach/api/UserProfile/${userId}`, {
      method: "GET",
    });
  },

  /** Get user health metrics (latest measurements) */
  async getLatestHealthMetrics(userId: string) {
    try {
      // This would ideally be a dedicated endpoint, but we can try the OCR health profile endpoint
      return await httpRequest(`/ai-ocr/api/OCR/users/${userId}/health-profile`, {
        method: "GET",
      });
    } catch (error) {
      console.error("Error fetching health metrics:", error);
      return null;
    }
  },

  /** Process health lab result with AI OCR */
  async processHealthLabResult(
    file: File,
    userId: string,
    prompt?: string,
    dataType: 'lab_result' | 'fitness_measurement' | 'general' = 'lab_result'
  ): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("UserId", userId);
    formData.append("Prompt", prompt || "Extract all body measurements, weight, muscle mass, body fat percentage, and any other health metrics from this health document.");
    formData.append("DataType", dataType);

    return httpRequest("/ai-ocr/api/OCR/ai-vision-upload", {
      method: "POST",
      body: formData,
      skipContentType: true, // Let browser set multipart/form-data with boundary
    });
  },

  /** Validate image/PDF file before upload */
  validateHealthImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload an image (JPG, PNG, WebP) or PDF file.',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Maximum size is 10MB.',
      };
    }

    return { valid: true };
  },

  // ==================== MANUAL SCHEDULE BUILDER METHODS ====================

  // AI Usage Limits
  getAIUsageLimits: async (userId: string): Promise<AIUsageLimits> => {
    const response = await httpRequest<{ success: boolean; data: AIUsageLimits }>(
      `/coach/api/schedule/ai-usage-limits/${userId}`,
      { method: 'GET' }
    );
    return response.data;
  },

  // Exercise Library
  getExerciseLibrary: async (filters?: ExerciseFilters): Promise<ExerciseLibraryDTO[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.searchQuery) params.append('searchQuery', filters.searchQuery);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await httpRequest<{ success: boolean; data: ExerciseLibraryDTO[]; count: number }>(
      `/coach/api/exercise-library${query}`,
      { method: 'GET' }
    );
    return response.data;
  },

  getExerciseById: async (id: string): Promise<ExerciseLibraryDTO> => {
    const response = await httpRequest<{ success: boolean; data: ExerciseLibraryDTO }>(
      `/coach/api/exercise-library/${id}`,
      { method: 'GET' }
    );
    return response.data;
  },

  searchExercises: async (query: string): Promise<ExerciseLibraryDTO[]> => {
    const response = await httpRequest<{ success: boolean; data: ExerciseLibraryDTO[]; count: number }>(
      `/coach/api/exercise-library/search?q=${encodeURIComponent(query)}`,
      { method: 'GET' }
    );
    return response.data;
  },

  getExerciseCategories: async (): Promise<string[]> => {
    const response = await httpRequest<{ success: boolean; data: string[] }>(
      `/coach/api/exercise-library/categories`,
      { method: 'GET' }
    );
    return response.data;
  },

  getAISuggestions: async (request: ExerciseSuggestionRequest): Promise<ExerciseLibraryDTO[]> => {
    const params = new URLSearchParams();
    params.append('focusArea', request.focusArea);
    params.append('difficulty', request.difficulty);
    if (request.count) params.append('count', request.count.toString());
    
    const response = await httpRequest<{ success: boolean; data: ExerciseLibraryDTO[]; count: number; note: string }>(
      `/coach/api/exercise-library/suggestions?${params.toString()}`,
      { method: 'GET' }
    );
    return response.data;
  },

  // Workout Templates
  getWorkoutTemplates: async (filters?: TemplateFilters): Promise<WorkoutTemplateDTO[]> => {
    const params = new URLSearchParams();
    if (filters?.focusArea) params.append('focusArea', filters.focusArea);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await httpRequest<{ success: boolean; data: WorkoutTemplateDTO[]; count: number }>(
      `/coach/api/workout-templates${query}`,
      { method: 'GET' }
    );
    return response.data;
  },

  getTemplateById: async (id: string): Promise<WorkoutTemplateDTO> => {
    const response = await httpRequest<{ success: boolean; data: WorkoutTemplateDTO }>(
      `/coach/api/workout-templates/${id}`,
      { method: 'GET' }
    );
    return response.data;
  },

  // Manual Schedule Management
  createManualSchedule: async (request: ManualScheduleRequest): Promise<WorkoutScheduleResponse> => {
    const response = await httpRequest<{ success: boolean; data: WorkoutScheduleResponse }>(
      `/coach/api/schedule/manual`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );
    return response.data;
  },

  addDayFromTemplate: async (scheduleId: string, request: AddDayFromTemplateRequest): Promise<WorkoutDayResponse> => {
    const response = await httpRequest<{ success: boolean; data: WorkoutDayResponse }>(
      `/coach/api/schedule/${scheduleId}/days/from-template`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );
    return response.data;
  },

  addCustomDay: async (scheduleId: string, request: AddCustomDayRequest): Promise<WorkoutDayResponse> => {
    const response = await httpRequest<{ success: boolean; data: WorkoutDayResponse }>(
      `/coach/api/schedule/${scheduleId}/days/custom`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );
    return response.data;
  },

  updateWorkoutDay: async (scheduleId: string, dayId: string, request: UpdateWorkoutDayRequest): Promise<WorkoutDayResponse> => {
    const response = await httpRequest<{ success: boolean; data: WorkoutDayResponse }>(
      `/coach/api/schedule/${scheduleId}/days/${dayId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );
    return response.data;
  },

  deleteWorkoutDay: async (scheduleId: string, dayId: string): Promise<void> => {
    await httpRequest<{ success: boolean; message: string }>(
      `/coach/api/schedule/${scheduleId}/days/${dayId}`,
      { method: 'DELETE' }
    );
  },
};
