import React from 'react';
import { clsx } from '../../utils/clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-md glass animate-fade-in-up animate-gradient-shift border border-cyan-400/40';
  
  const variantClasses = {
    default: 'bg-gradient-to-r from-[#d3b7a0] via-cyan-100 to-[#8e161a] text-[#8e161a] hover:from-cyan-200 hover:to-violet-200',
    danger: 'bg-gradient-to-r from-red-100 via-pink-200 to-violet-200 text-red-700',
    success: 'bg-gradient-to-r from-green-100 via-cyan-100 to-violet-100 text-green-700',
    warning: 'bg-gradient-to-r from-yellow-100 via-orange-100 to-pink-100 text-yellow-700',
    info: 'bg-gradient-to-r from-blue-100 via-cyan-100 to-violet-100 text-blue-700',
  };

  return (
    <span className={clsx(baseClasses, variantClasses[variant], 'animate-bounce-in animate-pulse-glow', className)}>
      {children}
    </span>
  );
}