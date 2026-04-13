import React from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'icon';

interface CompactButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  ghost: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  danger: 'border border-red-300 text-red-600 hover:bg-red-50',
  icon: 'hover:bg-gray-100 text-gray-500',
};

const CompactButton: React.FC<CompactButtonProps> = ({
  variant = 'ghost',
  className = '',
  children,
  ...props
}) => {
  const base = variant === 'icon'
    ? 'h-7 w-7 flex items-center justify-center rounded-sm transition-colors'
    : 'h-7 px-3 text-sm rounded-sm font-medium transition-colors inline-flex items-center gap-1.5';

  return (
    <button
      className={`${base} ${variantStyles[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default CompactButton;
