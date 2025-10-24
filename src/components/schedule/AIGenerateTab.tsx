import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  FitnessCenter,
  CalendarMonth,
  TrendingUp,
  AutoAwesome,
  Schedule as ScheduleIcon,
  SportsGymnastics,
  Description,
} from "@mui/icons-material";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface GenerateWorkoutFormData {
  goal: string;
  durationDays: number;
  difficultyLevel: string;
  availableDays: string[];
  equipmentAvailable: string[];
  additionalNotes: string;
  startFromToday: boolean;
}

interface AIGenerateTabProps {
  onSubmit: (formData: GenerateWorkoutFormData) => Promise<void>;
  isGenerating: boolean;
  aiUsageLimits?: {
    remainingGenerations: number;
    monthlyLimit: number;
    canGenerate: boolean;
    subscriptionTier: string;
  } | null;
}

const AIGenerateTab: React.FC<AIGenerateTabProps> = ({ onSubmit, isGenerating, aiUsageLimits }) => {
  const [formData, setFormData] = useState<GenerateWorkoutFormData>({
    goal: "Weight Loss",
    durationDays: 7,
    difficultyLevel: "beginner",
    availableDays: ["Monday", "Wednesday", "Friday"],
    equipmentAvailable: ["Dumbbells", "Bodyweight"],
    additionalNotes: "",
    startFromToday: false,
  });

  const [showLottie, setShowLottie] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isGenerating && iconRef.current) {
      gsap.to(iconRef.current, {
        scale: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setShowLottie(true);
          if (iconRef.current) {
            gsap.fromTo(
              iconRef.current,
              { scale: 0 },
              { scale: 1, duration: 0.3, ease: "back.out(1.7)" }
            );
          }
        },
      });
    } else if (!isGenerating && showLottie) {
      gsap.to(iconRef.current, {
        scale: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setShowLottie(false);
          if (iconRef.current) {
            gsap.fromTo(
              iconRef.current,
              { scale: 0 },
              { scale: 1, duration: 0.3, ease: "back.out(1.7)" }
            );
          }
        },
      });
    }
  }, [isGenerating, showLottie]);

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      {/* AI Usage Warning */}
      {aiUsageLimits && aiUsageLimits.subscriptionTier === "free" && aiUsageLimits.remainingGenerations <= 1 && (
        <div 
          className="p-4 rounded-xl"
          style={{ 
            background: aiUsageLimits.remainingGenerations === 0 ? "#fee2e2" : "#fff7ed",
            border: `2px solid ${aiUsageLimits.remainingGenerations === 0 ? "#fecaca" : "#fed7aa"}`
          }}
        >
          <p className="font-semibold text-sm" style={{ 
            color: aiUsageLimits.remainingGenerations === 0 ? "#991b1b" : "#9a3412"
          }}>
            {aiUsageLimits.remainingGenerations === 0 
              ? "No AI generations remaining" 
              : `Last AI generation (${aiUsageLimits.remainingGenerations}/${aiUsageLimits.monthlyLimit})`
            }
          </p>
          <p className="text-xs mt-1" style={{ 
            color: aiUsageLimits.remainingGenerations === 0 ? "#dc2626" : "#ea580c"
          }}>
            {aiUsageLimits.remainingGenerations === 0
              ? "Use manual builder or upgrade to Premium."
              : "After this, use manual builder or upgrade."
            }
          </p>
        </div>
      )}

      {/* Goal Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "#0b3d33" }}>
          <FitnessCenter fontSize="small" />
          Fitness Goal
        </label>
        <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
          <SelectTrigger className="w-full border-2 rounded-xl" style={{ borderColor: "#c8ead6" }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg z-[10000]" position="popper">
            <SelectItem value="Weight Loss">Weight Loss</SelectItem>
            <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
            <SelectItem value="General Fitness">General Fitness</SelectItem>
            <SelectItem value="Strength Training">Strength Training</SelectItem>
            <SelectItem value="Cardio Endurance">Cardio Endurance</SelectItem>
            <SelectItem value="Flexibility">Flexibility</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Duration */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "#0b3d33" }}>
          <ScheduleIcon fontSize="small" />
          Duration
        </label>
        <Select
          value={formData.durationDays.toString()}
          onValueChange={(value) => setFormData({ ...formData, durationDays: parseInt(value) })}
        >
          <SelectTrigger className="w-full border-2 rounded-xl" style={{ borderColor: "#c8ead6" }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg z-[10000]" position="popper">
            <SelectItem value="7">7 Workouts (~1 Week)</SelectItem>
            <SelectItem value="14">14 Workouts (~2 Weeks)</SelectItem>
            <SelectItem value="21">21 Workouts (~3 Weeks)</SelectItem>
            <SelectItem value="30">30 Workouts (~1 Month)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Start Date */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "#0b3d33" }}>
          <CalendarMonth fontSize="small" />
          Start Date
        </label>
        <Select
          value={formData.startFromToday ? "today" : "tomorrow"}
          onValueChange={(value) => setFormData({ ...formData, startFromToday: value === "today" })}
        >
          <SelectTrigger className="w-full border-2 rounded-xl" style={{ borderColor: "#c8ead6" }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg z-[10000]" position="popper">
            <SelectItem value="today">Start Today</SelectItem>
            <SelectItem value="tomorrow">Start Tomorrow</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty Level */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "#0b3d33" }}>
          <TrendingUp fontSize="small" />
          Difficulty Level
        </label>
        <Select
          value={formData.difficultyLevel}
          onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value })}
        >
          <SelectTrigger className="w-full border-2 rounded-xl" style={{ borderColor: "#c8ead6" }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg z-[10000]" position="popper">
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Available Days */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "#0b3d33" }}>
          <CalendarMonth fontSize="small" />
          Available Days
        </label>
        <div className="grid grid-cols-2 gap-2">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
            <div
              key={day}
              className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors cursor-pointer ${
                formData.availableDays.includes(day)
                  ? "bg-green-100 border-green-300"
                  : "bg-white border-gray-200 hover:bg-green-50"
              }`}
              onClick={() => {
                if (formData.availableDays.includes(day)) {
                  setFormData({
                    ...formData,
                    availableDays: formData.availableDays.filter((d) => d !== day),
                  });
                } else {
                  setFormData({
                    ...formData,
                    availableDays: [...formData.availableDays, day],
                  });
                }
              }}
            >
              <Checkbox
                checked={formData.availableDays.includes(day)}
                className="data-[state=checked]:bg-green-600"
              />
              <Label className="text-xs font-medium cursor-pointer flex-1" style={{ color: "#0b3d33" }}>
                {day}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Available */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "#0b3d33" }}>
          <SportsGymnastics fontSize="small" />
          Available Equipment
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Dumbbells",
            "Barbell",
            "Resistance Bands",
            "Bodyweight",
            "Kettlebell",
            "Pull-up Bar",
            "Treadmill",
            "Bike",
          ].map((equipment) => (
            <div
              key={equipment}
              className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors cursor-pointer ${
                formData.equipmentAvailable.includes(equipment)
                  ? "bg-green-100 border-green-300"
                  : "bg-white border-gray-200 hover:bg-green-50"
              }`}
              onClick={() => {
                if (formData.equipmentAvailable.includes(equipment)) {
                  setFormData({
                    ...formData,
                    equipmentAvailable: formData.equipmentAvailable.filter((eq) => eq !== equipment),
                  });
                } else {
                  setFormData({
                    ...formData,
                    equipmentAvailable: [...formData.equipmentAvailable, equipment],
                  });
                }
              }}
            >
              <Checkbox
                checked={formData.equipmentAvailable.includes(equipment)}
                className="data-[state=checked]:bg-green-600"
              />
              <Label className="text-xs font-medium cursor-pointer flex-1" style={{ color: "#0b3d33" }}>
                {equipment}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "#0b3d33" }}>
          <Description fontSize="small" />
          Additional Notes
        </label>
        <textarea
          value={formData.additionalNotes}
          onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
          className="w-full px-3 py-2 border-2 rounded-xl focus:outline-none resize-none"
          style={{ borderColor: "#c8ead6" }}
          rows={3}
          placeholder="Any injuries, preferences..."
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleSubmit}
        disabled={isGenerating || formData.availableDays.length === 0}
        className="w-full px-4 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(90deg, #0a6a56 0%, #69c68d 100%)" }}
      >
        <div ref={iconRef} className="flex items-center">
          {showLottie ? (
            <DotLottieReact
              src="/animations/LoadingAI_Gen.lottie"
              loop
              autoplay
              style={{ width: 20, height: 20 }}
            />
          ) : (
            <AutoAwesome fontSize="small" />
          )}
        </div>
        <span>{isGenerating ? "Generating..." : "Generate Workout"}</span>
      </button>
    </div>
  );
};

export default AIGenerateTab;

