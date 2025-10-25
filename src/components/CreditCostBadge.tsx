import React from 'react';
import { AutoAwesome, Warning } from '@mui/icons-material';
import { Tooltip } from '@mui/material';

interface CreditCostBadgeProps {
  cost: number;
  currentBalance?: number;
  operationName?: string;
  showWarning?: boolean;
}

const CreditCostBadge: React.FC<CreditCostBadgeProps> = ({ 
  cost, 
  currentBalance, 
  operationName = 'operation',
  showWarning = true 
}) => {
  const insufficient = currentBalance !== undefined && currentBalance < cost;
  
  const badge = (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
        insufficient ? 'animate-pulse' : ''
      }`}
      style={{ 
        background: insufficient ? '#fee2e2' : '#dbeafe', 
        color: insufficient ? '#991b1b' : '#1e40af',
        border: `1px solid ${insufficient ? '#fecaca' : '#bfdbfe'}`
      }}
    >
      <AutoAwesome style={{ fontSize: 14 }} />
      <span>{cost} credit{cost !== 1 ? 's' : ''}</span>
      {insufficient && showWarning && (
        <Warning style={{ fontSize: 14, color: '#dc2626' }} />
      )}
    </div>
  );

  if (insufficient) {
    return (
      <Tooltip title={`Insufficient credits. This ${operationName} requires ${cost} credits, but you only have ${currentBalance} remaining.`}>
        {badge}
      </Tooltip>
    );
  }

  return (
    <Tooltip title={`This ${operationName} will cost ${cost} AI credit${cost !== 1 ? 's' : ''}`}>
      {badge}
    </Tooltip>
  );
};

export default CreditCostBadge;

