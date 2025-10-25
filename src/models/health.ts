// Health Profile Models
export interface UserHealthProfile {
  userId: string;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  fitnessLevel: string; // beginner, intermediate, advanced
  fitnessGoal: string; // lose_weight, gain_muscle, maintain, improve_endurance
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserHealthMetric {
  id: string;
  userId: string;
  measurementDate: string;
  weightKg: number;
  muscleMassKg: number;
  bodyFatPercentage: number;
  bodyFatKg: number;
  bmrKcal: number;
  waterPercentage: number;
  boneMassKg: number;
  visceralFatLevel: number;
  metabolicAge: number;
  source: string;
  rawDataJson?: string;
  createdAt: string;
}

export interface CreateUserHealthProfileRequest {
  userId: string;
  // UserProfile fields
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  fitnessLevel: string;
  fitnessGoal: string;
  // UserPreference fields
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
}

export interface UserProfileResponse {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth?: string;
  gender: string;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  fitnessLevel: string;
  fitnessGoal: string;
  // UserPreference fields
  availableDays: string[];
  preferredWorkoutTime: string;
  workoutDurationMinutes: number;
  equipmentAvailable: string[];
  gymAccess: boolean;
  homeWorkoutOnly: boolean;
  dietaryRestrictions: string[];
  dislikedExercises: string[];
  favoriteExercises: string[];
  createdAt: string;
  updatedAt?: string;
}

