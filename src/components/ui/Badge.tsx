import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'outline' | 'verified';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const base = "inline-flex items-center font-semibold rounded-full tracking-tight transition-colors";
  
  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-xs"
  };

  const variants = {
    primary: "bg-[#D9EAFF] text-[#0751C9]",
    secondary: "bg-[#F7FAFF] text-[#10233F] border border-[#D0E6FD]",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    outline: "bg-transparent text-[#1769E0] border border-[#1769E0]",
    verified: "bg-[#0038BC] text-white shadow-sm"
  };

  return (
    <span className={`${base} ${sizeStyles[size]} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
