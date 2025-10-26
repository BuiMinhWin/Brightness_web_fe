import React, { useState } from "react";
import { FileTextIcon } from "@radix-ui/react-icons";
import CreatePostDialog from "./CreatePostDialog";

interface FABProps {
  onPostCreated?: () => void;
}

const FAB: React.FC<FABProps> = ({ onPostCreated }) => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const handleFABClick = () => {
    setIsCreatePostOpen(true);
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
      {/* Create Post FAB */}
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "#2EA98D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 6px 16px rgba(0, 126, 133, 0.4)",
          transition: "all 0.3s ease",
        }}
        onClick={handleFABClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <FileTextIcon width={28} height={28} color="white" />
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
