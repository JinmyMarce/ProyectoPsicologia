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
    primary: 'bg-granate text-blanco',
    success: 'bg-verde-esmeralda text-blanco',
    info: 'bg-azul-marino text-blanco',
    warning: 'bg-mostaza text-negro',
    danger: 'bg-naranja-quemado text-blanco',
    neutral: 'bg-gris-claro text-gris-oscuro',
    pink: 'bg-rosa-palo text-granate',
  };

  return (
    <span className={cn(baseClasses, variants[variant], className)}>
      {children}
    </span>
  );
}