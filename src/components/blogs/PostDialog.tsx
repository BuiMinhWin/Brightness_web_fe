import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ChatBubbleIcon,
  Share1Icon,
  HeartFilledIcon,
  HeartIcon,
  Cross2Icon,
  DotsVerticalIcon,
} from "@radix-ui/react-icons";
import { socialService } from "../../services/socialService";
import { authService } from "../../services/authService";
import { useSelector } from "react-redux";
import { selectUserId } from "../../store/slices/authSlice";
import type { Comment as CommentType } from "../../models/social";
import ImageViewer from "./ImageViewer";
import { useToast } from "../../hooks/useToast";
import ReportModal from "./ReportModal";
import { resolveApiAssetUrl } from "../../utils/media";

interface Comment {
  id: string;
  parentCommentId?: string | null;
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
  userVoteStatus?: { hasVoted: boolean; voteType: string | null }; // Track user's vote status
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
  const [isPostLiked, setIsPostLiked] = useState(
    post.userVoteStatus?.hasVoted && post.userVoteStatus?.voteType === "reaction"
  );
  const [postLikes, setPostLikes] = useState(post.interactions.likes || 0);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; userName: string } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const hasInteractedWithPostRef = useRef(false);

  // Only sync with post.userVoteStatus if user hasn't interacted yet
  useEffect(() => {
    if (!hasInteractedWithPostRef.current) {
      setIsPostLiked(post.userVoteStatus?.hasVoted && post.userVoteStatus?.voteType === "reaction");
      setPostLikes(post.interactions.likes || 0);
    }
  }, [post]);

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showMenu]);

  // Fetch comments when dialog opens
  useEffect(() => {
    if (isOpen && post.postId) {
      fetchComments();
    }
  }, [isOpen, post.postId]);

  const fetchComments = async () => {
    if (!post.postId) return;
    
    try {
      setLoadingComments(true);
      const fetchedComments = await socialService.getCommentsByPostId(post.postId);
      
      // First, transform all comments with user data
      const allCommentsWithUserData = await Promise.all(
        fetchedComments.map(async (comment) => {
          // Use userName from comment if available, otherwise try to fetch from auth service
          let displayName = comment.userName || `User ${comment.userId.substring(0, 8)}`;
          let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

          // Only fetch from auth service if userName is not present in comment
          if (!comment.userName) {
            try {
              const user = await authService.getUser(comment.userId);
              
              displayName = user.userName || user.fullName || `User ${comment.userId.substring(0, 8)}`;
              const resolvedAvatar = resolveApiAssetUrl(user.profilePicture);
              avatarUrl = resolvedAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
            } catch (err) {
              // Silently fail - fallback username is already set
              console.error(`Failed to fetch user data for userId ${comment.userId}:`, err);
            }
          }

          return {
            id: comment.id,
            parentCommentId: comment.parentCommentId,
            user: {
              name: displayName,
              avatar: avatarUrl,
            },
            text: comment.content,
            timestamp: new Date(comment.createdAt).toLocaleString(),
            likes: comment.reactionCount,
            replies: [] as Comment[],
          };
        })
      );

      // Now organize into tree structure
      // Separate top-level comments (no parent) from replies
      const topLevelComments: Comment[] = [];
      const repliesMap = new Map<string, Comment[]>();

      allCommentsWithUserData.forEach(comment => {
        if (!comment.parentCommentId) {
          // Top-level comment
          topLevelComments.push(comment);
        } else {
          // Reply to another comment
          if (!repliesMap.has(comment.parentCommentId)) {
            repliesMap.set(comment.parentCommentId, []);
          }
          repliesMap.get(comment.parentCommentId)!.push(comment);
        }
      });

      // Attach replies to their parent comments
      const buildTree = (comment: Comment): Comment => {
        const replies = repliesMap.get(comment.id) || [];
        return {
          ...comment,
          replies: replies.map(reply => buildTree(reply)),
        };
      };

      const transformedComments = topLevelComments.map(comment => buildTree(comment));
      
      setComments(transformedComments);
      
      // Initialize liked comments from backend userVoteStatus
      const likedCommentIds = new Set<string>();
      fetchedComments.forEach(comment => {
        if (comment.userVoteStatus?.hasVoted && comment.userVoteStatus?.voteType === "like") {
          likedCommentIds.add(comment.id);
        }
      });
      setLikedComments(likedCommentIds);
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

    const wasLiked = isPostLiked;
    const originalCount = postLikes;

    // Mark that user has interacted - we now own the state
    hasInteractedWithPostRef.current = true;

    try {
      // Optimistically update heart only (not count) for instant feedback
      setIsPostLiked(!wasLiked);

      // Call backend API
      if (wasLiked) {
        await socialService.cancelPostVote(post.postId);
      } else {
        await socialService.votePost(post.postId, "reaction");
      }

      // Fetch updated post to get accurate count from backend
      const updatedPost = await socialService.getPostById(post.postId);
      const isLiked = !!(updatedPost.userVoteStatus?.hasVoted && updatedPost.userVoteStatus?.voteType === "reaction");
      
      // Update with backend data
      setIsPostLiked(isLiked);
      setPostLikes(updatedPost.reactionCount);

      // Notify parent to update the feed with accurate backend data
      if (onPostUpdated) {
        onPostUpdated(post.postId, { 
          likes: updatedPost.reactionCount, 
          isLiked: isLiked
        });
      }
    } catch (err) {
      console.error("Failed to toggle post like:", err);
      // Revert on error
      setIsPostLiked(wasLiked);
      setPostLikes(originalCount);
      showToast({ message: "Failed to update like. Please try again.", severity: "error" });
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!userId) return;

    const isCurrentlyLiked = likedComments.has(commentId);

    try {
      // Optimistically update UI
      setLikedComments((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.delete(commentId);
        } else {
          newSet.add(commentId);
        }
        return newSet;
      });

      // Call API
      if (isCurrentlyLiked) {
        await socialService.cancelCommentVote(commentId);
      } else {
        await socialService.voteComment(commentId, "like");
      }

      // Refresh comments to get updated like count
      await fetchComments();
    } catch (err) {
      console.error("Failed to vote on comment:", err);
      // Revert optimistic update on error
      setLikedComments((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.add(commentId);
        } else {
          newSet.delete(commentId);
        }
        return newSet;
      });
      showToast({ message: "Failed to like comment. Please try again.", severity: "error" });
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !post.postId || !userId) return;

    try {
      setIsSubmittingComment(true);
      
      // If replying, include parentCommentId
      const createdComment = await socialService.createComment(post.postId, {
        content: newComment,
        ...(replyingTo && { parentCommentId: replyingTo.id }),
      });

      // Use userName from the returned comment
      const displayName = createdComment.userName || `User ${userId.substring(0, 8)}`;
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

      const newCommentData: Comment = {
        id: createdComment.id,
        user: {
          name: displayName,
          avatar: avatarUrl,
        },
        text: createdComment.content,
        timestamp: new Date(createdComment.createdAt).toLocaleString(),
        likes: 0,
        replies: [],
      };

      if (replyingTo) {
        // Add as a reply to the parent comment (supports nested replies)
        const addReplyRecursively = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === replyingTo.id) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newCommentData]
              };
            }
            // Search in nested replies
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: addReplyRecursively(comment.replies)
              };
            }
            return comment;
          });
        };
        
        setComments(prev => addReplyRecursively(prev));
      } else {
        // Add as a top-level comment
        setComments(prev => [newCommentData, ...prev]);
      }

      setNewComment("");
      setReplyingTo(null);

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

  const handleReportSubmit = async (reason: string) => {
    if (!post.postId) return;

    try {
      setIsSubmittingReport(true);
      await socialService.reportPost(post.postId, reason);
      showToast({ 
        message: "Thank you for your report. We'll review this post shortly.", 
        severity: "success" 
      });
      setShowReportModal(false);
      setShowMenu(false);
    } catch (err: any) {
      console.error("Failed to report post:", err);
      const errorMessage = err?.message || "Failed to submit report. Please try again.";
      showToast({ 
        message: errorMessage, 
        severity: "error" 
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleReplyClick = (commentId: string, userName: string) => {
    setReplyingTo({ id: commentId, userName });
    // Scroll to the comment input
    const commentInput = document.querySelector('textarea[placeholder*="comment"]') as HTMLTextAreaElement;
    if (commentInput) {
      commentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => commentInput.focus(), 300);
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const toggleExpandReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const renderComment = (comment: Comment, depth: number = 0, topLevelCommentId?: string) => {
    const isLiked = likedComments.has(comment.id);
    
    // Use top-level comment ID for expansion state
    const commentIdForExpansion = topLevelCommentId || comment.id;
    const isExpanded = expandedReplies.has(commentIdForExpansion);
    
    // Count total nested replies (depth 2+)
    const countNestedReplies = (replies: Comment[] | undefined): number => {
      if (!replies || replies.length === 0) return 0;
      let count = 0;
      replies.forEach(reply => {
        count += 1 + countNestedReplies(reply.replies);
      });
      return count;
    };
    
    const hasNestedReplies = depth === 0 && comment.replies && comment.replies.some(reply => reply.replies && reply.replies.length > 0);
    const nestedReplyCount = depth === 0 ? comment.replies?.reduce((sum, reply) => sum + countNestedReplies(reply.replies), 0) || 0 : 0;

    return (
      <div
        key={comment.id}
        style={{
          marginLeft: depth > 0 ? "40px" : "0",
          marginBottom: "16px",
          paddingBottom: "16px",
          borderBottom: depth === 0 ? "1px solid rgba(0, 0, 0, 0.1)" : "none",
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
                {comment.likes}
              </button>
              <button
                onClick={() => handleReplyClick(comment.id, comment.user.name)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "#666",
                  padding: "4px 0",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#007E85";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#666";
                }}
              >
                Reply
              </button>
            </div>
          </div>
        </div>

        {/* Render replies */}
        {comment.replies && comment.replies.map((reply) => {
          // Always render first-level replies (depth 0 -> 1)
          if (depth === 0) {
            return renderComment(reply, depth + 1, comment.id);
          }
          // Only render deeper nested replies if expanded
          if (depth >= 1 && isExpanded) {
            return renderComment(reply, depth + 1, topLevelCommentId);
          }
          return null;
        })}

        {/* Show more replies button - only on top-level comments */}
        {depth === 0 && hasNestedReplies && !isExpanded && (
          <div
            style={{
              marginLeft: "44px",
              marginTop: "8px",
            }}
          >
            <button
              onClick={() => toggleExpandReplies(commentIdForExpansion)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                color: "#007E85",
                padding: "4px 0",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              <span>↳</span> Show {nestedReplyCount} more {nestedReplyCount === 1 ? 'reply' : 'replies'}
            </button>
          </div>
        )}

        {/* Hide replies button - only on top-level comments */}
        {depth === 0 && hasNestedReplies && isExpanded && (
          <div
            style={{
              marginLeft: "44px",
              marginTop: "8px",
            }}
          >
            <button
              onClick={() => toggleExpandReplies(commentIdForExpansion)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                color: "#007E85",
                padding: "4px 0",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Hide replies
            </button>
          </div>
        )}
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
          {/* Header Controls */}
          <div
            style={{
              position: "sticky",
              top: "16px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              zIndex: 1001,
              float: "right",
              marginBottom: "-40px",
              marginRight: "16px",
            }}
          >
            {/* Menu Button */}
            <div style={{ position: "relative" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                style={{
                  background: "rgba(0, 0, 0, 0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.1)";
                }}
              >
                <DotsVerticalIcon width={16} height={16} />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    top: "40px",
                    right: "0",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                    minWidth: "180px",
                    overflow: "hidden",
                    zIndex: 1002,
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowReportModal(true);
                      setShowMenu(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#ef4444",
                      fontWeight: "500",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                    }}
                  >
                    Report post
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                background: "rgba(0, 0, 0, 0.1)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.1)";
              }}
            >
              <Cross2Icon width={16} height={16} />
            </button>
          </div>

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
            <div style={{ position: "relative" }}>
              {/* Replying To Chip - Inside Input */}
              {replyingTo && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 8px",
                    backgroundColor: "rgba(0, 126, 133, 0.15)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#007E85",
                    fontWeight: "500",
                    zIndex: 1,
                    pointerEvents: "auto",
                  }}
                >
                  <span>Replying to {replyingTo.userName}</span>
                  <button
                    onClick={handleCancelReply}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                      color: "#007E85",
                      padding: "0",
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Cancel reply"
                  >
                    ×
                  </button>
                </div>
              )}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyingTo ? "" : "Write a comment..."}
                disabled={!userId || isSubmittingComment}
                style={{
                  width: "100%",
                  minHeight: "60px",
                  padding: replyingTo ? "36px 12px 12px 12px" : "12px",
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
            </div>
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
              {isSubmittingComment ? "Posting..." : replyingTo ? "Post Reply" : "Post Comment"}
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

        {/* Report Modal */}
        {showReportModal && createPortal(
          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            onSubmit={handleReportSubmit}
            isSubmitting={isSubmittingReport}
          />,
          document.body
        )}
      </div>
    </>
  );
};

export default PostDialog;
