import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ChatBubbleIcon,
  Share1Icon,
  HeartFilledIcon,
  HeartIcon,
} from "@radix-ui/react-icons";
import { useSelector } from "react-redux";
import { selectUserId } from "../../store/slices/authSlice";
import { socialService } from "../../services/socialService";
import ImageViewer from "./ImageViewer";

interface BlogPostProps {
  user: {
    name: string;
    avatar: string;
  };
  timestamp: string;
  content: {
    text: string;
    title?: string;
    media?: string[];
  };
  interactions: {
    comments: number;
    retweets: number;
    likes: number;
  };
  postId?: string;
  initialLiked?: boolean;
  onClick?: () => void;
  onLikeChange?: (postId: string, isLiked: boolean, newCount: number) => void;
}

const BlogPost: React.FC<BlogPostProps> = ({ user, timestamp, content, interactions, postId, initialLiked = false, onClick, onLikeChange }) => {
  const userId = useSelector(selectUserId);
  const [liked, setLiked] = useState(initialLiked);
  const [retweeted, setRetweeted] = useState(false);
  const [likesCount, setLikesCount] = useState(interactions.likes || 0);
  const [retweetsCount, setRetweetsCount] = useState(interactions.retweets);
  const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null);
  const imageClickedRef = useRef(false);

  // Update liked state when initialLiked prop changes
  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  // Update likes count when interactions.likes prop changes
  useEffect(() => {
    setLikesCount(interactions.likes || 0);
  }, [interactions.likes]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't open post dialog when liking
    
    if (!postId || !userId) {
      console.warn("Cannot like: missing postId or userId");
      return;
    }

    try {
      const newLikedState = !liked;
      const newLikesCount = Math.max(0, liked ? likesCount - 1 : likesCount + 1);

      if (liked) {
        // Unlike the post
        await socialService.cancelPostVote(postId);
        setLiked(false);
        setLikesCount(newLikesCount);
      } else {
        // Like the post
        await socialService.votePost(postId, "reaction");
        setLiked(true);
        setLikesCount(newLikesCount);
      }

      // Notify parent to sync state
      if (onLikeChange) {
        onLikeChange(postId, newLikedState, newLikesCount);
      }
    } catch (err) {
      console.error("Failed to toggle post like:", err);
      // Revert on error
      setLiked(!liked);
    }
  };

  const handleRetweet = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't open post dialog when retweeting
    setRetweeted(!retweeted);
    setRetweetsCount(retweeted ? retweetsCount - 1 : retweetsCount + 1);
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

  const handlePostClick = (e: React.MouseEvent) => {
    // Don't open post dialog if an image was just clicked
    if (imageClickedRef.current) {
      imageClickedRef.current = false;
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  const handleImageClick = (index: number) => {
    imageClickedRef.current = true;
    setViewingImageIndex(index);
    // Reset the flag after a short delay
    setTimeout(() => {
      imageClickedRef.current = false;
    }, 100);
  };

  return (
    <div
      onClick={handlePostClick}
      style={{
        padding: "20px",
        margin: "16px 0",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s ease",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: "12px",
        border: "1px solid rgba(44, 124, 74, 0.2)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <img
          src={user.avatar}
          alt={user.name}
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
            gap: "4px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "600",
              color: "#1a1a1a",
              lineHeight: "1",
            }}
          >
            {user.name}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#666",
              fontWeight: "400",
              lineHeight: "1",
            }}
          >
            {timestamp}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ marginBottom: "16px" }}>
        {content.title && (
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "16px",
              fontWeight: "700",
              lineHeight: "1.3",
              color: "#1a1a1a",
            }}
          >
            {content.title}
          </h3>
        )}
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#333",
            marginBottom: content.media && content.media.length > 0 ? "12px" : "0",
            whiteSpace: "pre-wrap",
          }}
        >
          {content.text}
        </p>

        {content.media && content.media.length > 0 && (
          <div 
            data-image-container
            style={{
              display: "grid",
              gridTemplateColumns: content.media.length === 1 ? "1fr" : content.media.length === 2 ? "1fr 1fr" : "repeat(2, 1fr)",
              gap: "8px",
              marginTop: "12px",
            }}
          >
            {content.media.map((mediaUrl, index) => (
              <div
                key={index}
                data-image-container
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleImageClick(index);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  maxHeight: content.media!.length === 1 ? "400px" : "250px",
                  overflow: "hidden",
                  borderRadius: "8px",
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gridColumn: content.media!.length === 3 && index === 0 ? "1 / 3" : "auto",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <img
                  src={mediaUrl}
                  alt={`Media ${index + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: content.media!.length === 1 ? "400px" : "250px",
                    objectFit: "contain",
                    display: "block",
                    pointerEvents: "none",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          paddingTop: "12px",
          marginTop: "16px",
          borderTop: "1px solid rgba(44, 124, 74, 0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation(); // Don't open post dialog
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              padding: "6px 8px",
              borderRadius: "16px",
              cursor: "pointer",
              fontSize: "14px",
              color: "#666",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(29, 161, 242, 0.1)";
              e.currentTarget.style.color = "#1da1f2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#666";
            }}
          >
            <ChatBubbleIcon width={16} height={16} />
            {interactions.comments}
          </button>

          <button
            onClick={handleRetweet}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              padding: "6px 8px",
              borderRadius: "16px",
              cursor: "pointer",
              fontSize: "14px",
              color: retweeted ? "#10b981" : "#666",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!retweeted) {
                e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
                e.currentTarget.style.color = "#10b981";
              }
            }}
            onMouseLeave={(e) => {
              if (!retweeted) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#666";
              }
            }}
          >
            <Share1Icon width={16} height={16} />
            {retweetsCount}
          </button>

          <button
            onClick={handleLike}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              padding: "6px 8px",
              borderRadius: "16px",
              cursor: "pointer",
              fontSize: "14px",
              color: liked ? "#ef4444" : "#666",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!liked) {
                e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                e.currentTarget.style.color = "#ef4444";
              }
            }}
            onMouseLeave={(e) => {
              if (!liked) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#666";
              }
            }}
          >
            {liked ? (
              <HeartFilledIcon width={16} height={16} />
            ) : (
              <HeartIcon width={16} height={16} />
            )}
            {likesCount}
          </button>
        </div>
      </div>

      {/* Image Viewer Modal - Render in portal to escape BlogPost container */}
      {viewingImageIndex !== null && content.media && createPortal(
        <ImageViewer
          images={content.media}
          initialIndex={viewingImageIndex}
          isOpen={viewingImageIndex !== null}
          onClose={() => setViewingImageIndex(null)}
        />,
        document.body
      )}
    </div>
  );
};

export default BlogPost;
