import React from "react";
import SectionCard from "./SectionCard";

interface BasicMeasurementsSectionProps {
  heightCm: string;
  setHeightCm: (value: string) => void;
  currentWeight: string;
  setCurrentWeight: (value: string) => void;
  targetWeight: string;
  setTargetWeight: (value: string) => void;
}

const BasicMeasurementsSection: React.FC<BasicMeasurementsSectionProps> = ({
  heightCm,
  setHeightCm,
  currentWeight,
  setCurrentWeight,
  targetWeight,
  setTargetWeight,
}) => {
  return (
    <SectionCard title="Body Measurements">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Height (cm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="180"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Weight (kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={currentWeight}
            onChange={(e) => setCurrentWeight(e.target.value)}
            placeholder="75"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Target Weight (kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            placeholder="70"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm"
          />
        </div>
      </div>
    </SectionCard>
  );
};

export default BasicMeasurementsSection;

