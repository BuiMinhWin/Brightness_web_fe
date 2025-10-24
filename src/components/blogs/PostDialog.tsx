import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ChatBubbleIcon,
  Share1Icon,
  HeartFilledIcon,
  HeartIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { socialService } from "../../services/socialService";
import { useSelector } from "react-redux";
import { selectUserId } from "../../store/slices/authSlice";
import type { Comment as CommentType } from "../../models/social";
import ImageViewer from "./ImageViewer";
import { useToast } from "../../hooks/useToast";

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

interface PostData {
  user: {
    name: string;
    avatar: string;
  };
  timestamp: string;
  content: {
    title?: string;
    text: string;
    media?: string[];
  };
  interactions: {
    comments: number;
    retweets: number;
    likes: number;
  };
  postId?: string; // Add postId to fetch comments and handle likes
}

interface PostDialogProps {
  post: PostData;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated?: (postId: string, updates: { likes?: number; comments?: number; isLiked?: boolean }) => void;
}

const PostDialog: React.FC<PostDialogProps> = ({ post, isOpen, onClose, onPostUpdated }) => {
  const { showToast } = useToast();
  const userId = useSelector(selectUserId);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [postLikes, setPostLikes] = useState(post.interactions.likes || 0);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null);

  // Disable body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Fetch comments and vote status when dialog opens
  useEffect(() => {
    if (isOpen && post.postId) {
      fetchComments();
      fetchUserVoteStatus();
    }
  }, [isOpen, post.postId]);

  const fetchUserVoteStatus = async () => {
    if (!post.postId) return;
    
    try {
      const voteStatus = await socialService.getUserVote(post.postId);
      setIsPostLiked(voteStatus.hasVoted && voteStatus.voteType === "reaction");
    } catch (err) {
      console.error("Failed to fetch user vote status:", err);
    }
  };

  const fetchComments = async () => {
    if (!post.postId) return;
    
    try {
      setLoadingComments(true);
      const fetchedComments = await socialService.getCommentsByPostId(post.postId);
      
      // Transform API comments to UI format
      const transformedComments: Comment[] = fetchedComments.map(comment => ({
        id: comment.id,
        user: {
          name: `User ${comment.userId.substring(0, 8)}`,
          avatar: `https://ui-avatars.com/api/?name=User&background=random`,
        },
        text: comment.content,
        timestamp: new Date(comment.createdAt).toLocaleString(),
        likes: comment.reactionCount,
      }));
      
      setComments(transformedComments);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const getMediaGridStyle = (mediaCount: number) => {
    if (mediaCount === 1) {
      return {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "8px",
        marginTop: "12px",
      };
    } else if (mediaCount === 2) {
      return {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px",
        marginTop: "12px",
      };
    } else if (mediaCount >= 3) {
      return {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: "8px",
        marginTop: "12px",
      };
    }
    return {};
  };

  const handlePostLike = async () => {
    if (!post.postId || !userId) return;

    try {
      const newLikedState = !isPostLiked;
      const newLikesCount = Math.max(0, isPostLiked ? postLikes - 1 : postLikes + 1);

      if (isPostLiked) {
        // Unlike the post
        await socialService.cancelPostVote(post.postId);
        setIsPostLiked(false);
        setPostLikes(newLikesCount);
      } else {
        // Like the post
        await socialService.votePost(post.postId, "reaction");
        setIsPostLiked(true);
        setPostLikes(newLikesCount);
      }

      // Notify parent to update the feed
      if (onPostUpdated) {
        onPostUpdated(post.postId, { 
          likes: newLikesCount, 
          isLiked: newLikedState 
        });
      }
    } catch (err) {
      console.error("Failed to toggle post like:", err);
    }
  };

  const handleCommentLike = (commentId: string) => {
    // TODO: Implement comment voting API when available
    setLikedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !post.postId || !userId) return;

    try {
      setIsSubmittingComment(true);
      const createdComment = await socialService.createComment(post.postId, {
        content: newComment,
      });

      // Add new comment to the list
      const newCommentData: Comment = {
        id: createdComment.id,
        user: {
          name: `User ${userId.substring(0, 8)}`,
          avatar: `https://ui-avatars.com/api/?name=User&background=random`,
        },
        text: createdComment.content,
        timestamp: new Date(createdComment.createdAt).toLocaleString(),
        likes: 0,
      };

      setComments(prev => [newCommentData, ...prev]);
      setNewComment("");

      // Notify parent to update comment count in feed
      if (onPostUpdated && post.postId) {
        onPostUpdated(post.postId, { 
          comments: comments.length + 1 
        });
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
      showToast({ message: "Failed to post comment. Please try again.", severity: "error" });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const isLiked = likedComments.has(comment.id);

    return (
      <div
        key={comment.id}
        style={{
          marginLeft: isReply ? "40px" : "0",
          marginBottom: "16px",
          paddingBottom: "16px",
          borderBottom: isReply ? "none" : "1px solid rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", gap: "12px" }}>
          <img
            src={comment.user.avatar}
            alt={comment.user.name}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                }}
              >
                {comment.user.name}
              </h4>
              <span
                style={{
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                {comment.timestamp}
              </span>
            </div>
            <p
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                lineHeight: "1.4",
                color: "#333",
              }}
            >
              {comment.text}
            </p>
            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => handleCommentLike(comment.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: isLiked ? "#ef4444" : "#666",
                  padding: "4px 0",
                }}
              >
                {isLiked ? (
                  <HeartFilledIcon width={14} height={14} />
                ) : (
                  <HeartIcon width={14} height={14} />
                )}
                {comment.likes + (isLiked ? 1 : 0)}
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "#666",
                  padding: "4px 0",
                }}
              >
                Reply
              </button>
            </div>
          </div>
        </div>

        {/* Render Replies */}
        {comment.replies && comment.replies.map((reply) => renderComment(reply, true))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          .post-dialog-content::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}
      >
        <div
          className="post-dialog-content"
          style={{
            backgroundColor: "#D1F5D4",
            borderRadius: "16px",
            maxWidth: "800px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            position: "relative",
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE and Edge
          }}
        >
          {/* Sticky Close Button */}
          <button
            onClick={onClose}
            style={{
              position: "sticky",
              top: "16px",
              left: "calc(100% - 48px)",
              background: "rgba(0, 0, 0, 0.1)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 1001,
              float: "right",
              marginBottom: "-32px",
              marginRight: "16px",
            }}
          >
            <Cross2Icon width={16} height={16} />
          </button>

          {/* Blog Post */}
          <div style={{ padding: "24px" }}>
            {/* Header Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <img
                src={post.user.avatar}
                alt={post.user.name}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  marginRight: "12px",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    lineHeight: "1",
                  }}
                >
                  {post.user.name}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#666",
                    fontWeight: "400",
                    lineHeight: "1",
                  }}
                >
                  {post.timestamp}
                </p>
              </div>
            </div>

            {/* Content Section */}
            <div style={{ marginBottom: "24px" }}>
              {post.content.title && (
                <h2
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "22px",
                    fontWeight: "700",
                    lineHeight: "1.3",
                    color: "#1a1a1a",
                  }}
                >
                  {post.content.title}
                </h2>
              )}
              <p
                style={{
                  margin: 0,
                  fontSize: "16px",
                  lineHeight: "1.5",
                  color: "#333",
                  marginBottom: post.content.media && post.content.media.length > 0 ? "12px" : "0",
                  whiteSpace: "pre-wrap",
                }}
              >
                {post.content.text}
              </p>

              {post.content.media && post.content.media.length > 0 && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: post.content.media.length === 1 ? "1fr" : post.content.media.length === 2 ? "1fr 1fr" : "repeat(2, 1fr)",
                  gap: "8px",
                  marginTop: "12px",
                }}>
                  {post.content.media.map((mediaUrl, index) => (
                    <div
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingImageIndex(index);
                      }}
                      style={{
                        width: "100%",
                        maxHeight: post.content.media!.length === 1 ? "400px" : "300px",
                        overflow: "hidden",
                        borderRadius: "8px",
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gridColumn: post.content.media!.length === 3 && index === 0 ? "1 / 3" : "auto",
                        cursor: "pointer",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                      }}
                    >
                      <img
                        src={mediaUrl}
                        alt={`Media ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "auto",
                          maxHeight: post.content.media!.length === 1 ? "400px" : "300px",
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post Interactions */}
            <div
              style={{
                borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                paddingTop: "12px",
                display: "flex",
                gap: "16px",
              }}
            >
              <button
                onClick={handlePostLike}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: isPostLiked ? "#ef4444" : "#666",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                }}
              >
                {isPostLiked ? (
                  <HeartFilledIcon width={18} height={18} />
                ) : (
                  <HeartIcon width={18} height={18} />
                )}
                <span style={{ fontWeight: "500" }}>{postLikes}</span>
              </button>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#666",
                  padding: "8px 12px",
                }}
              >
                <ChatBubbleIcon width={18} height={18} />
                <span style={{ fontWeight: "500" }}>{comments.length}</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div
            style={{
              borderTop: "1px solid rgba(0, 0, 0, 0.1)",
              padding: "24px",
              paddingBottom: "120px", // Add space for sticky input
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#1a1a1a",
              }}
            >
              Comments ({comments.length})
            </h3>

            {loadingComments ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => renderComment(comment))
            )}
          </div>

          {/* Sticky Add Comment Input */}
          <div
            style={{
              position: "sticky",
              bottom: 0,
              backgroundColor: "#D1F5D4",
              borderTop: "1px solid rgba(0, 0, 0, 0.1)",
              padding: "16px 24px",
              boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              disabled={!userId || isSubmittingComment}
              style={{
                width: "100%",
                minHeight: "60px",
                padding: "12px",
                border: "1px solid #186620",
                borderRadius: "8px",
                fontSize: "14px",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
                backgroundColor: "#D1F5D4",
                opacity: !userId ? 0.6 : 1,
              }}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || !userId || isSubmittingComment}
              style={{
                marginTop: "8px",
                padding: "8px 16px",
                backgroundColor: newComment.trim() && userId && !isSubmittingComment ? "#007E85" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: newComment.trim() && userId && !isSubmittingComment ? "pointer" : "not-allowed",
                fontSize: "14px",
                fontWeight: "500",
                opacity: isSubmittingComment ? 0.7 : 1,
              }}
            >
              {isSubmittingComment ? "Posting..." : "Post Comment"}
            </button>
            {!userId && (
              <p style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
                Please log in to comment
              </p>
            )}
          </div>
        </div>

        {/* Image Viewer Modal - Render in portal */}
        {viewingImageIndex !== null && post.content.media && createPortal(
          <ImageViewer
            images={post.content.media}
            initialIndex={viewingImageIndex}
            isOpen={viewingImageIndex !== null}
            onClose={() => setViewingImageIndex(null)}
          />,
          document.body
        )}
      </div>
    </>
  );
};

export default PostDialog;
