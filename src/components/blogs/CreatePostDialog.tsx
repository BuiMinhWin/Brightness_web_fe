import React, { useState, useEffect } from "react";
import { Cross2Icon, ImageIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import LabelIcon from "@mui/icons-material/Label";
import GifIcon from "@mui/icons-material/Gif";

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "../ui/menubar";

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostDialog: React.FC<CreatePostDialogProps> = ({ isOpen, onClose }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [postText, setPostText] = useState("");

  const tagOptions = [
    "Health",
    "Exercise",
    "Advice",
    "Nutrition",
    "Motivation",
    "Workout",
    "Wellness",
    "Lifestyle",
    "Fitness",
    "Mindfulness",
  ];

  // Disable body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePostSubmit = () => {
    console.log("Posting:", { text: postText, tags: selectedTags });
    setPostText("");
    setSelectedTags([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          .create-post-dialog::-webkit-scrollbar {
            display: none;
          }
          .create-post-textarea::-webkit-scrollbar {
            display: none;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
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
          alignItems: "flex-start",
          justifyContent: "center",
          zIndex: 1000,
          padding: "60px 20px 20px 20px",
        }}
      >
        <div
          className="create-post-dialog"
          style={{
            background: "linear-gradient(0deg, #5BC17F 0%, #007E85 100%)",
            borderRadius: "16px",
            maxWidth: "500px",
            width: "100%",
            overflow: "auto",
            position: "relative",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            color: "white",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 1001,
              backdropFilter: "blur(10px)",
            }}
          >
            <Cross2Icon width={16} height={16} color="white" />
          </button>

          {/* Header */}
          <div style={{ padding: "60px 24px 24px 24px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "600",
                color: "white",
              }}
            >
              What's you wanna share?
            </h2>
          </div>

          {/* Content */}
          <div style={{ padding: "0 24px 10px 24px" }}>
            {/* Text Area */}
            <textarea
              className="create-post-textarea"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder=""
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "16px",
                border: "1px solid #186620",
                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "8px",
                fontSize: "16px",
                fontFamily: "inherit",
                backgroundColor: "transparent",
                color: "white",
                resize: "none",
                boxSizing: "border-box",
                outline: "none",
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE and Edge
              }}
            />

            {/* Tags Section */}
            <div>
              <Menubar style={{ background: "transparent", border: "none", padding: 0 }}>
                <MenubarMenu>
                  <MenubarTrigger
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      color: "white",
                      backdropFilter: "blur(10px)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.2s ease",
                      fontSize: "12px",
                    }}
                  >
                    <LabelIcon style={{ fontSize: "12px" }} />
                    Tag
                  </MenubarTrigger>
                  <MenubarContent
                    style={{
                      background: "linear-gradient(0deg, #5BC17F 0%, #007E85 100%)",
                      minWidth: "180px",
                      zIndex: 1002,
                    }}
                  >
                    {tagOptions.slice(0, 3).map((tag) => (
                      <MenubarItem
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        style={{
                          background: selectedTags.includes(tag)
                            ? "rgba(255, 255, 255, 0.3)"
                            : "rgba(255, 255, 255, 0.1)",
                          padding: "8px 12px",
                          color: "white",
                          fontSize: "14px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          textAlign: "center",
                          width: "100%",
                          margin: "2px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = selectedTags.includes(tag)
                            ? "rgba(255, 255, 255, 0.3)"
                            : "rgba(255, 255, 255, 0.1)";
                        }}
                      >
                        {tag}
                      </MenubarItem>
                    ))}
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>

              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "12px",
                  }}
                >
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: "rgba(255, 255, 255, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.4)",
                        borderRadius: "16px",
                        padding: "6px 12px",
                        fontSize: "14px",
                        color: "white",
                        cursor: "pointer",
                      }}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag} ×
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: "1px solid #ffff",
              margin: "0 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Media Options */}
            <div style={{ display: "flex" }}>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "transparent",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  cursor: "pointer",
                  padding: "8px",
                }}
              >
                <ImageIcon width={18} height={18} />
              </button>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "transparent",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  cursor: "pointer",
                  padding: "8px",
                }}
              >
                <GifIcon style={{ fontSize: "18px" }} />
              </button>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "transparent",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  cursor: "pointer",
                  padding: "8px",
                }}
              >
                <MixerHorizontalIcon style={{ fontSize: "18px" }} />
              </button>
            </div>

            {/* Post Button */}
            <button
              onClick={handlePostSubmit}
              disabled={!postText.trim()}
              style={{
                background: postText.trim() ? "white" : "rgba(255, 255, 255, 0.3)",
                border: "none",
                borderRadius: "24px",
                padding: "4px 10px",
                color: postText.trim() ? "#FF7B17" : "rgba(255, 255, 255, 0.6)",
                fontSize: "16px",
                fontWeight: "600",
                cursor: postText.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                marginTop: "5px",
                marginBottom: "5px",
              }}
            >
              POST
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePostDialog;
