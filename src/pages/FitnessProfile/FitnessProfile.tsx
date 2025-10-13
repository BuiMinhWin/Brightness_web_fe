import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Snackbar, Alert, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { selectUserId } from "@/store/slices/authSlice";
import { personalCoachService } from "@/services";
import DocumentUploadSection from "@/components/FitnessProfile/DocumentUploadSection";
import BasicMeasurementsSection from "@/components/FitnessProfile/BasicMeasurementsSection";
import FitnessGoalsSection from "@/components/FitnessProfile/FitnessGoalsSection";
import WorkoutPreferencesSection from "@/components/FitnessProfile/WorkoutPreferencesSection";
import AdvancedOptionsSection from "@/components/FitnessProfile/AdvancedOptionsSection";

const FitnessProfile: React.FC = () => {
  const userId = useAppSelector(selectUserId);
  const navigate = useNavigate();

  // Basic fields
  const [heightCm, setHeightCm] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [fitnessGoal, setFitnessGoal] = useState<"lose_weight" | "gain_muscle" | "maintain" | "improve_endurance">("lose_weight");

  // Workout Preferences
  const [daysSel, setDaysSel] = useState<string[]>(["Mon", "Wed", "Fri"]);
  const [preferredWorkoutTime, setPreferredWorkoutTime] = useState<"morning" | "afternoon" | "evening">("morning");
  const [workoutDuration, setWorkoutDuration] = useState(45);
  const [gymAccess, setGymAccess] = useState(false);
  const [homeWorkoutOnly, setHomeWorkoutOnly] = useState(false);
  const [equipment, setEquipment] = useState<string[]>([]);

  // Advanced fields
  const [favoriteExercises, setFavoriteExercises] = useState("");
  const [dislikedExercises, setDislikedExercises] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");

  // Loading & Toast state
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const handleUploadSuccess = (data: any) => {
    autoFillFromOCRData(data);
  };

  const handleUploadError = (message: string, severity: "error" | "warning") => {
    setToast({ open: true, message, severity });
  };

  const validateForm = (): boolean => {
    if (!userId) {
      setToast({ open: true, message: "Please log in to continue", severity: "error" });
      return false;
    }

    if (!heightCm || parseFloat(heightCm) <= 0) {
      setToast({ open: true, message: "Please enter a valid height", severity: "error" });
      return false;
    }

    if (!currentWeight || parseFloat(currentWeight) <= 0) {
      setToast({ open: true, message: "Please enter a valid current weight", severity: "error" });
      return false;
    }

    if (!targetWeight || parseFloat(targetWeight) <= 0) {
      setToast({ open: true, message: "Please enter a valid target weight", severity: "error" });
      return false;
    }

    if (daysSel.length === 0) {
      setToast({ open: true, message: "Please select at least one workout day", severity: "error" });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    console.log("🚀 Starting profile save...");

    try {
      // Parse text fields into arrays
      const favoriteExercisesList = favoriteExercises
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);
      
      const dislikedExercisesList = dislikedExercises
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);
      
      const dietaryRestrictionsList = dietaryRestrictions
        .split(',')
        .map(d => d.trim())
        .filter(d => d.length > 0);

      const profileData = {
        userId: userId!,
        heightCm: parseFloat(heightCm),
        currentWeightKg: parseFloat(currentWeight),
        targetWeightKg: parseFloat(targetWeight),
        fitnessLevel,
        fitnessGoal,
        availableDays: daysSel,
        preferredWorkoutTime,
        workoutDurationMinutes: workoutDuration,
        equipmentAvailable: equipment,
        gymAccess,
        homeWorkoutOnly,
        dietaryRestrictions: dietaryRestrictionsList,
        dislikedExercises: dislikedExercisesList,
        favoriteExercises: favoriteExercisesList,
        medicalConditions,
      };

      console.log("Sending profile data:", profileData);
      const response = await personalCoachService.createOrUpdateProfile(profileData);
      console.log("Profile saved successfully:", response);

      setToast({
        open: true,
        message: "Profile saved successfully! Redirecting to your dashboard...",
        severity: "success",
      });

      // Redirect to dashboard or schedule page after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Profile save error:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response,
        status: error?.status,
      });
      
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || "Failed to save profile. Please check your connection and try again.";
      
      setToast({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsSaving(false);
      console.log("Save process completed");
    }
  };

  const autoFillFromOCRData = (data: any) => {
    try {
      const processed = JSON.parse(data.processedContent || "{}");
      let autoFilledFields: string[] = [];

      if (processed.weight) {
        const weightValue = parseFloat(processed.weight);
        const unit = processed.weightUnit?.toLowerCase() || (weightValue > 100 ? "lbs" : "kg");
        const weightInKg = unit === "lbs" 
          ? (weightValue * 0.453592).toFixed(1) 
          : weightValue.toFixed(1);
        setCurrentWeight(weightInKg);
        autoFilledFields.push(`Weight: ${weightInKg}kg`);
      }

      if (processed.height) {
        const heightValue = parseFloat(processed.height);
        const unit = processed.heightUnit?.toLowerCase() || "cm";
        const heightInCm = unit === "in" || unit === "inch"
          ? (heightValue * 2.54).toFixed(1)
          : heightValue.toFixed(1);
        setHeightCm(heightInCm);
        autoFilledFields.push(`Height: ${heightInCm}cm`);
      }

      if (processed.bmi && processed.height && !targetWeight) {
        const heightM = parseFloat(processed.height) / 100;
        const idealBMI = 22;
        const suggestedWeight = (idealBMI * heightM * heightM).toFixed(1);
        setTargetWeight(suggestedWeight);
        autoFilledFields.push(`Target Weight: ${suggestedWeight}kg`);
      }

      if (processed.bodyFat && (processed.muscleMass || processed.muscle)) {
        const bodyFatNum = parseFloat(processed.bodyFat.replace("%", ""));
        const muscleMassNum = parseFloat(processed.muscleMass || processed.muscle);
        
        let suggestedLevel: "beginner" | "intermediate" | "advanced" = "beginner";
        if (bodyFatNum < 12 && muscleMassNum > 80) {
          suggestedLevel = "advanced";
        } else if (bodyFatNum < 18 && muscleMassNum > 60) {
          suggestedLevel = "intermediate";
        }
        
        setFitnessLevel(suggestedLevel);
        autoFilledFields.push(`Fitness Level: ${suggestedLevel}`);
      }

      const message = autoFilledFields.length > 0
        ? ` Auto-filled: ${autoFilledFields.join(", ")}`
        : "Data extracted successfully! Please review and fill remaining fields.";

      setToast({ open: true, message, severity: "success" });
    } catch (error) {
      console.error("Error parsing OCR data:", error);
      setToast({
        open: true,
        message: "Data extracted but couldn't auto-fill. Please check console and fill manually.",
        severity: "warning",
      });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #e0f2fe 100%)" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 16px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h1 style={{ 
            fontSize: "48px", 
            fontWeight: "400", 
            background: "linear-gradient(135deg, #059669 0%, #0d9488 50%, #06b6d4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "16px",
            fontFamily: "'Pacifico', cursive",
            lineHeight: "1.2",
            paddingBottom: "15px"
          }}>
            Start Your Fitness Journey
          </h1>
          <p style={{ 
            fontSize: "16px", 
            color: "#64748b",
            lineHeight: "1.8",
            maxWidth: "700px",
            margin: "0 auto"
          }}>
            Share your story with us! We'll craft a personalized adventure designed just for you.
          </p>
        </div>

        {/* All Sections */}
        <DocumentUploadSection
          userId={userId}
          onUploadSuccess={handleUploadSuccess}
          onError={handleUploadError}
        />
        
        <BasicMeasurementsSection
          heightCm={heightCm}
          setHeightCm={setHeightCm}
          currentWeight={currentWeight}
          setCurrentWeight={setCurrentWeight}
          targetWeight={targetWeight}
          setTargetWeight={setTargetWeight}
        />
        
        <FitnessGoalsSection
          fitnessGoal={fitnessGoal}
          setFitnessGoal={setFitnessGoal}
          fitnessLevel={fitnessLevel}
          setFitnessLevel={setFitnessLevel}
        />
        
        <WorkoutPreferencesSection
          daysSel={daysSel}
          setDaysSel={setDaysSel}
          preferredWorkoutTime={preferredWorkoutTime}
          setPreferredWorkoutTime={setPreferredWorkoutTime}
          workoutDuration={workoutDuration}
          setWorkoutDuration={setWorkoutDuration}
          gymAccess={gymAccess}
          setGymAccess={setGymAccess}
          homeWorkoutOnly={homeWorkoutOnly}
          setHomeWorkoutOnly={setHomeWorkoutOnly}
          equipment={equipment}
          setEquipment={setEquipment}
        />
        
        <AdvancedOptionsSection
          favoriteExercises={favoriteExercises}
          setFavoriteExercises={setFavoriteExercises}
          dislikedExercises={dislikedExercises}
          setDislikedExercises={setDislikedExercises}
          medicalConditions={medicalConditions}
          setMedicalConditions={setMedicalConditions}
          dietaryRestrictions={dietaryRestrictions}
          setDietaryRestrictions={setDietaryRestrictions}
        />

        {/* Submit Button */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "40px", marginBottom: "20px" }}>
                  <button
                    type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            style={{
              position: "relative",
              padding: "18px 56px",
              fontSize: "20px",
              fontWeight: "700",
              color: "white",
              background: isSaving 
                ? "linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #d1d5db 100%)"
                : "linear-gradient(135deg, #059669 0%, #0d9488 50%, #06b6d4 100%)",
              border: "3px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "50px",
              cursor: isSaving ? "not-allowed" : "pointer",
              boxShadow: "0 15px 35px rgba(5, 150, 105, 0.4), 0 5px 15px rgba(13, 148, 136, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              overflow: "hidden",
              letterSpacing: "0.5px",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              opacity: isSaving ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
                e.currentTarget.style.boxShadow = "0 20px 50px rgba(5, 150, 105, 0.5), 0 10px 25px rgba(13, 148, 136, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)";
                e.currentTarget.style.background = "linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #22d3ee 100%)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(5, 150, 105, 0.4), 0 5px 15px rgba(13, 148, 136, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)";
                e.currentTarget.style.background = "linear-gradient(135deg, #059669 0%, #0d9488 50%, #06b6d4 100%)";
              }
            }}
            className="journey-button"
          >
            {/* Content */}
            <span style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "14px", 
              position: "relative", 
              zIndex: 2 
            }}>
              {isSaving ? (
                <>
                  <CircularProgress size={24} thickness={4} sx={{ color: "white" }} />
                  <span>Saving Your Profile...</span>
                </>
              ) : (
                <>
                  <Sparkles 
                    size={24} 
                    style={{ 
                      animation: "sparkle 1.5s ease-in-out infinite",
                      filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.6))"
                    }} 
                  />
                  <span style={{ position: "relative" }}>
                    Begin My Journey
                    <span style={{
                      position: "absolute",
                      bottom: "-2px",
                      left: "0",
                      width: "0",
                      height: "2px",
                      background: "white",
                      transition: "width 0.4s ease",
                    }} className="underline-animation" />
                  </span>
                  <span 
                    style={{ 
                      transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      display: "inline-block",
                      fontSize: "24px",
                    }} 
                    className="arrow-animation"
                  >
                    →
                  </span>
                </>
              )}
            </span>
            
            {/* Animated shine effect */}
            <span
              style={{
                position: "absolute",
                top: "-50%",
                left: "-100%",
                width: "60%",
                height: "200%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                transform: "rotate(30deg)",
                animation: "shine 3s infinite",
              }}
            />
            
            {/* Floating particles */}
            <span
              style={{
                position: "absolute",
                top: "20%",
                left: "10%",
                width: "4px",
                height: "4px",
                background: "white",
                borderRadius: "50%",
                opacity: "0.6",
                animation: "float 3s infinite ease-in-out",
              }}
            />
            <span
              style={{
                position: "absolute",
                top: "60%",
                right: "15%",
                width: "3px",
                height: "3px",
                background: "white",
                borderRadius: "50%",
                opacity: "0.5",
                animation: "float 4s infinite ease-in-out 0.5s",
              }}
            />
                  </button>
            </div>

        {/* Enhanced animations */}
        <style>{`
          @keyframes shine {
            0% { left: -100%; }
            50%, 100% { left: 100%; }
          }
          
          @keyframes sparkle {
            0%, 100% { 
              transform: rotate(0deg) scale(1); 
              opacity: 1;
            }
            50% { 
              transform: rotate(180deg) scale(1.2); 
              opacity: 0.8;
            }
          }
          
          @keyframes float {
            0%, 100% { 
              transform: translateY(0) translateX(0); 
              opacity: 0.6;
            }
            50% { 
              transform: translateY(-20px) translateX(10px); 
              opacity: 0.3;
            }
          }
          
          .journey-button:hover .arrow-animation {
            transform: translateX(8px) scale(1.2);
          }
          
          .journey-button:hover .underline-animation {
            width: 100%;
          }
          
          .journey-button:active {
            transform: translateY(-2px) scale(1.02) !important;
          }
        `}</style>
            </div>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default FitnessProfile;
