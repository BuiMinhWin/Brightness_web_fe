import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AdvancedOptionsSectionProps {
  favoriteExercises: string;
  setFavoriteExercises: (value: string) => void;
  dislikedExercises: string;
  setDislikedExercises: (value: string) => void;
  medicalConditions: string;
  setMedicalConditions: (value: string) => void;
  dietaryRestrictions: string;
  setDietaryRestrictions: (value: string) => void;
}

const AdvancedOptionsSection: React.FC<AdvancedOptionsSectionProps> = ({
  favoriteExercises,
  setFavoriteExercises,
  dislikedExercises,
  setDislikedExercises,
  medicalConditions,
  setMedicalConditions,
  dietaryRestrictions,
  setDietaryRestrictions,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-5">
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 flex items-center justify-between hover:from-emerald-700 hover:to-teal-700 transition-all"
      >
        <h3 className="text-white font-semibold text-base">Advanced Options (Optional)</h3>
        {showAdvanced ? (
          <ChevronUp className="text-white" size={20} />
        ) : (
          <ChevronDown className="text-white" size={20} />
        )}
      </button>
      
      {showAdvanced && (
        <div className="p-5 space-y-4 animate-in fade-in duration-300">
          {/* Favorite Exercises */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Favorite Exercises
            </label>
            <textarea
              value={favoriteExercises}
              onChange={(e) => setFavoriteExercises(e.target.value)}
              placeholder="e.g., Squats, Deadlifts, Pull-ups..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none resize-none text-sm"
            />
          </div>

          {/* Disliked Exercises */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Exercises to Avoid
            </label>
            <textarea
              value={dislikedExercises}
              onChange={(e) => setDislikedExercises(e.target.value)}
              placeholder="e.g., Burpees, Running..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none resize-none text-sm"
            />
          </div>

          {/* Medical Conditions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Medical Conditions or Injuries
            </label>
            <textarea
              value={medicalConditions}
              onChange={(e) => setMedicalConditions(e.target.value)}
              placeholder="List any health conditions, past injuries, or physical limitations..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none resize-none text-sm"
            />
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dietary Restrictions or Preferences
            </label>
            <textarea
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              placeholder="e.g., Vegetarian, Lactose intolerant, Nut allergy..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none resize-none text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedOptionsSection;

