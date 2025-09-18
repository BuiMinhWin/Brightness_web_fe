import React from "react";
import { StarFilledIcon, StarIcon, EyeOpenIcon, CalendarIcon } from "@radix-ui/react-icons";

interface VideoDetailsProps {
  title: string;
  description: string;
  detailedDescription: string;
  views: number;
  rating: number;
  uploadDate: string;
  instructor: string;
  instructorTitle: string;
  tags: string[];
}

const VideoDetails: React.FC<VideoDetailsProps> = ({
  title,
  description,
  detailedDescription,
  views,
  rating,
  uploadDate,
  instructor,
  instructorTitle,
  tags,
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} style={{ color: index < Math.floor(rating) ? "#FFD700" : "#E5E5E5" }}>
        {index < Math.floor(rating) ? (
          <StarFilledIcon width={16} height={16} />
        ) : (
          <StarIcon width={16} height={16} />
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Title */}
      <h1
        style={{
          margin: "0 0 16px 0",
          fontSize: "24px",
          fontWeight: "700",
          color: "#1a1a1a",
          lineHeight: "1.3",
        }}
      >
        {title}
      </h1>

      {/* Stats Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Views */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            color: "#666",
          }}
        >
          <EyeOpenIcon width={16} height={16} />
          <span>{formatViews(views)} views</span>
        </div>

        {/* Rating */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            color: "#666",
          }}
        >
          <div style={{ display: "flex", gap: "2px" }}>{renderStars(rating)}</div>
          <span>{rating}</span>
        </div>

        {/* Upload Date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            color: "#666",
          }}
        >
          <CalendarIcon width={16} height={16} />
          <span>{formatDate(uploadDate)}</span>
        </div>
      </div>

      {/* Instructor Info */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: "16px",
            fontWeight: "600",
            color: "#1a1a1a",
          }}
        >
          Instructor
        </h3>
        <p
          style={{
            margin: "0 0 4px 0",
            fontSize: "14px",
            fontWeight: "500",
            color: "#05644C",
          }}
        >
          {instructor}
        </p>
        <p
          style={{
            margin: "0",
            fontSize: "14px",
            color: "#666",
          }}
        >
          {instructorTitle}
        </p>
      </div>

      {/* Description */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            margin: "0 0 12px 0",
            fontSize: "18px",
            fontWeight: "600",
            color: "#1a1a1a",
          }}
        >
          Description
        </h3>
        <p
          style={{
            margin: "0 0 12px 0",
            fontSize: "16px",
            color: "#333",
            lineHeight: "1.6",
          }}
        >
          {description}
        </p>
        <p
          style={{
            margin: "0",
            fontSize: "16px",
            color: "#333",
            lineHeight: "1.6",
          }}
        >
          {detailedDescription}
        </p>
      </div>

      {/* Tags */}
      <div>
        <h3
          style={{
            margin: "0 0 12px 0",
            fontSize: "16px",
            fontWeight: "600",
            color: "#1a1a1a",
          }}
        >
          Tags
        </h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {tags.map((tag, index) => (
            <span
              key={index}
              style={{
                backgroundColor: "#05644C",
                color: "white",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoDetails;
