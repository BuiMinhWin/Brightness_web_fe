import React, { useState, useEffect } from "react";
import { authService } from "../../services";
import { socialService } from "../../services/socialService";
import { UserModel, UpdateUserRequest } from "../../models";
import type { Post } from "../../models/social";
import { useAppSelector } from "../../store/hooks";
import { resolveApiAssetUrl } from "@/utils/media";
import { useToast } from "../../hooks/useToast";
import "./Profile.css";

const Profile: React.FC = () => {
  const { showToast } = useToast();
  const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
  const [profileData, setProfileData] = useState<UserModel | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<UpdateUserRequest>({});
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  
  // Posts state
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [activePostMenu, setActivePostMenu] = useState<string | null>(null);

  // Lấy thông tin user từ Redux store
  const { userInfo, userId } = useAppSelector((state) => state.auth);
  const currentUserId = userId || "";
  const resolvedProfileAvatar = resolveApiAssetUrl(
    profileData?.profilePicture ?? userInfo?.profilePicture ?? null
  );
  const displayAvatar = avatarPreview || resolvedProfileAvatar;
  const fallbackUser = profileData || userInfo;
  const avatarFallback = fallbackUser?.fullName || fallbackUser?.userName || "B";
  const avatarInitial = avatarFallback.charAt(0).toUpperCase();

  useEffect(() => {
    if (currentUserId) {
      loadUserInfo();
      loadUserPosts();
    }
  }, [currentUserId]);

  const loadUserInfo = async () => {
    if (!currentUserId) return;

    try {
      setIsLoading(true);
      const userData = await authService.getUser(currentUserId);
      setProfileData(userData);
    } catch (error) {
      console.error("Error loading user info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPosts = async () => {
    if (!currentUserId) return;

    try {
      setLoadingPosts(true);
      const allPosts = await socialService.getPosts();
      
      // Filter posts by current user
      const userPostsFiltered = allPosts.filter(post => post.userId === currentUserId);
      
      // Fetch images for each post
      const postsWithImages = await Promise.all(
        userPostsFiltered.map(async (post) => {
          try {
            const imagesMeta = await socialService.getPostImages(post.id);
            
            const imagesWithData = await Promise.all(
              imagesMeta.map(async (imgMeta) => {
                try {
                  const imgDetail = await socialService.getPostImageById(imgMeta.id);
                  return {
                    ...imgMeta,
                    imageUrl: imgDetail?.imageData 
                      ? `data:${imgMeta.contentType || 'image/jpeg'};base64,${imgDetail.imageData}`
                      : null
                  };
                } catch (err) {
                  console.error(`Failed to load image ${imgMeta.id}:`, err);
                  return { ...imgMeta, imageUrl: null };
                }
              })
            );
            
            return { ...post, images: imagesMeta, imagesWithData };
          } catch (err) {
            console.error(`Failed to fetch images for post ${post.id}:`, err);
            return { ...post, images: [], imagesWithData: [] };
          }
        })
      );
      
      // Sort by newest first
      const sortedPosts = postsWithImages.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setUserPosts(sortedPosts);
    } catch (error) {
      console.error("Error loading user posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await socialService.deletePost(postId);
      // Remove the deleted post from state
      setUserPosts(prev => prev.filter(post => post.id !== postId));
      setActivePostMenu(null);
      showToast({ message: "Post deleted successfully!", severity: "success" });
    } catch (error) {
      console.error("Error deleting post:", error);
      showToast({ message: "Failed to delete post. Please try again.", severity: "error" });
    }
  };

  const handleEditClick = () => {
    const currentUser = profileData || userInfo;
    if (currentUser) {
      setEditFormData({
        email: currentUser.email,
        userName: currentUser.userName,
        fullName: currentUser.fullName || "",
        phoneNumber: currentUser.phoneNumber || "",
        gender: currentUser.gender || "",
        dateOfBirth: currentUser.dateOfBirth || "",
        profilePicture: currentUser.profilePicture || "",
      });
      const existingAvatar = resolveApiAssetUrl(currentUser.profilePicture);
      setAvatarPreview(existingAvatar || null);
      setAvatarError(null);
      setIsEditModalOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file (JPG, PNG, or WEBP).");
      event.target.value = "";
      return;
    }

    if (file.size > AVATAR_MAX_SIZE_BYTES) {
      setAvatarError("Avatar must be smaller than 2MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        const base64Image = reader.result;
        setAvatarPreview(base64Image);
        setEditFormData((prev) => ({
          ...prev,
          profilePicture: base64Image,
        }));
        setAvatarError(null);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    try {
      setIsLoading(true);
      await authService.updateUser(currentUserId, editFormData);
      await loadUserInfo();
      setIsEditModalOpen(false);
      setEditFormData({});
      setAvatarPreview(null);
      setAvatarError(null);
      showToast({ message: "Profile updated successfully!", severity: "success" });
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast({ message: "Error updating profile. Please try again.", severity: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditFormData({});
    setAvatarPreview(null);
    setAvatarError(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes}, ${day}/${month}/${year}`;
  };

  return (
    <div className="pf-page">
      <div className="pf-wrap">
        {/* Left profile column */}
        <section>
          <div className="pf-title">Profile</div>

          <div className="pf-card pf-header">
            <div className="pf-avatar">
              {displayAvatar ? (
                <img src={displayAvatar} alt="Ảnh đại diện" />
              ) : (
                <span className="pf-avatar-placeholder">{avatarInitial}</span>
              )}
            </div>
            <div>
              <div className="pf-name">
                {(profileData || userInfo)?.fullName ||
                  (profileData || userInfo)?.userName ||
                  "Name"}
              </div>
              <div className="pf-class">{(profileData || userInfo)?.email || "Class"}</div>
            </div>
            <button className="pf-edit" onClick={handleEditClick}>
              Edit
            </button>
          </div>

          <div className="pf-stats">
            <div className="pf-stat-box">
              <div>
                <div className="pf-stat-num">{userPosts.length}</div>
                <div className="pf-stat-label">Post</div>
              </div>
              <div>
                <div className="pf-stat-num">
                  {userPosts.reduce((sum, post) => sum + post.reactionCount, 0)}
                </div>
                <div className="pf-stat-label">Like</div>
              </div>
            </div>

            <div className="pf-metrics">
              <div className="pf-chip">
                <div className="pf-chip-ico">⚡</div>
                <div>
                  <div className="pf-chip-title">55</div>
                  <div className="pf-chip-sub">Active day</div>
                </div>
              </div>
              <div className="pf-chip">
                <div className="pf-chip-ico">📊</div>
                <div>
                  <div className="pf-chip-title">#2</div>
                  <div className="pf-chip-sub">Leaderboard</div>
                </div>
              </div>
              <div className="pf-chip">
                <div className="pf-chip-ico">✅</div>
                <div>
                  <div className="pf-chip-title">95%</div>
                  <div className="pf-chip-sub">Reach target</div>
                </div>
              </div>
              <div className="pf-chip">
                <div className="pf-chip-ico">🏆</div>
                <div>
                  <div className="pf-chip-title">3/4</div>
                  <div className="pf-chip-sub">Challenge done</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right column Recent posts */}
        <aside className="pf-post" style={{
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
          scrollbarWidth: "none", /* Firefox */
          msOverflowStyle: "none", /* IE and Edge */
        }}>
          <style>
            {`
              .pf-post::-webkit-scrollbar {
                display: none; /* Chrome, Safari, Opera */
              }
            `}
          </style>
          <div className="pf-post-head">
            <div className="pf-post-title">Recent posts</div>
          </div>
          
          {loadingPosts ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              Loading posts...
            </div>
          ) : userPosts.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              No posts yet
            </div>
          ) : (
            userPosts.map((post) => {
              const imageUrls = post.imagesWithData
                ?.filter(img => img.imageUrl !== null)
                .map(img => img.imageUrl!) || [];

              return (
                <div key={post.id} style={{ marginBottom: "20px" }}>
                  <div className="pf-post-head" style={{ position: "relative" }}>
                    <div className="pf-post-date">{formatDate(post.createdAt)}</div>
                    
                    {/* Three-dot menu button */}
                    <button
                      onClick={() => setActivePostMenu(activePostMenu === post.id ? null : post.id)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        fontSize: "20px",
                        cursor: "pointer",
                        padding: "5px 10px",
                        color: "#666",
                      }}
                    >
                      ⋮
                    </button>
                    
                    {/* Dropdown menu */}
                    {activePostMenu === post.id && (
                      <div
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "35px",
                          background: "white",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          zIndex: 1000,
                          minWidth: "120px",
                        }}
                      >
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          style={{
                            width: "100%",
                            padding: "10px 15px",
                            border: "none",
                            background: "none",
                            textAlign: "left",
                            cursor: "pointer",
                            color: "#dc3545",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#f8f9fa"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {post.title && post.title !== post.content && (
                    <div style={{ fontWeight: "600", marginBottom: "8px", fontSize: "16px" }}>
                      {post.title}
                    </div>
                  )}
                  
                  <div className="pf-post-body">
                    {post.content}
                  </div>
                  
                  {imageUrls.length > 0 && (
                    <div className="pf-grid">
                      {imageUrls.slice(0, 4).map((url, index) => (
                        <div key={index} className="pf-ph">
                          <img 
                            src={url} 
                            alt={`Post image ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="pf-post-actions" style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                    fontSize: "14px",
                    color: "#666",
                  }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                      {post.commentCount || 0}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10" />
                        <polyline points="1 20 1 14 7 14" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                      </svg>
                      0
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {post.reactionCount}
                    </span>
                  </div>
                  <div className="pf-hr" />
                </div>
              );
            })
          )}
        </aside>
      </div>

      {/* Click outside to close menu */}
      {activePostMenu && (
        <div
          onClick={() => setActivePostMenu(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
        />
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                X
              </button>
            </div>

            <form onSubmit={handleSubmit} className="edit-form">
              <div className="avatar-section">
                <div className="avatar-preview">
                  {avatarPreview || displayAvatar ? (
                    <img src={avatarPreview || displayAvatar} alt="Avatar preview" />
                  ) : (
                    <span className="pf-avatar-placeholder avatar-preview-initial">
                      {avatarInitial}
                    </span>
                  )}
                </div>
                <label className="avatar-upload-btn">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} />
                  Choose Image
                </label>
                <p className="avatar-hint">Supports JPG, PNG, WEBP. Maximum size 2MB.</p>
                {avatarError && <p className="avatar-error">{avatarError}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={editFormData.fullName || ""}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="userName">Username</label>
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  value={editFormData.userName || ""}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={editFormData.email || ""}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={editFormData.phoneNumber || ""}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={editFormData.gender || ""}
                    onChange={handleInputChange}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={editFormData.dateOfBirth ? editFormData.dateOfBirth.split("T")[0] : ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCloseModal} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="btn-save">
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;