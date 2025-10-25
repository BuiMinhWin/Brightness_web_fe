import React from "react";
import { Dialog, DialogContent } from "@mui/material";
import { Close, CheckCircle, AutoAwesome, TrendingUp, Star } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { AICreditBalance } from "../services/personalCoachService";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  aiUsageLimits?: {
    remainingGenerations: number;
    monthlyLimit: number;
    daysUntilReset: number;
  } | null;
  creditBalance?: AICreditBalance | null;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ isOpen, onClose, aiUsageLimits, creditBalance }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate("/pricing");
    onClose();
  };

  // Use credit balance if available, otherwise fall back to legacy usage limits
  const currentCredits = creditBalance?.remainingCredits ?? 0;
  const monthlyCredits = creditBalance?.monthlyCredits ?? (aiUsageLimits?.monthlyLimit ?? 0) * 10; // Convert generations to credits estimate
  const daysUntilReset = creditBalance?.daysUntilReset ?? aiUsageLimits?.daysUntilReset ?? 30;
  const tier = creditBalance?.subscriptionTier ?? "free";

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
          <div 
            className="p-4 rounded-xl"
            style={{ background: "#fee2e2", border: "1px solid #fecaca" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "#991b1b" }}>
                  Current Plan: {tier === "free" ? "Free" : tier === "basic" ? "Basic" : "Premium"}
                </p>
                <p className="text-xs mt-1" style={{ color: "#dc2626" }}>
                  {monthlyCredits} AI credits per month
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: "#dc2626" }}>
                  {currentCredits}/{monthlyCredits}
                </p>
                <p className="text-xs" style={{ color: "#991b1b" }}>
                  Resets in {daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>
          </div>

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

            {/* Option 2: Basic Plan */}
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
                      Basic Plan
                    </h4>
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: "#10b981", color: "white" }}
                    >
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: "#065f46" }}>
                    500 AI credits/month (~50 schedules or 500 chat messages)
                  </p>
                  <ul className="mt-2 space-y-1">
                    {["500 AI credits per month", "All AI features", "Manual schedule builder", "Standard support"].map((feature) => (
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

            {/* Option 3: Premium Plan */}
            <div 
              className="p-4 rounded-xl border-2"
              style={{ 
                borderColor: "#8b5cf6",
                background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)"
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "#8b5cf6", color: "white" }}
                >
                  <Star />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold" style={{ color: "#0b3d33" }}>
                      Premium Plan
                    </h4>
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: "#8b5cf6", color: "white" }}
                    >
                      Best Value
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: "#6b21a8" }}>
                    1,200 AI credits/month (~120 schedules or 1,200 chat messages)
                  </p>
                  <ul className="mt-2 space-y-1">
                    {["1,200 AI credits per month", "Advanced analytics", "Priority support", "Early access to features"].map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm" style={{ color: "#6b21a8" }}>
                        <CheckCircle style={{ fontSize: 16, color: "#8b5cf6" }} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm font-bold mt-3" style={{ color: "#0b3d33" }}>
                    149,000 VND/month
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


