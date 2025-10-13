// File: src/models/media.ts

/**
 * Media API response structure
 */
export interface ApiResponse<T> {
  flag: boolean;
  message: string;
  data: T | null;
}

/**
 * Media item structure from backend (MediaItemDTO)
 */
export interface MediaItem {
  id: string;
  title: string | null;
  description: string | null;
  url: string;
  thumbnail: string | null;
  views: number;
  likes: number;
  category: string | null;
  duration: string | null;
  platform: string | null;
  source: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Paginated media response
 */
export interface PaginatedMediaResponse {
  items: MediaItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Create media item request
 */
export interface CreateMediaItemRequest {
  title: string;
  description?: string | null;
  url: string;
  thumbnail?: string | null;
  category?: string | null;
  duration?: string | null;
  platform?: string | null;
  source?: string | null;
}

/**
 * Update media item request
 */
export interface UpdateMediaItemRequest {
  title?: string | null;
  description?: string | null;
  url?: string | null;
  thumbnail?: string | null;
  category?: string | null;
  duration?: string | null;
  platform?: string | null;
  source?: string | null;
  status?: string | null;
}

/**
 * Video card interface for UI components
 */
export interface VideoCardData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  views: number;
  rating?: number;
  duration: string;
  category: string;
  videoUrl?: string;
  detailedDescription?: string;
  instructor?: string;
  instructorTitle?: string;
  uploadDate?: string;
  tags?: string[];
  likes?: number;
}

