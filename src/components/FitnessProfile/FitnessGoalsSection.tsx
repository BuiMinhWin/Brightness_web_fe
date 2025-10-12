import React from "react";
import { TrendingDown, Dumbbell, Scale, Zap } from "lucide-react";
import SectionCard from "./SectionCard";

interface FitnessGoalsSectionProps {
  fitnessGoal: "lose_weight" | "gain_muscle" | "maintain" | "improve_endurance";
  setFitnessGoal: (value: "lose_weight" | "gain_muscle" | "maintain" | "improve_endurance") => void;
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  setFitnessLevel: (value: "beginner" | "intermediate" | "advanced") => void;
}

const fitnessGoals = [
  { value: "lose_weight", label: "Lose Weight", Icon: TrendingDown, desc: "Reduce body fat" },
  { value: "gain_muscle", label: "Build Muscle", Icon: Dumbbell, desc: "Increase strength" },
  { value: "maintain", label: "Stay Fit", Icon: Scale, desc: "Maintain level" },
  { value: "improve_endurance", label: "Boost Endurance", Icon: Zap, desc: "Improve cardio" },
] as const;

const fitnessLevels = ["Beginner", "Intermediate", "Advanced"] as const;

const FitnessGoalsSection: React.FC<FitnessGoalsSectionProps> = ({
  fitnessGoal,
  setFitnessGoal,
  fitnessLevel,
  setFitnessLevel,
}) => {
  return (
    <SectionCard title="Fitness Goals & Experience">
      <div className="space-y-5">
        {/* Goals */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Primary Fitness Goal <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {fitnessGoals.map((goal) => {
              const IconComponent = goal.Icon;
              return (
                <div
                  key={goal.value}
                  onClick={() => setFitnessGoal(goal.value as any)}
                  className={`
                    p-3 rounded-lg border-2 cursor-pointer transition-all text-center
                    ${fitnessGoal === goal.value
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex justify-center mb-1">
                    <IconComponent 
                      size={28} 
                      className={fitnessGoal === goal.value ? "text-emerald-600" : "text-gray-600"} 
                    />
                  </div>
                  <p className={`font-semibold text-xs ${fitnessGoal === goal.value ? "text-emerald-700" : "text-gray-800"}`}>
                    {goal.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{goal.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fitness Level */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Fitness Level <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {fitnessLevels.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFitnessLevel(level.toLowerCase() as any)}
                className={`
                  px-5 py-2 rounded-lg font-medium transition-all text-sm
                  ${fitnessLevel === level.toLowerCase()
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default FitnessGoalsSection;

