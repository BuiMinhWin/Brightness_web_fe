import React, { useState } from "react";
import { PlusIcon, FileTextIcon, ImageIcon } from "@radix-ui/react-icons";
import CreatePostDialog from "./CreatePostDialog";

interface FABProps {
  onPostCreated?: () => void;
}

const FAB: React.FC<FABProps> = ({ onPostCreated }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handlePostHover = () => {
    setHoveredOption("post");
  };

  const handlePictureHover = () => {
    setHoveredOption("picture");
  };

  const handleMouseLeave = () => {
    setHoveredOption(null);
  };

  const handlePostClick = () => {
    setIsExpanded(false);
    setIsCreatePostOpen(true);
  };

  const handlePictureClick = () => {
    console.log("Picture clicked");
    setIsExpanded(false);
    // Add your picture functionality here
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 1000,
      }}
    >
      {/* Post Option */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          right: "0",
          opacity: isExpanded ? 1 : 0,
          transform: isExpanded ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.3s ease",
          pointerEvents: isExpanded ? "auto" : "none",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
        onClick={handlePostClick}
        onMouseEnter={handlePostHover}
        onMouseLeave={handleMouseLeave}
      >
        <span
          style={{
            backgroundColor: "white",
            color: "#333",
            padding: "8px 12px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            whiteSpace: "nowrap",
            opacity: hoveredOption === "post" ? 1 : 0,
            transform: hoveredOption === "post" ? "translateX(0)" : "translateX(20px)",
            transition: "all 0.3s ease",
          }}
        >
          Post
        </span>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#2EA98D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0, 126, 133, 0.3)",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <FileTextIcon width={24} height={24} color="white" />
        </div>
      </div>

      {/* Picture Option */}
      <div
        style={{
          position: "absolute",
          bottom: "160px",
          right: "0",
          opacity: isExpanded ? 1 : 0,
          transform: isExpanded ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.3s ease 0.1s",
          pointerEvents: isExpanded ? "auto" : "none",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
        onClick={handlePictureClick}
        onMouseEnter={handlePictureHover}
        onMouseLeave={handleMouseLeave}
      >
        <span
          style={{
            backgroundColor: "white",
            color: "#333",
            padding: "8px 12px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            whiteSpace: "nowrap",
            opacity: hoveredOption === "picture" ? 1 : 0,
            transform: hoveredOption === "picture" ? "translateX(0)" : "translateX(20px)",
            transition: "all 0.3s ease 0.1s",
          }}
        >
          Picture
        </span>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#2EA98D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(91, 193, 127, 0.3)",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <ImageIcon width={24} height={24} color="white" />
        </div>
      </div>

      {/* Main FAB */}
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: isExpanded ? "#e28743" : "#2EA98D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 6px 16px rgba(0, 126, 133, 0.4)",
          transition: "all 0.3s ease",
          transform: isExpanded ? "rotate(45deg)" : "rotate(0deg)",
        }}
        onClick={handleToggle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = isExpanded
            ? "rotate(45deg) scale(1.1)"
            : "rotate(0deg) scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isExpanded
            ? "rotate(45deg) scale(1)"
            : "rotate(0deg) scale(1)";
        }}
      >
        <PlusIcon width={28} height={28} color="white" />
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog 
        isOpen={isCreatePostOpen} 
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={onPostCreated}
      />
    </div>
  );
};

export default FAB;
