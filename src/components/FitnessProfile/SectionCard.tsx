import React, { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  icon?: ReactNode;
  subtitle?: string;
  children: ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, subtitle, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-5">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 flex items-center gap-2">
        {icon && <span className="text-white">{icon}</span>}
        <div className="flex-1">
          <h3 className="text-white font-semibold text-base m-0">{title}</h3>
          {subtitle && <p className="text-white/90 text-xs m-0 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

export default SectionCard;

