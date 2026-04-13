import React from 'react';

const colorMap: Record<string, string> = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-amber-500',
  gray: 'bg-gray-400',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
};

interface StatusDotProps {
  color: string;
  label: string;
  className?: string;
}

const StatusDot: React.FC<StatusDotProps> = ({ color, label, className = '' }) => {
  const dotColor = colorMap[color] || 'bg-gray-400';

  return (
    <span className={`inline-flex items-center gap-1 text-xs text-text-secondary leading-none ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />
      {label}
    </span>
  );
};

export default StatusDot;
