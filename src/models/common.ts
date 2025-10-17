// File: src/models/common.ts

/**
 * A standardized API response structure used throughout the application.
 * @template T The type of the data payload.
 */
export interface ApiResponse<T> {
  flag: boolean;
  message: string;
  data: T | null;
}
