import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Cross2Icon, ImageIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import LabelIcon from "@mui/icons-material/Label";
import GifIcon from "@mui/icons-material/Gif";
import { useSelector } from "react-redux";

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "../ui/menubar";
import { socialService } from "../../services/socialService";
import { selectUserId } from "../../store/slices/authSlice";
import ImageViewer from "./ImageViewer";

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

const CreatePostDialog: React.FC<CreatePostDialogProps> = ({ isOpen, onClose, onPostCreated }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userId = useSelector(selectUserId);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = selectedImages.length + newFiles.length;

    if (totalImages > 4) {
      setError("You can only upload up to 4 images");
      return;
    }

    setError(null);
    setSelectedImages((prev) => [...prev, ...newFiles]);

    // Create previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handlePostSubmit = async () => {
    if (!userId) {
      setError("You must be logged in to post");
      return;
    }

    if (!postTitle.trim()) {
      setError("Post title cannot be empty");
      return;
    }

    if (!postContent.trim()) {
      setError("Post content cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the post
      const postPayload = {
        userId: userId,
        title: postTitle.trim(),
        content: postContent.trim(),
        visibility: "public",
        status: "published",
      };

      const createdPost = await socialService.createPost(postPayload);
      console.log("✅ Post created successfully:", createdPost);

      // Upload images if any
      if (selectedImages.length > 0) {
        console.log("📷 Uploading images:", selectedImages.length);
        console.log("📷 Post ID:", createdPost.id);
        console.log("📷 Image files:", selectedImages.map(f => ({ name: f.name, size: f.size, type: f.type })));
        try {
          const uploadResults = await socialService.uploadPostImages(createdPost.id, selectedImages);
          console.log("✅ Images uploaded successfully:", uploadResults);
        } catch (imgErr) {
          console.error("❌ Failed to upload images:", imgErr);
          console.error("❌ Error details:", {
            message: imgErr instanceof Error ? imgErr.message : 'Unknown error',
            stack: imgErr instanceof Error ? imgErr.stack : undefined,
            error: imgErr
          });
          // Don't fail the whole post creation if images fail
          setError("Post created but some images failed to upload. Please try again.");
        }
      }

      // Reset form
      setPostTitle("");
      setPostContent("");
      setSelectedTags([]);
      setSelectedImages([]);
      setImagePreviews([]);
      
      // Call callback to refresh posts
      if (onPostCreated) {
        onPostCreated();
      }
      
      onClose();
    } catch (err) {
      console.error("❌ Error creating post:", err);
      setError(err instanceof Error ? err.message : "Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up image previews when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedImages([]);
      setImagePreviews([]);
      setError(null);
      setPostTitle("");
      setPostContent("");
      setSelectedTags([]);
    }
  }, [isOpen]);

  // Get grid layout style for images (Fixed height previews)
  const getImageGridStyle = (count: number) => {
    if (count === 1) {
      return {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "4px",
        marginTop: "12px",
      };
    } else if (count === 2) {
      return {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "4px",
        marginTop: "12px",
      };
    } else if (count === 3) {
      return {
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gridTemplateRows: "150px 150px",
        gap: "4px",
        marginTop: "12px",
      };
    } else {
      return {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "150px 150px",
        gap: "4px",
        marginTop: "12px",
      };
    }
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
            background: "#D1F5D4",
            borderRadius: "16px",
            maxWidth: "500px",
            width: "100%",
            overflow: "auto",
            position: "relative",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            color: "#000000",
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
            <Cross2Icon width={16} height={16} color="#1a1a1a" />
          </button>

          {/* Header */}
          <div style={{ padding: "60px 24px 24px 24px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "25px",
                fontWeight: "600",
                color: "#1a1a1a",
              }}
            >
              What's you wanna share?
            </h2>
          </div>

          {/* Content */}
          <div style={{ padding: "0 24px 10px 24px" }}>
            {/* Title Input */}
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Post title..."
              maxLength={200}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #186620",
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: "600",
                fontFamily: "inherit",
                backgroundColor: "transparent",
                color: "#1a1a1a",
                boxSizing: "border-box",
                outline: "none",
                marginBottom: "12px",
              }}
            />

            {/* Content Text Area */}
            <textarea
              className="create-post-textarea"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind?"
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "16px",
                border: "1px solid #186620",
                borderRadius: "8px",
                fontSize: "16px",
                fontFamily: "inherit",
                backgroundColor: "transparent",
                color: "#1a1a1a",
                resize: "none",
                boxSizing: "border-box",
                outline: "none",
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE and Edge
              }}
            />

            {/* Image Previews Section */}
            {imagePreviews.length > 0 && (
              <div style={getImageGridStyle(imagePreviews.length)}>
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      gridColumn: imagePreviews.length === 3 && index === 0 ? "1 / 3" : "auto",
                      borderRadius: "8px",
                      overflow: "hidden",
                      height: "150px",
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => setViewingImageIndex(index)}
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "rgba(0, 0, 0, 0.7)",
                        border: "none",
                        borderRadius: "50%",
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "white",
                        fontSize: "18px",
                        fontWeight: "bold",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.9)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0, 0, 0, 0.7)";
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "8px 12px",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "6px",
                  color: "#dc2626",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            {/* Tags Section */}
            <div style={{ marginTop: imagePreviews.length > 0 ? "12px" : "0" }}>
              <Menubar
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  outline: "none",
                  boxShadow: "none",
                }}
              >
                <MenubarMenu>
                  <MenubarTrigger
                    style={{
                      background: "transparent",
                      border: "1px solid #186620",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      color: "#1a1a1a",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    <LabelIcon style={{ fontSize: "12px" }} />
                    Tag
                  </MenubarTrigger>
                  <MenubarContent
                    style={{
                      background: "#D1F5D4",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      minWidth: "200px",
                      zIndex: 1002,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      padding: "8px",
                    }}
                  >
                    {tagOptions.slice(0, 3).map((tag) => (
                      <MenubarItem
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        style={{
                          background: selectedTags.includes(tag) ? "#D1F5D4" : "transparent",
                          padding: "8px 12px",
                          color: "#1a1a1a",
                          fontSize: "14px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          borderRadius: "6px",
                          margin: "2px 0",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f0f0f0";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = selectedTags.includes(tag)
                            ? "#D1F5D4"
                            : "transparent";
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
                        border: "1px solid grey",
                        borderRadius: "16px",
                        padding: "6px 12px",
                        fontSize: "14px",
                        color: "#1a1a1a",
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
              borderTop: "1px solid grey",
              margin: "0 24px",
              paddingTop: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              style={{ display: "none" }}
            />

            {/* Media Options */}
            <div style={{ display: "flex" }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedImages.length >= 4}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "transparent",
                  border: "none",
                  color: selectedImages.length >= 4 ? "#999" : "#1a1a1a",
                  fontSize: "14px",
                  cursor: selectedImages.length >= 4 ? "not-allowed" : "pointer",
                  padding: "8px",
                  opacity: selectedImages.length >= 4 ? 0.5 : 1,
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
                  color: "#1a1a1a",
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
                  color: "#1a1a1a",
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
              disabled={!postTitle.trim() || !postContent.trim() || isSubmitting}
              style={{
                background: postTitle.trim() && postContent.trim() && !isSubmitting ? "#007E85" : "rgba(255, 255, 255, 0.3)",
                border: "none",
                borderRadius: "24px",
                padding: "8px 14px",
                color: postTitle.trim() && postContent.trim() && !isSubmitting ? "white" : "grey",
                fontSize: "16px",
                fontWeight: "600",
                cursor: postTitle.trim() && postContent.trim() && !isSubmitting ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                marginTop: "5px",
                marginBottom: "5px",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "POSTING..." : "POST"}
            </button>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal - Render in portal */}
      {viewingImageIndex !== null && imagePreviews.length > 0 && createPortal(
        <ImageViewer
          images={imagePreviews}
          initialIndex={viewingImageIndex}
          isOpen={viewingImageIndex !== null}
          onClose={() => setViewingImageIndex(null)}
        />,
        document.body
      )}
    </>
  );
};

export default CreatePostDialog;
