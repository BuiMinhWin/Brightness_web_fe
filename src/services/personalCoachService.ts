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

export const personalCoachService = {
  /** Generate AI-powered workout schedule */
  async generateSchedule(request: GenerateScheduleRequest): Promise<WorkoutScheduleResponse> {
    return httpRequest<WorkoutScheduleResponse>("/coach/api/Schedule/generate", {
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
  async getUserProfile(userId: string) {
    return httpRequest(`/coach/api/UserProfile/${userId}`, {
      method: "GET",
    });
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
};
