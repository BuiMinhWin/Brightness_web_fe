import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Snackbar, Alert } from "@mui/material";
import { useAppSelector } from "@/store/hooks";
import { selectUserId } from "@/store/slices/authSlice";
import DocumentUploadSection from "@/components/FitnessProfile/DocumentUploadSection";
import BasicMeasurementsSection from "@/components/FitnessProfile/BasicMeasurementsSection";
import FitnessGoalsSection from "@/components/FitnessProfile/FitnessGoalsSection";
import WorkoutPreferencesSection from "@/components/FitnessProfile/WorkoutPreferencesSection";
import AdvancedOptionsSection from "@/components/FitnessProfile/AdvancedOptionsSection";

const FitnessProfile: React.FC = () => {
  const userId = useAppSelector(selectUserId);

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

  // Toast state
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
        ? `✅ Auto-filled: ${autoFilledFields.join(", ")}`
        : "Data extracted successfully! Please review and fill remaining fields.";

      setToast({ open: true, message, severity: "success" });
    } catch (error) {
      console.error("❌ Error parsing OCR data:", error);
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
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ 
            fontSize: "32px", 
            fontWeight: "700", 
            color: "#1e293b",
            marginBottom: "8px"
          }}>
            Create Your Fitness Profile
          </h1>
          <p style={{ 
            fontSize: "15px", 
            color: "#64748b",
            lineHeight: "1.6"
          }}>
            Tell us about yourself so we can create a personalized workout and nutrition plan tailored to your unique needs and goals.
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
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <Sparkles size={18} />
            <span>Create My Fitness Plan</span>
            <span>→</span>
          </button>
        </div>
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
