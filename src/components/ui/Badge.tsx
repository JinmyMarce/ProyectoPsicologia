import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold';
  
  const variants = {
    default: 'bg-granate-800 text-blanco shadow-sm',
    primary: 'bg-granate-800 text-blanco shadow-sm',
    secondary: 'bg-azul-marino-800 text-blanco shadow-sm',
    success: 'bg-verde-esmeralda text-blanco shadow-sm',
    info: 'bg-azul-marino text-blanco shadow-sm',
    warning: 'bg-mostaza text-negro shadow-sm',
    danger: 'bg-red-600 text-blanco shadow-sm',
  };

  return (
    <span className={cn(baseClasses, variants[variant], className)}>
      {children}
    </span>
  );
}