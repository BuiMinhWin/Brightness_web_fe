import React from "react";
import { StarFilledIcon, StarIcon, EyeOpenIcon } from "@radix-ui/react-icons";

interface VideoCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  views: number;
  rating: number;
  duration: string;
  category: string;
  onClick?: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
  title,
  description,
  thumbnail,
  views,
  rating,
  duration,
  category,
  onClick,
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} style={{ color: index < Math.floor(rating) ? "#FFD700" : "#E5E5E5" }}>
        {index < Math.floor(rating) ? (
          <StarFilledIcon width={14} height={14} />
        ) : (
          <StarIcon width={14} height={14} />
        )}
      </span>
    ));
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        width: "100%",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.15)";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
        }
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", width: "100%", height: "200px" }}>
        <img
          src={thumbnail}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Duration badge */}
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "500",
          }}
        >
          {duration}
        </div>
        {/* Category badge */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            backgroundColor: "#05644C",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "10px",
            fontWeight: "500",
            textTransform: "uppercase",
          }}
        >
          {category}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px" }}>
        {/* Title */}
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: "16px",
            fontWeight: "600",
            color: "#1a1a1a",
            lineHeight: "1.3",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          style={{
            margin: "0 0 12px 0",
            fontSize: "14px",
            color: "#666",
            lineHeight: "1.4",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </p>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            color: "#666",
          }}
        >
          {/* Views */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <EyeOpenIcon width={14} height={14} />
            <span>{formatViews(views)} views</span>
          </div>

          {/* Rating */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", gap: "1px" }}>{renderStars(rating)}</div>
            <span>{rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
