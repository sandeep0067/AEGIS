import React from 'react';

interface RiskBadgeProps {
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ riskLevel }) => (
  <span className={`hist-level ${riskLevel}`}>
    {riskLevel.toUpperCase()}
  </span>
);
