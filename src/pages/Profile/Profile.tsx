import React, { useState, useEffect } from "react";
import { authService } from "../../services";
import { socialService } from "../../services/socialService";
import { personalCoachService } from "../../services/personalCoachService";
import { challengeService } from "../../services/challengeService";
import { UserModel, UpdateUserRequest, UserProfileResponse, CreateUserHealthProfileRequest, UserChallengeStats } from "../../models";
import type { Post } from "../../models/social";
import { useAppSelector } from "../../store/hooks";
import { resolveApiAssetUrl } from "@/utils/media";
import { useToast } from "../../hooks/useToast";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Tooltip from "@mui/material/Tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { ChatBubbleIcon, HeartIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
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

  // Health Profile state
  const [healthProfile, setHealthProfile] = useState<UserProfileResponse | null>(null);
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [healthFormData, setHealthFormData] = useState<CreateUserHealthProfileRequest>({
    userId: "",
    heightCm: 0,
    currentWeightKg: 0,
    targetWeightKg: 0,
    fitnessLevel: "beginner",
    fitnessGoal: "",
    availableDays: [],
    preferredWorkoutTime: "morning",
    workoutDurationMinutes: 45,
    equipmentAvailable: [],
    gymAccess: false,
    homeWorkoutOnly: false,
    dietaryRestrictions: [],
    dislikedExercises: [],
    favoriteExercises: [],
    medicalConditions: "",
  });

  // Challenge stats state
  const [challengeStats, setChallengeStats] = useState<UserChallengeStats>({
    totalParticipated: 0,
    totalCompleted: 0,
    totalInProgress: 0,
    activeDays: 0,
    currentStreak: 0,
    longestStreak: 0,
  });

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
      loadHealthProfile();
      loadChallengeStats();
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

  const loadHealthProfile = async () => {
    if (!currentUserId) return;

    try {
      const profile = await personalCoachService.getUserProfile(currentUserId) as UserProfileResponse;
      setHealthProfile(profile);
    } catch (error) {
      console.error("Error loading health profile:", error);
      // Profile might not exist yet, which is okay
    }
  };

  const loadChallengeStats = async () => {
    if (!currentUserId) return;

    try {
      const stats = await challengeService.getUserChallengeStats(currentUserId);
      setChallengeStats(stats);
    } catch (error) {
      console.error("Error loading challenge stats:", error);
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

  // Health Profile handlers
  const handleEditHealthProfile = () => {
    if (healthProfile) {
      setHealthFormData({
        userId: currentUserId,
        heightCm: healthProfile.heightCm || 0,
        currentWeightKg: healthProfile.currentWeightKg || 0,
        targetWeightKg: healthProfile.targetWeightKg || 0,
        fitnessLevel: healthProfile.fitnessLevel || "beginner",
        fitnessGoal: healthProfile.fitnessGoal || "",
        availableDays: healthProfile.availableDays || [],
        preferredWorkoutTime: healthProfile.preferredWorkoutTime || "morning",
        workoutDurationMinutes: Math.min(Math.max(healthProfile.workoutDurationMinutes || 45, 15), 180),
        equipmentAvailable: healthProfile.equipmentAvailable || [],
        gymAccess: healthProfile.gymAccess || false,
        homeWorkoutOnly: healthProfile.homeWorkoutOnly || false,
        dietaryRestrictions: healthProfile.dietaryRestrictions || [],
        dislikedExercises: healthProfile.dislikedExercises || [],
        favoriteExercises: healthProfile.favoriteExercises || [],
        medicalConditions: "",
      });
    } else {
      setHealthFormData({
        userId: currentUserId,
        heightCm: 0,
        currentWeightKg: 0,
        targetWeightKg: 0,
        fitnessLevel: "beginner",
        fitnessGoal: "",
        availableDays: [],
        preferredWorkoutTime: "morning",
        workoutDurationMinutes: 45,
        equipmentAvailable: [],
        gymAccess: false,
        homeWorkoutOnly: false,
        dietaryRestrictions: [],
        dislikedExercises: [],
        favoriteExercises: [],
        medicalConditions: "",
      });
    }
    setIsEditingHealth(true);
  };

  const handleHealthInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setHealthFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : 
              (name.includes("Cm") || name.includes("Kg") || name === "workoutDurationMinutes") ? 
              parseFloat(value) || 0 : value,
    }));
  };

  const handleMultiSelectChange = (field: string, value: string) => {
    setHealthFormData((prev) => {
      const currentValues = prev[field as keyof CreateUserHealthProfileRequest] as string[] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const handleHealthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    try {
      setIsLoading(true);
      await personalCoachService.createOrUpdateProfile(healthFormData);
      await loadHealthProfile();
      setIsEditingHealth(false);
      showToast({ message: "Health profile updated successfully!", severity: "success" });
    } catch (error) {
      console.error("Error updating health profile:", error);
      showToast({ message: "Error updating health profile. Please try again.", severity: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingHealth(false);
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
        <section style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}>
          <div className="pf-title" style={{ margin: "0 0 0 6px" }}>Profile</div>

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
              <Tooltip title="Total number of posts you've shared on your profile." arrow placement="top">
              <div>
                <div className="pf-stat-num">{userPosts.length}</div>
                <div className="pf-stat-label">Post</div>
              </div>
              </Tooltip>
              <Tooltip title="Total reactions (likes) received across all your posts." arrow placement="top">
              <div>
                <div className="pf-stat-num">
                  {userPosts.reduce((sum, post) => sum + post.reactionCount, 0)}
                </div>
                <div className="pf-stat-label">Like</div>
              </div>
              </Tooltip>
            </div>

            <div className="pf-metrics">
              <Tooltip 
                title="Total unique days you've been active in challenges. Counts every day from when you joined a challenge to when it ended."
                arrow
                placement="top"
              >
              <div className="pf-chip">
                  <div className="pf-chip-ico">
                    <FlashOnIcon sx={{ fontSize: 20 }} />
                  </div>
                <div>
                    <div className="pf-chip-title">{challengeStats.activeDays}</div>
                  <div className="pf-chip-sub">Active day</div>
                </div>
              </div>
              </Tooltip>
              <Tooltip 
                title="Your best ranking position across all challenges you've participated in."
                arrow
                placement="top"
              >
              <div className="pf-chip">
                  <div className="pf-chip-ico">
                    <LeaderboardIcon sx={{ fontSize: 20 }} />
                  </div>
                <div>
                    <div className="pf-chip-title">
                      {challengeStats.bestRank ? `#${challengeStats.bestRank}` : "-"}
                    </div>
                  <div className="pf-chip-sub">Leaderboard</div>
                </div>
              </div>
              </Tooltip>
              <Tooltip 
                title={healthProfile 
                  ? `Weight difference between your current weight (${healthProfile.currentWeightKg} kg) and target weight (${healthProfile.targetWeightKg} kg).`
                  : "Set up your health profile to track your weight goal progress."
                }
                arrow
                placement="top"
              >
              <div className="pf-chip">
                  <div className="pf-chip-ico">
                    <CheckCircleIcon sx={{ fontSize: 20 }} />
                  </div>
                <div>
                    <div className="pf-chip-title">
                      {healthProfile 
                        ? `${Math.abs(healthProfile.currentWeightKg - healthProfile.targetWeightKg).toFixed(1)} kg` 
                        : "-"}
                </div>
                    <div className="pf-chip-sub">
                      {healthProfile && healthProfile.currentWeightKg > healthProfile.targetWeightKg 
                        ? "To lose" 
                        : healthProfile && healthProfile.currentWeightKg < healthProfile.targetWeightKg
                          ? "To gain"
                          : "Target"}
              </div>
                  </div>
                </div>
              </Tooltip>
              <Tooltip 
                title={`You've completed ${challengeStats.totalCompleted} out of ${challengeStats.totalParticipated} challenges you joined.`}
                arrow
                placement="top"
              >
              <div className="pf-chip">
                  <div className="pf-chip-ico">
                    <EmojiEventsIcon sx={{ fontSize: 20 }} />
                  </div>
                <div>
                    <div className="pf-chip-title">
                      {challengeStats.totalCompleted}/{challengeStats.totalParticipated}
                    </div>
                  <div className="pf-chip-sub">Challenge done</div>
                </div>
              </div>
              </Tooltip>
            </div>
          </div>

          {/* Health Profile Section */}
          <div className="pf-card" style={{ 
            display: "flex", 
            flexDirection: "column",
            minHeight: "400px",
            height: "fit-content"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "#0b3d33", fontSize: "20px", fontWeight: "800" }}>
                Health & Fitness Profile
              </h3>
              {!isEditingHealth && (
                <button 
                  className="pf-edit" 
                  onClick={handleEditHealthProfile}
                  style={{ fontSize: "14px" }}
                >
                  {healthProfile ? "Edit" : "Create"}
                </button>
              )}
            </div>

            {!isEditingHealth && healthProfile ? (
              // Display Mode - Three columns for better layout
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px 16px", fontSize: "14px" }}>
                <div>
                  <div style={{ color: "#53756c", marginBottom: "6px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Height</div>
                  <div style={{ fontWeight: "700", color: "#0b3d33", fontSize: "15px" }}>{healthProfile.heightCm} cm</div>
                </div>
                <div>
                  <div style={{ color: "#53756c", marginBottom: "6px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current Weight</div>
                  <div style={{ fontWeight: "700", color: "#0b3d33", fontSize: "15px" }}>{healthProfile.currentWeightKg} kg</div>
                </div>
                <div>
                  <div style={{ color: "#53756c", marginBottom: "6px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Target Weight</div>
                  <div style={{ fontWeight: "700", color: "#0b3d33", fontSize: "15px" }}>{healthProfile.targetWeightKg} kg</div>
                </div>
                <div>
                  <div style={{ color: "#53756c", marginBottom: "6px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Fitness Level</div>
                  <div style={{ fontWeight: "700", textTransform: "capitalize", color: "#0b3d33", fontSize: "15px" }}>{healthProfile.fitnessLevel}</div>
                </div>
                <div style={{ gridColumn: "2 / -1" }}>
                  <div style={{ color: "#53756c", marginBottom: "6px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Fitness Goal</div>
                  <div style={{ fontWeight: "700", textTransform: "capitalize", color: "#0b3d33", fontSize: "15px" }}>
                    {healthProfile.fitnessGoal.replace(/_/g, " ")}
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1", padding: "8px 0", borderTop: "1px solid #e1efe9" }}>
                  <div style={{ color: "#53756c", marginBottom: "10px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Available Days</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "nowrap", overflowX: "auto" }}>
                    {healthProfile.availableDays.length > 0 
                      ? (() => {
                          const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                          const dayAbbrev: Record<string, string> = {
                            "Monday": "Mon",
                            "Tuesday": "Tue",
                            "Wednesday": "Wed",
                            "Thursday": "Thu",
                            "Friday": "Fri",
                            "Saturday": "Sat",
                            "Sunday": "Sun"
                          };
                          return healthProfile.availableDays
                            .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
                            .map((day) => (
                              <span 
                                key={day}
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: "20px",
                                  background: "linear-gradient(135deg, #0b7e63 0%, #0a6952 100%)",
                                  color: "white",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  boxShadow: "0 2px 4px rgba(11, 126, 99, 0.2)",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {dayAbbrev[day] || day}
                              </span>
                            ));
                        })()
                      : <span style={{ color: "#666", fontSize: "14px" }}>Not set</span>}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#53756c", marginBottom: "6px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Workout Time</div>
                  <div style={{ fontWeight: "700", textTransform: "capitalize", color: "#0b3d33", fontSize: "15px" }}>{healthProfile.preferredWorkoutTime}</div>
                </div>
                <div>
                  <div style={{ color: "#53756c", marginBottom: "6px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Duration</div>
                  <div style={{ fontWeight: "700", color: "#0b3d33", fontSize: "15px" }}>{healthProfile.workoutDurationMinutes} min</div>
                </div>
                <div>
                  <div style={{ color: "#53756c", marginBottom: "6px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Gym Access</div>
                  <div style={{ fontWeight: "700", color: "#0b3d33", fontSize: "15px" }}>{healthProfile.gymAccess ? "Yes" : "No"}</div>
                </div>
                <div style={{ gridColumn: "1 / -1", padding: "8px 0", borderTop: "1px solid #e1efe9" }}>
                  <div style={{ color: "#53756c", marginBottom: "10px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Equipment Available</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {healthProfile.equipmentAvailable.length > 0 
                      ? healthProfile.equipmentAvailable.map((equipment) => (
                          <span 
                            key={equipment}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "20px",
                              background: "linear-gradient(135deg, #0b7e63 0%, #0a6952 100%)",
                              color: "white",
                              fontSize: "13px",
                              fontWeight: "600",
                              boxShadow: "0 2px 4px rgba(11, 126, 99, 0.2)",
                            }}
                          >
                            {equipment}
                          </span>
                        ))
                      : <span style={{ color: "#666", fontSize: "14px" }}>None</span>}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#53756c", marginBottom: "6px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Home Workout Only</div>
                  <div style={{ fontWeight: "700", color: "#0b3d33", fontSize: "15px" }}>{healthProfile.homeWorkoutOnly ? "Yes" : "No"}</div>
                </div>
              </div>
            ) : !isEditingHealth ? (
              <div style={{ textAlign: "center", color: "#666", padding: "30px 0" }}>
                <p style={{ margin: "0 0 12px 0" }}>No health profile yet.</p>
                <p style={{ margin: 0, fontSize: "13px" }}>Click "Create" to add your health and fitness information.</p>
              </div>
            ) : (
              // Edit Mode - Inline Form
              <form onSubmit={handleHealthSubmit} style={{ display: "grid", gap: "16px" }}>
                {/* Basic Health Info */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <Label htmlFor="heightCm" style={{ fontSize: "12px", fontWeight: "600", color: "#0b3d33", marginBottom: "6px" }}>
                      Height (cm) *
                    </Label>
                    <input
                      id="heightCm"
                      name="heightCm"
                      type="number"
                      step="0.1"
                      value={healthFormData.heightCm || ""}
                      onChange={handleHealthInputChange}
                      required
                      className="w-full h-10 px-3 border-2 border-[#0b7e63]/30 focus:border-[#0b7e63] focus:ring-2 focus:ring-[#0b7e63]/20 rounded-lg text-sm focus:outline-none"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <Label htmlFor="currentWeightKg" style={{ fontSize: "12px", fontWeight: "600", color: "#0b3d33", marginBottom: "6px" }}>
                      Current Weight (kg) *
                    </Label>
                    <input
                      id="currentWeightKg"
                      name="currentWeightKg"
                      type="number"
                      step="0.1"
                      value={healthFormData.currentWeightKg || ""}
                      onChange={handleHealthInputChange}
                      required
                      className="w-full h-10 px-3 border-2 border-[#0b7e63]/30 focus:border-[#0b7e63] focus:ring-2 focus:ring-[#0b7e63]/20 rounded-lg text-sm focus:outline-none"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <Label htmlFor="targetWeightKg" style={{ fontSize: "12px", fontWeight: "600", color: "#0b3d33", marginBottom: "6px" }}>
                      Target Weight (kg) *
                    </Label>
                    <input
                      id="targetWeightKg"
                      name="targetWeightKg"
                      type="number"
                      step="0.1"
                      value={healthFormData.targetWeightKg || ""}
                      onChange={handleHealthInputChange}
                      required
                      className="w-full h-10 px-3 border-2 border-[#0b7e63]/30 focus:border-[#0b7e63] focus:ring-2 focus:ring-[#0b7e63]/20 rounded-lg text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Fitness Level & Goal */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <Label htmlFor="fitnessLevel" style={{ fontSize: "12px", fontWeight: "600", color: "#0b3d33", marginBottom: "6px" }}>
                      Fitness Level *
                    </Label>
                    <Select value={healthFormData.fitnessLevel} onValueChange={(value) => setHealthFormData(prev => ({ ...prev, fitnessLevel: value }))}>
                      <SelectTrigger className="w-full h-10 border-2 border-[#0b7e63]/30 focus:border-[#0b7e63] focus:ring-[#0b7e63]/20 rounded-lg">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <Label htmlFor="fitnessGoal" style={{ fontSize: "12px", fontWeight: "600", color: "#0b3d33", marginBottom: "6px" }}>
                      Fitness Goal *
                    </Label>
                    <Select value={healthFormData.fitnessGoal} onValueChange={(value) => setHealthFormData(prev => ({ ...prev, fitnessGoal: value }))}>
                      <SelectTrigger className="w-full h-10 border-2 border-[#0b7e63]/30 focus:border-[#0b7e63] focus:ring-[#0b7e63]/20 rounded-lg">
                        <SelectValue placeholder="Select a goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose_weight">Lose Weight</SelectItem>
                        <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
                        <SelectItem value="maintain">Maintain</SelectItem>
                        <SelectItem value="improve_endurance">Improve Endurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Workout Preferences */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <Label htmlFor="preferredWorkoutTime" style={{ fontSize: "12px", fontWeight: "600", color: "#0b3d33", marginBottom: "6px" }}>
                      Preferred Workout Time
                    </Label>
                    <Select value={healthFormData.preferredWorkoutTime} onValueChange={(value) => setHealthFormData(prev => ({ ...prev, preferredWorkoutTime: value }))}>
                      <SelectTrigger className="w-full h-10 border-2 border-[#0b7e63]/30 focus:border-[#0b7e63] focus:ring-[#0b7e63]/20 rounded-lg">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <Label htmlFor="workoutDurationMinutes" style={{ fontSize: "12px", fontWeight: "600", color: "#0b3d33" }}>
                        Workout Duration
                      </Label>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#0b7e63" }}>
                        {healthFormData.workoutDurationMinutes} min
                      </span>
                    </div>
                    <Slider
                      id="workoutDurationMinutes"
                      min={15}
                      max={180}
                      step={5}
                      value={[healthFormData.workoutDurationMinutes]}
                      onValueChange={(value) => setHealthFormData(prev => ({ ...prev, workoutDurationMinutes: value[0] }))}
                      className="w-full"
                      style={{
                        "--slider-track-bg": "#e1efe9",
                        "--slider-range-bg": "#0b7e63",
                        "--slider-thumb-bg": "#0b7e63",
                      } as any}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "11px", color: "#53756c" }}>
                      <span>15 min</span>
                      <span>180 min</span>
                    </div>
                  </div>
                </div>

                {/* Available Days */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <Label style={{ fontSize: "12px", fontWeight: "600", color: "#0b3d33", marginBottom: "8px" }}>
                    Available Days
                  </Label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    {[
                      { full: "Monday", short: "Mon" },
                      { full: "Tuesday", short: "Tue" },
                      { full: "Wednesday", short: "Wed" },
                      { full: "Thursday", short: "Thu" },
                      { full: "Friday", short: "Fri" },
                      { full: "Saturday", short: "Sat" },
                      { full: "Sunday", short: "Sun" }
                    ].map(day => (
                      <div key={day.full} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day.full}`}
                          checked={healthFormData.availableDays.includes(day.full)}
                          onCheckedChange={() => handleMultiSelectChange("availableDays", day.full)}
                          className="border-[#0b7e63] data-[state=checked]:bg-[#0b7e63] data-[state=checked]:border-[#0b7e63]"
                        />
                        <Label
                          htmlFor={`day-${day.full}`}
                          className="text-sm font-medium cursor-pointer"
                          style={{ minWidth: "35px" }}
                        >
                          {day.short}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <Label style={{ fontSize: "12px", fontWeight: "600", color: "#0b3d33", marginBottom: "8px" }}>
                    Available Equipment
                  </Label>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                    {["Dumbbells", "Barbell", "Resistance Bands", "Pull-up Bar", "Yoga Mat", "Treadmill", "Stationary Bike"].map(equipment => (
                      <div key={equipment} className="flex items-center space-x-2">
                        <Checkbox
                          id={`equipment-${equipment}`}
                          checked={healthFormData.equipmentAvailable.includes(equipment)}
                          onCheckedChange={() => handleMultiSelectChange("equipmentAvailable", equipment)}
                          className="border-[#0b7e63] data-[state=checked]:bg-[#0b7e63] data-[state=checked]:border-[#0b7e63]"
                        />
                        <Label
                          htmlFor={`equipment-${equipment}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {equipment}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gym Access & Home Workout */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <Label style={{ fontSize: "12px", fontWeight: "600", color: "#0b3d33", marginBottom: "8px" }}>
                    Workout Location
                  </Label>
                  <RadioGroup 
                    value={healthFormData.gymAccess ? "gym" : healthFormData.homeWorkoutOnly ? "home" : "none"}
                    onValueChange={(value) => {
                      if (value === "gym") {
                        setHealthFormData(prev => ({ ...prev, gymAccess: true, homeWorkoutOnly: false }));
                      } else if (value === "home") {
                        setHealthFormData(prev => ({ ...prev, gymAccess: false, homeWorkoutOnly: true }));
                      }
                    }}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="gym" 
                        id="gymAccess"
                        className="border-[#0b7e63] text-[#0b7e63]"
                      />
                      <Label
                        htmlFor="gymAccess"
                        className="text-sm font-medium cursor-pointer"
                        style={{ color: "#0b3d33" }}
                      >
                        Gym Access
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="home" 
                        id="homeWorkoutOnly"
                        className="border-[#0b7e63] text-[#0b7e63]"
                      />
                      <Label
                        htmlFor="homeWorkoutOnly"
                        className="text-sm font-medium cursor-pointer"
                        style={{ color: "#0b3d33" }}
                      >
                        Home Workout Only
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Medical Conditions */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <Label htmlFor="medicalConditions" style={{ fontSize: "12px", fontWeight: "600", color: "#0b3d33", marginBottom: "6px" }}>
                    Medical Conditions / Notes (Optional)
                  </Label>
                  <textarea
                    id="medicalConditions"
                    name="medicalConditions"
                    value={healthFormData.medicalConditions}
                    onChange={(e) => setHealthFormData(prev => ({ ...prev, medicalConditions: e.target.value }))}
                    placeholder="Any medical conditions, injuries, or notes..."
                    rows={3}
                    className="w-full px-3 py-2 border-2 border-[#0b7e63]/30 focus:border-[#0b7e63] focus:ring-2 focus:ring-[#0b7e63]/20 rounded-lg text-sm focus:outline-none resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "12px", borderTop: "1px solid #e0e0e0", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn-cancel"
                    style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #ddd", background: "#f5f5f5", cursor: "pointer", fontWeight: "600" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-save"
                    style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#0b7e63", color: "white", cursor: "pointer", fontWeight: "600" }}
                  >
                    {isLoading ? "Saving..." : healthProfile ? "Update Profile" : "Create Profile"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Right column Recent posts */}
        <aside style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}>
          <div className="pf-post" style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}>
            <div className="pf-post-head" style={{ marginBottom: "16px" }}>
              <div className="pf-post-title" style={{ fontSize: "20px", fontWeight: "800" }}>Recent posts</div>
          </div>
          
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
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
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#f8f9fa"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} /> Delete
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
                    gap: "20px",
                    alignItems: "center",
                    fontSize: "14px",
                    color: "#0b3d33",
                  }}>
                    <span style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#0b7e63"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#0b3d33"}
                    >
                      <ChatBubbleIcon width={18} height={18} />
                      <span style={{ fontWeight: "600" }}>{post.commentCount || 0}</span>
                    </span>
                    <span style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      color: post.reactionCount > 0 ? "#ef4444" : "#0b3d33",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                    onMouseLeave={(e) => e.currentTarget.style.color = post.reactionCount > 0 ? "#ef4444" : "#0b3d33"}
                    >
                      <HeartIcon width={18} height={18} />
                      <span style={{ fontWeight: "600" }}>{post.reactionCount}</span>
                    </span>
                  </div>
                  <div className="pf-hr" />
                </div>
              );
            })
          )}
            </div>
          </div>
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
              {/* Card 1: Photo Upload */}
              <div className="modal-card">
                <h3 className="card-title">Profile Photo</h3>
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
                    <CloudUploadIcon sx={{ fontSize: 20 }} />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} />
                    Upload Photo
                </label>
                <p className="avatar-hint">Supports JPG, PNG, WEBP. Maximum size 2MB.</p>
                {avatarError && <p className="avatar-error">{avatarError}</p>}
                </div>
              </div>

              {/* Card 2: Personal Information */}
              <div className="modal-card">
                <h3 className="card-title">Personal Information</h3>
                
                <div className="form-row">
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
              </div>

                <div className="form-row">
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal h-[44px] border-2 border-[#e1efe9] hover:border-[#b8dbd0] focus:border-[#0b7e63] hover:bg-white"
                          style={{
                            borderRadius: "10px",
                            fontSize: "14px",
                            color: editFormData.dateOfBirth ? "#0b3d33" : "#999",
                            padding: "12px 14px",
                          }}
                        >
                          <CalendarMonthIcon sx={{ fontSize: 18, marginRight: "8px", color: "#0b7e63" }} />
                          {editFormData.dateOfBirth ? (
                            format(new Date(editFormData.dateOfBirth), "MMMM dd, yyyy")
                          ) : (
                            <span>Select date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[2000]" align="start">
                        <div className="p-3 border-b border-[#e1efe9]">
                          <div className="flex gap-2">
                            <Select
                              value={(editFormData.dateOfBirth ? new Date(editFormData.dateOfBirth).getMonth() : new Date().getMonth()).toString()}
                              onValueChange={(value) => {
                                const currentDate = editFormData.dateOfBirth ? new Date(editFormData.dateOfBirth) : new Date();
                                currentDate.setMonth(parseInt(value));
                                handleInputChange({
                                  target: { name: "dateOfBirth", value: currentDate.toISOString() }
                                } as any);
                              }}
                            >
                              <SelectTrigger className="w-[130px] h-8 border-[#e1efe9] focus:border-[#0b7e63] focus:ring-[#0b7e63]/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-[3000]">
                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, idx) => (
                                  <SelectItem key={month} value={idx.toString()}>{month}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={(editFormData.dateOfBirth ? new Date(editFormData.dateOfBirth).getFullYear() : new Date().getFullYear()).toString()}
                              onValueChange={(value) => {
                                const currentDate = editFormData.dateOfBirth ? new Date(editFormData.dateOfBirth) : new Date();
                                currentDate.setFullYear(parseInt(value));
                                handleInputChange({
                                  target: { name: "dateOfBirth", value: currentDate.toISOString() }
                                } as any);
                              }}
                            >
                              <SelectTrigger className="w-[100px] h-8 border-[#e1efe9] focus:border-[#0b7e63] focus:ring-[#0b7e63]/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-[3000] max-h-[200px]">
                                {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Calendar
                          mode="single"
                          selected={editFormData.dateOfBirth ? new Date(editFormData.dateOfBirth) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              handleInputChange({
                                target: {
                                  name: "dateOfBirth",
                                  value: date.toISOString(),
                                },
                              } as any);
                            }
                          }}
                          month={editFormData.dateOfBirth ? new Date(editFormData.dateOfBirth) : undefined}
                          onMonthChange={(date) => {
                            handleInputChange({
                              target: {
                                name: "dateOfBirth",
                                value: date.toISOString(),
                              },
                            } as any);
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="rounded-md border-0"
                          classNames={{
                            months: "space-y-4",
                            month: "space-y-4",
                            caption: "flex justify-center pt-1 relative items-center",
                            caption_label: "hidden",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-[#f0fdf4] rounded-md",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-[#53756c] rounded-md w-9 font-normal text-[0.8rem]",
                            row: "flex w-full mt-2",
                            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#e1efe9] first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-[#f0fdf4] rounded-md",
                            day_selected: "bg-[#0b7e63] text-white hover:bg-[#0b7e63] hover:text-white focus:bg-[#0b7e63] focus:text-white",
                            day_today: "bg-[#e1efe9] text-[#0b3d33] font-semibold",
                            day_outside: "text-[#b8dbd0] opacity-50",
                            day_disabled: "text-[#b8dbd0] opacity-50",
                            day_range_middle: "aria-selected:bg-[#e1efe9] aria-selected:text-[#0b3d33]",
                            day_hidden: "invisible",
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
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