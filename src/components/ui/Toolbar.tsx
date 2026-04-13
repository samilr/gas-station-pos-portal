import React from 'react';
import CompactInput from './CompactInput';

export interface ToolbarChip {
  label: string;
  value: string | number;
  color?: string;
}

interface ToolbarProps {
  chips?: ToolbarChip[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

const dotColorMap: Record<string, string> = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-amber-500',
  gray: 'bg-gray-400',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
};

const Toolbar: React.FC<ToolbarProps> = ({
  chips = [],
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  children,
}) => {
  return (
    <div className="h-8 flex items-center gap-3 px-1 mb-2 flex-shrink-0">
      {/* Search */}
      {onSearchChange && (
        <CompactInput
          icon
          placeholder={searchPlaceholder}
          value={searchValue || ''}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-[180px]"
        />
      )}

      {/* Chips */}
      {chips.length > 0 && (
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          {chips.map((chip, i) => (
            <span key={i} className="flex items-center gap-1">
              {chip.color && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColorMap[chip.color] || 'bg-gray-400'} flex-shrink-0`} />
              )}
              {chip.label} <strong className="text-text-primary">{chip.value}</strong>
            </span>
          ))}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions (passed as children) */}
      <div className="flex items-center gap-1">
        {children}
      </div>
    </div>
  );
};

export default Toolbar;
