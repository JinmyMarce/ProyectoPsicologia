import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'info' | 'primary' | 'secondary';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-5 py-2 rounded-xl text-base font-bold transition-all duration-300 tracking-wide transform hover:scale-105';
  
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'default':
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
          color: '#1e293b',
          boxShadow: '0 4px 16px rgba(255, 255, 255, 0.4), 0 2px 8px rgba(30, 41, 59, 0.2)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(30, 41, 59, 0.2)'
        };
      case 'secondary':
        return {
          background: 'linear-gradient(135deg, #6b1013 0%, #8e161a 50%, #1e293b 100%)',
          color: 'white',
          boxShadow: '0 4px 16px rgba(107, 16, 19, 0.4), 0 2px 8px rgba(30, 41, 59, 0.3)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
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
          background: 'linear-gradient(135deg, #1e2a37 0%, #334155 100%)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(30, 41, 59, 0.3)',
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
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
          color: '#1e293b',
          boxShadow: '0 4px 16px rgba(255, 255, 255, 0.4), 0 2px 8px rgba(30, 41, 59, 0.2)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(30, 41, 59, 0.2)'
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