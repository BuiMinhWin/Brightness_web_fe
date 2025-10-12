import React from "react";
import SectionCard from "./SectionCard";

interface WorkoutPreferencesSectionProps {
  daysSel: string[];
  setDaysSel: React.Dispatch<React.SetStateAction<string[]>>;
  preferredWorkoutTime: "morning" | "afternoon" | "evening";
  setPreferredWorkoutTime: (value: "morning" | "afternoon" | "evening") => void;
  workoutDuration: number;
  setWorkoutDuration: (value: number) => void;
  gymAccess: boolean;
  setGymAccess: (value: boolean) => void;
  homeWorkoutOnly: boolean;
  setHomeWorkoutOnly: (value: boolean) => void;
  equipment: string[];
  setEquipment: React.Dispatch<React.SetStateAction<string[]>>;
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const workoutTimes = ["Morning", "Afternoon", "Evening"] as const;
const commonEquipment = [
  { value: "dumbbells", label: "Dumbbells" },
  { value: "barbell", label: "Barbell" },
  { value: "resistance_bands", label: "Bands" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "pull_up_bar", label: "Pull-up Bar" },
  { value: "yoga_mat", label: "Yoga Mat" },
  { value: "jump_rope", label: "Jump Rope" },
  { value: "foam_roller", label: "Foam Roller" },
] as const;

const WorkoutPreferencesSection: React.FC<WorkoutPreferencesSectionProps> = ({
  daysSel,
  setDaysSel,
  preferredWorkoutTime,
  setPreferredWorkoutTime,
  workoutDuration,
  setWorkoutDuration,
  gymAccess,
  setGymAccess,
  homeWorkoutOnly,
  setHomeWorkoutOnly,
  equipment,
  setEquipment,
}) => {
  const toggleDay = (d: string) =>
    setDaysSel((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  const toggleEquipment = (eq: string) =>
    setEquipment((cur) => (cur.includes(eq) ? cur.filter((x) => x !== eq) : [...cur, eq]));

  return (
    <SectionCard title="Workout Preferences">
      <div className="space-y-5">
        {/* Workout Days */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Preferred Workout Days <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {days.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={`
                  w-10 h-10 rounded-full font-semibold transition-all text-xs
                  ${daysSel.includes(d)
                    ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Workout Time */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Preferred Workout Time
          </label>
          <div className="flex flex-wrap gap-2">
            {workoutTimes.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setPreferredWorkoutTime(time.toLowerCase() as any)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all text-sm
                  ${preferredWorkoutTime === time.toLowerCase()
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Workout Duration */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Workout Duration: <span className="text-emerald-600">{workoutDuration} minutes</span>
          </label>
          <input
            type="range"
            min="15"
            max="120"
            step="15"
            value={workoutDuration}
            onChange={(e) => setWorkoutDuration(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>15 min</span>
            <span>60 min</span>
            <span>120 min</span>
          </div>
        </div>

        {/* Gym Access Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-semibold text-gray-800 text-sm">Do you have gym access?</p>
            <p className="text-xs text-gray-600">We'll include gym equipment in your workouts</p>
          </div>
          <button
            type="button"
            onClick={() => setGymAccess(!gymAccess)}
            className={`
              relative inline-flex h-7 w-12 items-center rounded-full transition-colors
              ${gymAccess ? "bg-emerald-500" : "bg-gray-300"}
            `}
          >
            <span
              className={`
                inline-block h-5 w-5 transform rounded-full bg-white transition-transform
                ${gymAccess ? "translate-x-6" : "translate-x-1"}
              `}
            />
          </button>
        </div>

        {/* Home Workout Only Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-semibold text-gray-800 text-sm">Home workouts only?</p>
            <p className="text-xs text-gray-600">Focus on bodyweight and minimal equipment</p>
          </div>
          <button
            type="button"
            onClick={() => setHomeWorkoutOnly(!homeWorkoutOnly)}
            className={`
              relative inline-flex h-7 w-12 items-center rounded-full transition-colors
              ${homeWorkoutOnly ? "bg-emerald-500" : "bg-gray-300"}
            `}
          >
            <span
              className={`
                inline-block h-5 w-5 transform rounded-full bg-white transition-transform
                ${homeWorkoutOnly ? "translate-x-6" : "translate-x-1"}
              `}
            />
          </button>
        </div>

        {/* Equipment Available */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Equipment Available
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {commonEquipment.map((eq) => (
              <button
                key={eq.value}
                type="button"
                onClick={() => toggleEquipment(eq.value)}
                className={`
                  px-3 py-2 rounded-lg border-2 transition-all text-xs font-medium
                  ${equipment.includes(eq.value)
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
                  }
                `}
              >
                {eq.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default WorkoutPreferencesSection;

