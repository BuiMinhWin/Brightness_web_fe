import React from 'react';
import { Tooltip } from '@mui/material';
import { AutoAwesome, TrendingUp } from '@mui/icons-material';
import { AICreditBalance } from '../services/personalCoachService';

interface CreditBalanceProps {
  balance: AICreditBalance;
  compact?: boolean;
}

const CreditBalance: React.FC<CreditBalanceProps> = ({ balance, compact = false }) => {
  const percentage = (balance.remainingCredits / balance.monthlyCredits) * 100;
  
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return '#8b5cf6'; // Purple
      case 'basic':
        return '#10b981'; // Green
      default:
        return '#6b7280'; // Gray
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'Premium';
      case 'basic':
        return 'Basic';
      default:
        return 'Free';
    }
  };

  const getProgressColor = () => {
    if (percentage > 50) return '#10b981'; // Green
    if (percentage > 20) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  if (compact) {
    return (
      <Tooltip title={`${balance.remainingCredits.toLocaleString()} / ${balance.monthlyCredits.toLocaleString()} tokens remaining`}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: '#f3f4f6' }}>
          <AutoAwesome style={{ fontSize: 16, color: getTierColor(balance.subscriptionTier) }} />
          <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>
            {balance.remainingCredits.toLocaleString()}
          </span>
        </div>
      </Tooltip>
    );
  }

  return (
    <div className="w-full p-4 rounded-xl" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AutoAwesome style={{ fontSize: 20, color: getTierColor(balance.subscriptionTier) }} />
          <span className="text-sm font-semibold" style={{ color: '#6b7280' }}>
            AI Tokens
          </span>
        </div>
        <div 
          className="px-2 py-1 rounded-full text-xs font-bold"
          style={{ 
            background: `${getTierColor(balance.subscriptionTier)}20`, 
            color: getTierColor(balance.subscriptionTier) 
          }}
        >
          {getTierLabel(balance.subscriptionTier)}
        </div>
      </div>

      {/* Credits Display */}
      <div className="mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold" style={{ color: '#1f2937' }}>
            {balance.remainingCredits.toLocaleString()}
          </span>
          <span className="text-sm" style={{ color: '#9ca3af' }}>
            / {balance.monthlyCredits.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full mb-3" style={{ background: '#e5e7eb' }}>
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ 
            width: `${percentage}%`, 
            background: getProgressColor()
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs" style={{ color: '#6b7280' }}>
        <span>{balance.usedCreditsThisMonth.toLocaleString()} tokens used</span>
        <span>Resets in {balance.daysUntilReset} {balance.daysUntilReset === 1 ? 'day' : 'days'}</span>
      </div>

      {/* Cost Breakdown Tooltip */}
      {balance.creditCostBreakdown && Object.keys(balance.creditCostBreakdown).length > 0 && (
        <Tooltip 
          title={
            <div className="p-2">
              <div className="font-semibold mb-2">Token Costs:</div>
              {Object.entries(balance.creditCostBreakdown).map(([operation, cost]) => (
                <div key={operation} className="flex justify-between gap-4 py-1">
                  <span>{operation.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="font-semibold">{cost} tokens</span>
                </div>
              ))}
            </div>
          }
          placement="bottom"
        >
          <button 
            className="w-full mt-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ 
              background: '#f9fafb', 
              color: '#6b7280',
              border: '1px solid #e5e7eb'
            }}
          >
            View Token Costs
          </button>
        </Tooltip>
      )}
    </div>
  );
};

export default CreditBalance;

