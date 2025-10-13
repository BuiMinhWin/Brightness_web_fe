import type { 
  MediaItem, 
  PaginatedMediaResponse, 
  CreateMediaItemRequest, 
  UpdateMediaItemRequest 
} from "../models/media";
import { httpRequest } from "./httpClient";

const prefix = "/media/api/media";

export const mediaService = {
  /**
   * Get all videos with pagination, search, and sorting
   */
  async getAllVideos(
    pageNumber: number = 1, 
    pageSize: number = 10,
    searchQuery?: string,
    sortBy?: 'date' | 'views' | 'likes' | 'title',
    category?: string
  ): Promise<PaginatedMediaResponse> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });

    if (searchQuery) params.append('search', searchQuery);
    if (sortBy) params.append('sortBy', sortBy);
    if (category) params.append('category', category);

    const response = await httpRequest<PaginatedMediaResponse>(
      `${prefix}?${params.toString()}`,
      { method: "GET" }
    );
    
    // Backend now returns proper paginated response with metadata
    return response;
  },

  /**
   * Get video by ID
   */
  async getVideoById(id: string): Promise<MediaItem> {
    return httpRequest<MediaItem>(`${prefix}/${id}`, { method: "GET" });
  },

  /**
   * Create a new video
   */
  async createVideo(payload: CreateMediaItemRequest): Promise<MediaItem> {
    return httpRequest<MediaItem>(`${prefix}`, {
      method: "POST",
      body: payload,
    });
  },

  /**
   * Update a video
   */
  async updateVideo(id: string, payload: UpdateMediaItemRequest): Promise<boolean> {
    const response = await httpRequest<{ message?: string }>(`${prefix}/${id}`, {
      method: "PUT",
      body: payload,
    });
    return true;
  },

  /**
   * Delete a video
   */
  async deleteVideo(id: string): Promise<boolean> {
    const response = await httpRequest<{ message?: string }>(`${prefix}/${id}`, {
      method: "DELETE",
    });
    return true;
  },

  /**
   * Like a video
   */
  async likeVideo(id: string): Promise<boolean> {
    const response = await httpRequest<{ message?: string }>(`${prefix}/${id}/like`, {
      method: "POST",
    });
    return true;
  },

  /**
   * Unlike a video
   */
  async unlikeVideo(id: string): Promise<boolean> {
    const response = await httpRequest<{ message?: string }>(`${prefix}/${id}/like`, {
      method: "DELETE",
    });
    return true;
  },

  /**
   * Track video view
   */
  async viewVideo(id: string): Promise<boolean> {
    try {
      const response = await httpRequest<{ message?: string }>(`${prefix}/${id}/view`, {
        method: "POST",
      });
      return true;
    } catch (error) {
      console.error("Error tracking video view:", error);
      return false;
    }
  },

  /**
   * Download video
   */
  async downloadVideo(id: string): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/${prefix}/${id}/download`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to download video");
    }
    
    return response.blob();
  },
};

