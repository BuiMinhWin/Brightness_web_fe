// File: src/models/social.ts

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  visibility: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  reactionCount: number;
  dislikeCount: number;
  commentCount: number;
  reportCount?: number;
  images?: PostImageMetadata[];
  imagesWithData?: Array<PostImageMetadata & { imageUrl: string | null }>;
  userVoteStatus?: { hasVoted: boolean; voteType: string | null };
  userData?: { userName: string; fullName: string | null; profilePicture: string | null };
}

export interface PostImageMetadata {
  id: string;
  postId: string;
  fileName: string | null;
  contentType: string | null;
  createdAt: string;
}

export interface PostImageDetail extends PostImageMetadata {
  imageData: string; // Base64 encoded image data
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName?: string | null;
  content: string;
  parentCommentId: string | null;
  createdAt: string;
  updatedAt: string | null;
  reactionCount: number;
  dislikeCount: number;
  userVoteStatus?: { hasVoted: boolean; voteType: string | null };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
}

export interface PostVote {
  id: string;
  postId: string;
  userId: string;
  voteType: string; // "reaction" or "dislike"
  createdAt: string;
}

export interface CreateCommentPayload {
  content: string;
  parentCommentId?: string | null;
}

export interface CreatePostPayload {
  userId: string;
  title: string;
  content: string;
  visibility: string;
  status: string;
}

export interface UpdatePostPayload {
  id: string;
  userId: string;
  title: string;
  content: string;
  visibility: string;
  status: string;
}


