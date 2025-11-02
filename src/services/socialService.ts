// File: src/services/socialService.ts

import { httpRequest } from "./httpClient";
import type {
  Post,
  Comment,
  Tag,
  PostVote,
  CreateCommentPayload,
  CreatePostPayload,
  UpdatePostPayload,
} from "../models/social";

// Base URLs for Social API endpoints
const postsBaseUrl = "/social/api/Posts";
const tagsBaseUrl = "/social/api/tags";

export const socialService = {
  // ============= Posts API =============

  /**
   * Get all posts
   * @returns List of all posts
   */
  async getPosts(): Promise<Post[]> {
    return httpRequest<Post[]>(postsBaseUrl, {
      method: "GET",
    });
  },

  /**
   * Get a single post by ID
   * @param postId - The ID of the post
   * @returns Post details
   */
  async getPostById(postId: string): Promise<Post> {
    return httpRequest<Post>(`${postsBaseUrl}/${postId}`, {
      method: "GET",
    });
  },

  /**
   * Get posts by tag
   * @param tagSlug - The slug of the tag
   * @returns List of posts with the specified tag
   */
  async getPostsByTag(tagSlug: string): Promise<Post[]> {
    return httpRequest<Post[]>(`${postsBaseUrl}/tag/${tagSlug}`, {
      method: "GET",
    });
  },

  /**
   * Create a new post
   * @param payload - Post data
   * @returns Created post
   */
  async createPost(payload: CreatePostPayload): Promise<Post> {
    return httpRequest<Post>(postsBaseUrl, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update an existing post
   * @param postId - The ID of the post to update
   * @param payload - Updated post data
   * @returns Updated post
   */
  async updatePost(postId: string, payload: UpdatePostPayload): Promise<Post> {
    return httpRequest<Post>(`${postsBaseUrl}/${postId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update post status
   * @param postId - The ID of the post
   * @param status - New status
   * @returns Updated post
   */
  async updatePostStatus(postId: string, status: string): Promise<Post> {
    return httpRequest<Post>(`${postsBaseUrl}/${postId}/status`, {
      method: "PATCH",
      body: JSON.stringify(status),
    });
  },

  /**
   * Delete a post
   * @param postId - The ID of the post to delete
   */
  async deletePost(postId: string): Promise<string> {
    return httpRequest<string>(`${postsBaseUrl}/${postId}`, {
      method: "DELETE",
    });
  },

  /**
   * Vote on a post (like or dislike)
   * @param postId - The ID of the post
   * @param voteType - "reaction" or "dislike"
   * @returns Success message
   */
  async votePost(postId: string, voteType: string): Promise<string> {
    return httpRequest<string>(`${postsBaseUrl}/${postId}/vote`, {
      method: "POST",
      body: JSON.stringify({ voteType }),
    });
  },

  /**
   * Cancel vote on a post
   * @param postId - The ID of the post
   * @returns Success message
   */
  async cancelPostVote(postId: string): Promise<string> {
    return httpRequest<string>(`${postsBaseUrl}/${postId}/vote`, {
      method: "DELETE",
    });
  },

  /**
   * Get user's vote status for a post
   * @param postId - The ID of the post
   * @returns Vote status (hasVoted, voteType)
   */
  async getUserVote(postId: string): Promise<{ hasVoted: boolean; voteType: string | null }> {
    return httpRequest<{ hasVoted: boolean; voteType: string | null }>(`${postsBaseUrl}/${postId}/vote`, {
      method: "GET",
    });
  },

  // ============= Comments API =============

  /**
   * Get all comments for a post
   * @param postId - The ID of the post
   * @returns List of comments
   */
  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    return httpRequest<Comment[]>(`/social/api/posts/${postId}/comments`, {
      method: "GET",
    });
  },

  /**
   * Create a comment on a post
   * @param postId - The ID of the post
   * @param payload - Comment data
   * @returns Created comment
   */
  async createComment(postId: string, payload: CreateCommentPayload): Promise<Comment> {
    return httpRequest<Comment>(`/social/api/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get a specific comment
   * @param postId - The ID of the post
   * @param commentId - The ID of the comment
   * @returns Comment details
   */
  async getCommentById(postId: string, commentId: string): Promise<Comment> {
    return httpRequest<Comment>(`/social/api/posts/${postId}/comments/${commentId}`, {
      method: "GET",
    });
  },

  /**
   * Vote on a comment (like)
   * @param commentId - The ID of the comment
   * @param voteType - Type of vote (e.g., "like")
   */
  async voteComment(commentId: string, voteType: string = "like"): Promise<void> {
    return httpRequest<void>(`/social/api/comments/${commentId}/vote`, {
      method: "POST",
      body: JSON.stringify({ VoteType: voteType }),
    });
  },

  /**
   * Cancel vote on a comment
   * @param commentId - The ID of the comment
   */
  async cancelCommentVote(commentId: string): Promise<void> {
    return httpRequest<void>(`/social/api/comments/${commentId}/vote`, {
      method: "DELETE",
    });
  },

  /**
   * Update a comment
   * @param postId - The ID of the post
   * @param commentId - The ID of the comment
   * @param content - Updated comment content
   * @returns Updated comment
   */
  async updateComment(postId: string, commentId: string, content: string): Promise<Comment> {
    return httpRequest<Comment>(`/social/api/posts/${postId}/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    });
  },

  /**
   * Delete a comment
   * @param postId - The ID of the post
   * @param commentId - The ID of the comment
   */
  async deleteComment(postId: string, commentId: string): Promise<void> {
    return httpRequest<void>(`/social/api/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    });
  },

  // ============= Tags API =============

  /**
   * Get all tags
   * @returns List of all tags
   */
  async getTags(): Promise<Tag[]> {
    return httpRequest<Tag[]>(tagsBaseUrl, {
      method: "GET",
    });
  },

  /**
   * Get a tag by ID
   * @param tagId - The ID of the tag
   * @returns Tag details
   */
  async getTagById(tagId: string): Promise<Tag> {
    return httpRequest<Tag>(`${tagsBaseUrl}/${tagId}`, {
      method: "GET",
    });
  },

  /**
   * Create a new tag
   * @param payload - Tag data
   * @returns Created tag
   */
  async createTag(payload: { name: string; description?: string }): Promise<Tag> {
    return httpRequest<Tag>(tagsBaseUrl, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete a tag
   * @param tagId - The ID of the tag to delete
   */
  async deleteTag(tagId: string): Promise<string> {
    return httpRequest<string>(`${tagsBaseUrl}/${tagId}`, {
      method: "DELETE",
    });
  },

  // ============= Post Images API =============

  /**
   * Upload an image to a post
   * @param postId - The ID of the post
   * @param imageFile - The image file to upload
   * @returns Uploaded image metadata
   */
  async uploadPostImage(postId: string, imageFile: File): Promise<any> {
    console.log(`📤 Uploading image to post ${postId}:`, {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type
    });

    const formData = new FormData();
    formData.append("file", imageFile);

    const url = `/social/api/posts/${postId}/images`;
    console.log(`📤 Upload URL: ${url}`);

    try {
      const result = await httpRequest<any>(url, {
        method: "POST",
        body: formData,
        skipContentType: true, // Let browser set multipart/form-data boundary
      });
      console.log(`✅ Image uploaded successfully:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Image upload failed for ${imageFile.name}:`, error);
      throw error;
    }
  },

  /**
   * Upload multiple images to a post
   * @param postId - The ID of the post
   * @param imageFiles - Array of image files to upload
   * @returns Array of uploaded image metadata
   */
  async uploadPostImages(postId: string, imageFiles: File[]): Promise<any[]> {
    const uploadPromises = imageFiles.map((file) => this.uploadPostImage(postId, file));
    return Promise.all(uploadPromises);
  },

  /**
   * Get all images for a post
   * @param postId - The ID of the post
   * @returns List of image metadata
   */
  async getPostImages(postId: string): Promise<any[]> {
    return httpRequest<any[]>(`/social/api/posts/${postId}/images`, {
      method: "GET",
    });
  },

  /**
   * Get a single image by ID (returns image data)
   * @param imageId - The ID of the image
   * @returns Image data with base64 or binary
   */
  async getPostImageById(imageId: string): Promise<any> {
    return httpRequest<any>(`/social/api/posts/images/${imageId}`, {
      method: "GET",
    });
  },

  /**
   * Delete an image
   * @param imageId - The ID of the image to delete
   */
  async deletePostImage(imageId: string): Promise<void> {
    return httpRequest<void>(`/social/api/posts/images/${imageId}`, {
      method: "DELETE",
    });
  },

  // ============= Post Reports API =============

  /**
   * Report a post
   * @param postId - The ID of the post to report
   * @param reason - Reason for reporting
   * Resolves when the report has been submitted
   */
  async reportPost(postId: string, reason: string): Promise<void> {
    await httpRequest(`/social/api/reports`, {
      method: "POST",
      body: JSON.stringify({
        targetType: "post",
        targetId: postId,
        reason,
      }),
    });
  },

  /**
   * Get all flagged posts (for admin)
   * @returns List of posts with high report counts
   */
  async getFlaggedPosts(): Promise<Post[]> {
    return httpRequest<Post[]>(`${postsBaseUrl}/flagged`, {
      method: "GET",
    });
  },

  /**
   * Soft delete a post (for admin)
   * @param postId - The ID of the post to soft delete
   * @returns Success message
   */
  async softDeletePost(postId: string): Promise<string> {
    return httpRequest<string>(`${postsBaseUrl}/${postId}/soft-delete`, {
      method: "DELETE",
    });
  },

  /**
   * Get report count for a post
   * @param postId - The ID of the post
   * @returns Report count
   */
  async getPostReportCount(postId: string): Promise<{ reportCount: number }> {
    return httpRequest<{ reportCount: number }>(`${postsBaseUrl}/${postId}/reports/count`, {
      method: "GET",
    });
  },
};


