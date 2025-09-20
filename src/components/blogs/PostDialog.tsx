import React, { useState, useEffect } from "react";
import {
  StarFilledIcon,
  StarIcon,
  ChatBubbleIcon,
  Share1Icon,
  HeartFilledIcon,
  HeartIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import sampleComments from "../../assets/temps/sampleComments.json";

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
    rating: number;
  };
  timestamp: string;
  content: {
    text: string;
    media?: string[];
  };
  interactions: {
    comments: number;
    retweets: number;
    likes: number;
  };
}

interface PostDialogProps {
  post: PostData;
  isOpen: boolean;
  onClose: () => void;
}

const PostDialog: React.FC<PostDialogProps> = ({ post, isOpen, onClose }) => {
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

  const [comments, setComments] = useState<Comment[]>(sampleComments);

  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} style={{ color: index < rating ? "#FFD700" : "#E5E5E5" }}>
        {index < rating ? (
          <StarFilledIcon width={14} height={14} />
        ) : (
          <StarIcon width={14} height={14} />
        )}
      </span>
    ));
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

  const handleCommentLike = (commentId: string) => {
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
                  height: "48px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    marginBottom: "1px",
                    lineHeight: "1",
                  }}
                >
                  {post.user.name}
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: "2px",
                    margin: 0,
                  }}
                >
                  {renderStars(post.user.rating)}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#666",
                    fontWeight: "400",
                    lineHeight: "1",
                    marginTop: "1px",
                  }}
                >
                  {post.timestamp}
                </p>
              </div>
            </div>

            {/* Content Section */}
            <div style={{ marginBottom: "24px" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "16px",
                  lineHeight: "1.5",
                  color: "#333",
                  marginBottom: post.content.media && post.content.media.length > 0 ? "12px" : "0",
                }}
              >
                {post.content.text}
              </p>

              {post.content.media && post.content.media.length > 0 && (
                <div style={getMediaGridStyle(post.content.media.length)}>
                  {post.content.media.map((mediaUrl, index) => (
                    <img
                      key={index}
                      src={mediaUrl}
                      alt={`Media ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        gridRow: post.content.media!.length > 2 && index === 0 ? "1 / 3" : "auto",
                      }}
                    />
                  ))}
                </div>
              )}
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

            {comments.map((comment) => renderComment(comment))}
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
              placeholder="Write a comment..."
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
              }}
            />
            <button
              style={{
                marginTop: "8px",
                padding: "8px 16px",
                backgroundColor: "#007E85",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Post Comment
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostDialog;
