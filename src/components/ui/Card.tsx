import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export function Card({ children, className, padding = 'md', hoverable = false }: CardProps) {
  return (
    <div
      className={cn(
        'border-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300',
        {
          'p-0': padding === 'none',
          'p-4': padding === 'sm',
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
        },
        className
      )}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
        borderColor: 'rgba(142, 22, 26, 0.2)',
        boxShadow: `
          0 4px 15px rgba(0, 0, 0, 0.1),
          0 2px 8px rgba(142, 22, 26, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.8)
        `,
        ...(hoverable && {
          ':hover': {
            borderColor: 'rgba(142, 22, 26, 0.3)',
            background: 'linear-gradient(135deg, #fefefe 0%, #f1f5f9 50%, #fefefe 100%)',
            boxShadow: `
              0 8px 25px rgba(0, 0, 0, 0.15),
              0 4px 15px rgba(142, 22, 26, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.9)
            `
          }
        })
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-xl font-bold mb-2", className)} style={{
      background: 'linear-gradient(135deg, #8e161a 0%, #a52a2a 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-sm mt-1', className)} style={{
      color: '#475569',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    }}>
      {children}
    </p>
  );
}