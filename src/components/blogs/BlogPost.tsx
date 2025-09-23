import React, { useState } from "react";
import {
  StarFilledIcon,
  StarIcon,
  ChatBubbleIcon,
  Share1Icon,
  HeartFilledIcon,
  HeartIcon,
} from "@radix-ui/react-icons";

interface BlogPostProps {
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
  onClick?: () => void;
}

const BlogPost: React.FC<BlogPostProps> = ({ user, timestamp, content, interactions, onClick }) => {
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);
  const [likesCount, setLikesCount] = useState(interactions.likes);
  const [retweetsCount, setRetweetsCount] = useState(interactions.retweets);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const handleRetweet = () => {
    setRetweeted(!retweeted);
    setRetweetsCount(retweeted ? retweetsCount - 1 : retweetsCount + 1);
  };

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

  return (
    <div
      onClick={onClick}
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
            {user.name}
          </h3>
          <div
            style={{
              display: "flex",
              gap: "2px",
              margin: 0,
            }}
          >
            {renderStars(user.rating)}
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
            {timestamp}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ marginBottom: "16px" }}>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#333",
            marginBottom: content.media && content.media.length > 0 ? "12px" : "0",
          }}
        >
          {content.text}
        </p>

        {content.media && content.media.length > 0 && (
          <div style={getMediaGridStyle(content.media.length)}>
            {content.media.map((mediaUrl, index) => (
              <img
                key={index}
                src={mediaUrl}
                alt={`Media ${index + 1}`}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  gridRow: content.media!.length > 2 && index === 0 ? "1 / 3" : "auto",
                }}
              />
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
            onClick={() => {}}
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
    </div>
  );
};

export default BlogPost;
