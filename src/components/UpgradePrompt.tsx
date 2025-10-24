import React from "react";
import { Dialog, DialogContent } from "@mui/material";
import { Close, CheckCircle, AutoAwesome, TrendingUp } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  aiUsageLimits?: {
    remainingGenerations: number;
    monthlyLimit: number;
    daysUntilReset: number;
  } | null;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ isOpen, onClose, aiUsageLimits }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate("/pricing");
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          padding: "8px",
        }
      }}
    >
      <DialogContent sx={{ padding: "24px" }}>
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "#0b3d33" }}>
                AI Generation Limit Reached
              </h2>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
                You've used all your free AI generations this month
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Close style={{ color: "#6b7280" }} />
            </button>
          </div>

          {/* Current Status */}
          {aiUsageLimits && (
            <div 
              className="p-4 rounded-xl"
              style={{ background: "#fee2e2", border: "1px solid #fecaca" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#991b1b" }}>
                    Current Plan: Free
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#dc2626" }}>
                    {aiUsageLimits.monthlyLimit} AI generations per month
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: "#dc2626" }}>
                    {aiUsageLimits.remainingGenerations}/{aiUsageLimits.monthlyLimit}
                  </p>
                  <p className="text-xs" style={{ color: "#991b1b" }}>
                    Resets in {aiUsageLimits.daysUntilReset} {aiUsageLimits.daysUntilReset === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: "#0b3d33" }}>
              What you can do:
            </p>

            {/* Option 1: Wait for Reset */}
            <div 
              className="p-4 rounded-xl border-2"
              style={{ borderColor: "#d1d5db" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "#dbeafe", color: "#1d4ed8" }}
                >
                  <AutoAwesome />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold" style={{ color: "#0b3d33" }}>
                    Wait for Monthly Reset
                  </h4>
                  <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
                    Your AI generations will reset on the 1st of next month
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Upgrade (Highlighted) */}
            <div 
              className="p-4 rounded-xl border-2"
              style={{ 
                borderColor: "#10b981",
                background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "#10b981", color: "white" }}
                >
                  <TrendingUp />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold" style={{ color: "#0b3d33" }}>
                      Upgrade to Premium
                    </h4>
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: "#10b981", color: "white" }}
                    >
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: "#065f46" }}>
                    Get 50 AI generations per month + unlimited manual schedules
                  </p>
                  <ul className="mt-2 space-y-1">
                    {["50 AI-powered schedule generations", "Advanced workout analytics", "Priority support", "All future features"].map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm" style={{ color: "#065f46" }}>
                        <CheckCircle style={{ fontSize: 16, color: "#10b981" }} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm font-bold mt-3" style={{ color: "#0b3d33" }}>
                    Only 79,000 VND/month
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all"
              style={{
                background: "#f3f4f6",
                color: "#374151",
              }}
            >
              Maybe Later
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg"
              style={{
                background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
              }}
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePrompt;


