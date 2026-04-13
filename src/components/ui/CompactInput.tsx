import React from 'react';
import { Search } from 'lucide-react';

interface CompactInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: boolean;
}

const CompactInput: React.FC<CompactInputProps> = ({ icon, className = '', ...props }) => {
  const base = 'h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500';

  if (icon) {
    return (
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
        <input className={`${base} pl-7 ${className}`} {...props} />
      </div>
    );
  }

  return <input className={`${base} ${className}`} {...props} />;
};

interface CompactSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const CompactSelect: React.FC<CompactSelectProps> = ({ className = '', children, ...props }) => {
  return (
    <select
      className={`h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

export default CompactInput;
