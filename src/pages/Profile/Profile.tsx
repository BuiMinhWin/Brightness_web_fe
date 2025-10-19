import React, { useState, useEffect } from "react";
import { authService } from "../../services";
import { UserModel, UpdateUserRequest } from "../../models";
import { useAppSelector } from "../../store/hooks";
import { resolveApiAssetUrl } from "@/utils/media";
import "./Profile.css";

const Profile: React.FC = () => {
  const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
  const [profileData, setProfileData] = useState<UserModel | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<UpdateUserRequest>({});
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

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

  const handleEditClick = () => {
    // Sử dụng profileData hoặc userInfo từ Redux store
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
      await loadUserInfo(); // Reload user info
      setIsEditModalOpen(false);
      setEditFormData({});
      setAvatarPreview(null);
      setAvatarError(null);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
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
                <div className="pf-stat-num">15</div>
                <div className="pf-stat-label">Post</div>
              </div>
              <div>
                <div className="pf-stat-num">567</div>
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

        {/* Right column Recent post */}
        <aside className="pf-post">
          <div className="pf-post-head">
            <div className="pf-post-title">Recent post</div>
            <div className="pf-post-date">hh:mm, dd/mm/yyyy</div>
          </div>
          <div className="pf-post-body">
            Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalaracc lacus vel
            facilisis volutpat est velitolm. Lorem ipsum dolor sit amet consecte tur adipiscing elit
            semper dalaracc lacus vel facilisis volutpat est velitolm. Lorem ipsum dolor sit amet
            consecte tur adipiscing elit semper dalaracc lacus vel facilisis volutpat est velitolm.
          </div>
          <div className="pf-grid">
            <div className="pf-ph" />
            <div className="pf-ph" />
            <div className="pf-ph" />
            <div className="pf-ph" />
          </div>
          <div className="pf-post-actions">💬 28 🔁 15 🤍 31</div>
          <div className="pf-hr" />
        </aside>
      </div>

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
