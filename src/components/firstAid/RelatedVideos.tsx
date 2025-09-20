import React from "react";
import { StarFilledIcon, StarIcon, EyeOpenIcon } from "@radix-ui/react-icons";

interface RelatedVideo {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  views: number;
  rating: number;
  duration: string;
  category: string;
}

interface RelatedVideosProps {
  videos: RelatedVideo[];
  onVideoClick: (videoId: number) => void;
}

const RelatedVideos: React.FC<RelatedVideosProps> = ({ videos, onVideoClick }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} style={{ color: index < Math.floor(rating) ? "#FFD700" : "#E5E5E5" }}>
        {index < Math.floor(rating) ? (
          <StarFilledIcon width={12} height={12} />
        ) : (
          <StarIcon width={12} height={12} />
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
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        height: "fit-content",
      }}
    >
      <h2
        style={{
          margin: "0 0 20px 0",
          fontSize: "20px",
          fontWeight: "600",
          color: "#1a1a1a",
        }}
      >
        Related Videos
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => onVideoClick(video.id)}
            style={{
              display: "flex",
              gap: "12px",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {/* Thumbnail */}
            <div
              style={{
                position: "relative",
                width: "120px",
                height: "68px",
                flexShrink: 0,
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
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
                  bottom: "4px",
                  right: "4px",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  padding: "2px 6px",
                  borderRadius: "3px",
                  fontSize: "10px",
                  fontWeight: "500",
                }}
              >
                {video.duration}
              </div>
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              {/* Title */}
              <h3
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                  lineHeight: "1.3",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {video.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "12px",
                  color: "#666",
                  lineHeight: "1.4",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {video.description}
              </p>

              {/* Stats */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "11px",
                  color: "#666",
                }}
              >
                {/* Views */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  <EyeOpenIcon width={10} height={10} />
                  <span>{formatViews(video.views)}</span>
                </div>

                {/* Rating */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  <div style={{ display: "flex", gap: "1px" }}>{renderStars(video.rating)}</div>
                  <span>{video.rating}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedVideos;
