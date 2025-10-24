import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { format } from "date-fns";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

export interface GenerateWorkoutFormData {
  goal: string;
  durationDays: number;
  difficultyLevel: string;
  availableDays: string[];
  equipmentAvailable: string[];
  additionalNotes: string;
  startDate: Date | undefined;
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
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [formData, setFormData] = useState<GenerateWorkoutFormData>({
    goal: "Weight Loss",
    durationDays: 7,
    difficultyLevel: "beginner",
    availableDays: ["Monday", "Wednesday", "Friday"],
    equipmentAvailable: ["Dumbbells", "Bodyweight"],
    additionalNotes: "",
    startDate: tomorrow,
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
    <>
      <style>{`
        /* AI Generate Calendar Subtle Green Theme - Force Override */
        .ai-generate-calendar,
        .ai-generate-calendar *,
        .ai-generate-calendar [data-radix-popper-content-wrapper],
        .ai-generate-calendar .rdp,
        .ai-generate-calendar .rdp-months,
        .ai-generate-calendar .rdp-month,
        .ai-generate-calendar .rdp-table,
        .ai-generate-calendar .rdp-tbody,
        .ai-generate-calendar table {
          background-color: transparent !important;
        }
        
        .ai-generate-calendar [data-radix-popper-content-wrapper] {
          background: linear-gradient(180deg, #e5f7ed 0%, #f5fce8 100%) !important;
        }
        
        .ai-generate-calendar .rdp-day {
          color: #2d5349 !important;
          background-color: transparent !important;
        }
        
        .ai-generate-calendar .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_disabled) {
          background-color: rgba(255, 255, 255, 0.5) !important;
          box-shadow: 0 1px 2px rgba(10, 106, 86, 0.1) !important;
        }
        
        .ai-generate-calendar button[role="gridcell"] {
          background-color: transparent !important;
        }
        
        .ai-generate-calendar button[role="gridcell"]:hover:not([aria-selected="true"]):not([disabled]) {
          background-color: rgba(255, 255, 255, 0.5) !important;
        }
        
        .ai-generate-calendar .rdp-day_selected,
        .ai-generate-calendar button[role="gridcell"][aria-selected="true"] {
          background-color: #0a6a56 !important;
          color: white !important;
          font-weight: 600 !important;
        }
        
        .ai-generate-calendar .rdp-day_selected:hover,
        .ai-generate-calendar button[role="gridcell"][aria-selected="true"]:hover {
          background-color: #085544 !important;
        }
        
        .ai-generate-calendar .rdp-day_today:not(.rdp-day_selected) {
          background-color: rgba(255, 255, 255, 0.6) !important;
          color: #0a6a56 !important;
          font-weight: 700 !important;
          border: 2px solid #69c68d !important;
        }
        
        .ai-generate-calendar .rdp-head_cell {
          color: #53756c !important;
          font-weight: 600 !important;
          background-color: transparent !important;
        }
        
        .ai-generate-calendar .rdp-day_outside {
          color: #a8c9bd !important;
          opacity: 0.6 !important;
        }
        
        .ai-generate-calendar .rdp-day_disabled,
        .ai-generate-calendar button[role="gridcell"][disabled] {
          color: #c8ead6 !important;
          opacity: 0.5 !important;
          text-decoration: line-through !important;
          background-color: transparent !important;
        }
        
        .ai-generate-calendar .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: rgba(255, 255, 255, 0.5) !important;
        }
        
        .ai-generate-calendar .rdp-nav_button {
          background-color: rgba(255, 255, 255, 0.4) !important;
          color: #53756c !important;
        }
        
        .ai-generate-calendar .rdp-nav_button:hover {
          background-color: rgba(255, 255, 255, 0.7) !important;
        }
        
        .ai-generate-calendar .rdp-caption,
        .ai-generate-calendar .rdp-head,
        .ai-generate-calendar thead,
        .ai-generate-calendar tbody,
        .ai-generate-calendar tr {
          background-color: transparent !important;
        }
        
        /* Force all day cells and buttons to be transparent */
        .ai-generate-calendar .rdp-cell,
        .ai-generate-calendar td,
        .ai-generate-calendar th,
        .ai-generate-calendar button {
          background-color: transparent !important;
        }
        
        .ai-generate-calendar .rdp-day_range_start,
        .ai-generate-calendar .rdp-day_range_end,
        .ai-generate-calendar .rdp-day_range_middle {
          background-color: transparent !important;
        }
        
        /* Override Shadcn button styles */
        .ai-generate-calendar button.inline-flex,
        .ai-generate-calendar .items-center,
        .ai-generate-calendar [class*="day"] {
          background-color: transparent !important;
        }
      `}</style>
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between text-left font-normal h-[44px] border-2 border-[#c8ead6] hover:border-[#b8dbd0] focus:border-[#0b7e63]"
              style={{
                borderRadius: "12px",
                fontSize: "14px",
                color: formData.startDate ? "#0b3d33" : "#9ca3af",
                padding: "12px 14px",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(229, 247, 237, 0.6) 100%)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span className="flex items-center gap-2">
                <CalendarMonth fontSize="small" style={{ color: "#0a6a56" }} />
                {formData.startDate ? format(formData.startDate, "MMMM dd, yyyy") : "Select a date"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 z-[10000] ai-generate-calendar" 
            align="start" 
            style={{ 
              boxShadow: "0 8px 24px rgba(10, 106, 86, 0.12)",
              background: "linear-gradient(180deg, #e5f7ed 0%, #f5fce8 100%)",
              border: "1px solid rgba(200, 234, 214, 0.6)",
              borderRadius: "12px",
              overflow: "hidden"
            }}
          >
            <div className="p-3 border-b" style={{ borderColor: "rgba(200, 234, 214, 0.4)" }}>
              <div className="flex gap-2">
                <Select
                  value={(formData.startDate ? formData.startDate.getMonth() : new Date().getMonth()).toString()}
                  onValueChange={(value) => {
                    const currentDate = formData.startDate ? new Date(formData.startDate) : new Date();
                    currentDate.setMonth(parseInt(value));
                    setFormData({ ...formData, startDate: currentDate });
                  }}
                >
                  <SelectTrigger className="w-[130px] h-8 bg-white" style={{ borderColor: "#c8ead6" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[11000] bg-white">
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, idx) => (
                      <SelectItem key={month} value={idx.toString()}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={(formData.startDate ? formData.startDate.getFullYear() : new Date().getFullYear()).toString()}
                  onValueChange={(value) => {
                    const currentDate = formData.startDate ? new Date(formData.startDate) : new Date();
                    currentDate.setFullYear(parseInt(value));
                    setFormData({ ...formData, startDate: currentDate });
                  }}
                >
                  <SelectTrigger className="w-[100px] h-8 bg-white" style={{ borderColor: "#c8ead6" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[11000] max-h-[200px] bg-white">
                    {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div style={{ padding: "12px", backgroundColor: "transparent" }}>
              <Calendar
                mode="single"
                selected={formData.startDate}
                onSelect={(date) => setFormData({ ...formData, startDate: date })}
                month={formData.startDate}
                onMonthChange={(date) => {
                  setFormData({ ...formData, startDate: date });
                }}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const maxDate = new Date();
                  maxDate.setDate(maxDate.getDate() + 30);
                  return date < today || date > maxDate;
                }}
                initialFocus
                className="[&_*]:!bg-transparent [&_button]:!bg-transparent [&_td]:!bg-transparent [&_th]:!bg-transparent"
                classNames={{
                  months: "space-y-4 !bg-transparent",
                  month: "space-y-4 !bg-transparent",
                  caption: "flex justify-center pt-1 relative items-center !bg-transparent",
                  caption_label: "hidden",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 p-0 hover:opacity-100 rounded-md !bg-[rgba(255,255,255,0.4)]",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1 !bg-transparent",
                  head_row: "flex !bg-transparent",
                  head_cell: "rounded-md w-9 font-semibold text-[0.8rem] !bg-transparent",
                  row: "flex w-full mt-2 !bg-transparent",
                  cell: "text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 !bg-transparent",
                  day: "h-9 w-9 p-0 font-medium aria-selected:opacity-100 rounded-md transition-all !bg-transparent",
                  day_selected: "shadow-md !bg-[#0a6a56] !text-white",
                  day_today: "font-bold !bg-[rgba(255,255,255,0.6)] !text-[#0a6a56] !border-2 !border-[#69c68d]",
                  day_outside: "opacity-40",
                  day_disabled: "opacity-30 line-through",
                  day_range_middle: "",
                  day_hidden: "invisible",
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
        <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
          Select a start date up to 30 days ahead
        </p>
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
    </>
  );
};

export default AIGenerateTab;

