import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  FitnessCenter,
  CalendarMonth,
  TrendingUp,
  Close,
  AutoAwesome,
  Schedule,
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

interface GenerateWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (formData: GenerateWorkoutFormData) => Promise<void>;
  isGenerating: boolean;
  aiUsageLimits?: {
    remainingGenerations: number;
    monthlyLimit: number;
    canGenerate: boolean;
    subscriptionTier: string;
  } | null;
}

export interface GenerateWorkoutFormData {
  goal: string;
  durationDays: number;
  difficultyLevel: string;
  availableDays: string[];
  equipmentAvailable: string[];
  additionalNotes: string;
  startFromToday: boolean;
}

const GenerateWorkoutModal: React.FC<GenerateWorkoutModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
  aiUsageLimits,
}) => {
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

  // Animate icon transition when isGenerating changes
  useEffect(() => {
    if (isGenerating && iconRef.current) {
      // Shrink the original icon
      gsap.to(iconRef.current, {
        scale: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setShowLottie(true);
          // Scale in the Lottie animation
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
      // Reset when generation completes
      gsap.to(iconRef.current, {
        scale: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setShowLottie(false);
          // Scale in the original icon
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

  if (!isOpen) return null;

  const handleSubmit = async () => {
    await onGenerate(formData);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{
        backgroundColor: "rgba(10, 106, 86, 0.15)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
      }}
      onClick={() => !isGenerating && onClose()}
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
        style={{
          maxHeight: "85vh",
          border: "3px solid #0a6a56",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 10000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <AutoAwesome style={{ color: "#0a6a56", fontSize: 32 }} />
            <h2 className="text-2xl font-bold" style={{ color: "#0a6a56" }}>
              Generate AI Workout Plan
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all disabled:opacity-50"
            style={{ color: "#0a6a56" }}
          >
            <Close />
          </button>
        </div>

        {/* AI Usage Warning */}
        {aiUsageLimits && aiUsageLimits.subscriptionTier === "free" && aiUsageLimits.remainingGenerations <= 1 && (
          <div 
            className="mb-4 p-4 rounded-xl"
            style={{ 
              background: aiUsageLimits.remainingGenerations === 0 ? "#fee2e2" : "#fff7ed",
              border: `2px solid ${aiUsageLimits.remainingGenerations === 0 ? "#fecaca" : "#fed7aa"}`
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ 
                  color: aiUsageLimits.remainingGenerations === 0 ? "#991b1b" : "#9a3412"
                }}>
                  {aiUsageLimits.remainingGenerations === 0 
                    ? "No AI generations remaining" 
                    : `Last AI generation for this month (${aiUsageLimits.remainingGenerations}/${aiUsageLimits.monthlyLimit})`
                  }
                </p>
                <p className="text-xs mt-1" style={{ 
                  color: aiUsageLimits.remainingGenerations === 0 ? "#dc2626" : "#ea580c"
                }}>
                  {aiUsageLimits.remainingGenerations === 0
                    ? "Consider using the manual schedule builder or upgrade to Premium for 50 AI generations per month."
                    : "After this, consider using the manual builder or upgrade to Premium."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div
          className="overflow-y-auto pr-2"
          style={{ flex: 1, scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`
            .overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
            
            /* Ensure Select dropdowns appear above modal */
            [data-radix-popper-content-wrapper] {
              z-index: 10000 !important;
            }
            
            [data-radix-select-content] {
              z-index: 10000 !important;
            }
          `}</style>

          <div className="space-y-8">
            {/* Goal Selection */}
            <div>
              <label
                className="flex items-center gap-2 text-sm font-semibold mb-2"
                style={{ color: "#0b3d33" }}
              >
                <FitnessCenter fontSize="small" />
                Fitness Goal
              </label>
              <Select
                value={formData.goal}
                onValueChange={(value) => setFormData({ ...formData, goal: value })}
              >
                <SelectTrigger
                  className="w-full border-2 rounded-xl focus:ring-2 focus:ring-green-500/20"
                  style={{ borderColor: "#c8ead6" }}
                >
                  <SelectValue placeholder="Select your fitness goal" />
                </SelectTrigger>
                <SelectContent
                  className="border border-green-200 bg-white shadow-lg z-[10000]"
                  style={{ zIndex: 10000 }}
                  position="popper"
                >
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
              <label
                className="flex items-center gap-2 text-sm font-semibold mb-2"
                style={{ color: "#0b3d33" }}
              >
                <Schedule fontSize="small" />
                Duration
              </label>
              <Select
                value={formData.durationDays.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, durationDays: parseInt(value) })
                }
              >
                <SelectTrigger
                  className="w-full border-2 rounded-xl focus:ring-2 focus:ring-green-500/20"
                  style={{ borderColor: "#c8ead6" }}
                >
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent
                  className="border border-green-200 bg-white shadow-lg z-[10000]"
                  style={{ zIndex: 10000 }}
                  position="popper"
                >
                  <SelectItem value="7">7 Workouts (~1 Week)</SelectItem>
                  <SelectItem value="14">14 Workouts (~2 Weeks)</SelectItem>
                  <SelectItem value="21">21 Workouts (~3 Weeks)</SelectItem>
                  <SelectItem value="30">30 Workouts (~1 Month)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div>
              <label
                className="flex items-center gap-2 text-sm font-semibold mb-2"
                style={{ color: "#0b3d33" }}
              >
                <CalendarMonth fontSize="small" />
                Start Date
              </label>
              <Select
                value={formData.startFromToday ? "today" : "tomorrow"}
                onValueChange={(value) =>
                  setFormData({ ...formData, startFromToday: value === "today" })
                }
              >
                <SelectTrigger
                  className="w-full border-2 rounded-xl focus:ring-2 focus:ring-green-500/20"
                  style={{ borderColor: "#c8ead6" }}
                >
                  <SelectValue placeholder="Select start date" />
                </SelectTrigger>
                <SelectContent
                  className="border border-green-200 bg-white shadow-lg z-[10000]"
                  style={{ zIndex: 10000 }}
                  position="popper"
                >
                  <SelectItem value="today">Start Today</SelectItem>
                  <SelectItem value="tomorrow">Start Tomorrow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Level */}
            <div>
              <label
                className="flex items-center gap-2 text-sm font-semibold mb-2"
                style={{ color: "#0b3d33" }}
              >
                <TrendingUp fontSize="small" />
                Difficulty Level
              </label>
              <Select
                value={formData.difficultyLevel}
                onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value })}
              >
                <SelectTrigger
                  className="w-full border-2 rounded-xl focus:ring-2 focus:ring-green-500/20"
                  style={{ borderColor: "#c8ead6" }}
                >
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent
                  className="border border-green-200 bg-white shadow-lg z-[10000]"
                  style={{ zIndex: 10000 }}
                  position="popper"
                >
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Available Days */}
            <div style={{ marginBottom: "24px" }}>
              <label
                className="flex items-center gap-2 text-sm font-semibold mb-2"
                style={{ color: "#0b3d33" }}
              >
                <CalendarMonth fontSize="small" />
                Available Days
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                  (day) => (
                    <div
                      key={day}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors cursor-pointer ${
                        formData.availableDays.includes(day)
                          ? "bg-green-100 border-green-300"
                          : "bg-white border-gray-200 hover:bg-green-50 hover:border-green-200"
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
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <Label
                        htmlFor={day}
                        className="text-sm font-medium cursor-pointer flex-1"
                        style={{ color: "#0b3d33" }}
                      >
                        {day}
                      </Label>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Equipment Available */}
            <div style={{ marginBottom: "24px" }}>
              <label
                className="flex items-center gap-2 text-sm font-semibold mb-2"
                style={{ color: "#0b3d33" }}
              >
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
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors cursor-pointer ${
                      formData.equipmentAvailable.includes(equipment)
                        ? "bg-green-100 border-green-300"
                        : "bg-white border-gray-200 hover:bg-green-50 hover:border-green-200"
                    }`}
                    onClick={() => {
                      if (formData.equipmentAvailable.includes(equipment)) {
                        setFormData({
                          ...formData,
                          equipmentAvailable: formData.equipmentAvailable.filter(
                            (eq) => eq !== equipment
                          ),
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
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <Label
                      htmlFor={equipment}
                      className="text-sm font-medium cursor-pointer flex-1"
                      style={{ color: "#0b3d33" }}
                    >
                      {equipment}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div style={{ marginBottom: "24px" }}>
              <label
                className="flex items-center gap-2 text-sm font-semibold mb-2"
                style={{ color: "#0b3d33" }}
              >
                <Description fontSize="small" />
                Additional Notes
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all resize-none"
                style={{ borderColor: "#c8ead6" }}
                rows={3}
                placeholder="Any injuries, preferences, or specific requirements..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 pb-6 border-t-2" style={{ borderColor: "#c8ead6" }}>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 hover:bg-opacity-10 hover:bg-gray-200 transition-all disabled:opacity-50"
            style={{ borderColor: "#0a6a56", color: "#0a6a56" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isGenerating || formData.availableDays.length === 0}
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: "#0a6a56" }}
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
      </div>
    </div>
  );
};

export default GenerateWorkoutModal;
