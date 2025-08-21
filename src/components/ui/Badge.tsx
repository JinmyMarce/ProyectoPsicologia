import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'info' | 'primary' | 'secondary';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold transition-all duration-300';
  
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'default':
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #8e161a 0%, #a52a2a 100%)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(142, 22, 26, 0.3)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        };
      case 'secondary':
        return {
          background: 'linear-gradient(135deg, #1e2a37 0%, #334155 100%)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(30, 42, 55, 0.3)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        };
      case 'success':
        return {
          background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(4, 120, 87, 0.3)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        };
      case 'info':
        return {
          background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        };
      case 'warning':
        return {
          background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        };
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #8e161a 0%, #a52a2a 100%)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(142, 22, 26, 0.3)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        };
    }
  };

  const styles = getVariantStyles(variant);

  return (
    <span 
      className={cn(baseClasses, className)}
      style={styles}
    >
      {children}
    </span>
  );
}