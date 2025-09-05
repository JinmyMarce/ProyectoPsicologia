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
        'border-2 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 backdrop-blur-md transform hover:scale-[1.02]',
        {
          'p-0': padding === 'none',
          'p-6': padding === 'sm',
          'p-8': padding === 'md',
          'p-10': padding === 'lg',
        },
        className
      )}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 30%, #f1f5f9 70%, #ffffff 100%)',
        borderColor: 'rgba(30, 41, 59, 0.2)',
        boxShadow: `
          0 20px 60px rgba(255, 255, 255, 0.3),
          0 10px 30px rgba(30, 41, 59, 0.1),
          0 5px 15px rgba(51, 65, 85, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.8),
          inset 0 -1px 0 rgba(0, 0, 0, 0.05)
        `,
        color: '#1e293b',
        ...(hoverable && {
          ':hover': {
            borderColor: 'rgba(30, 41, 59, 0.3)',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 30%, #e2e8f0 70%, #f8fafc 100%)',
            boxShadow: `
              0 30px 80px rgba(255, 255, 255, 0.4),
              0 15px 40px rgba(30, 41, 59, 0.15),
              0 8px 20px rgba(51, 65, 85, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.9),
              inset 0 -1px 0 rgba(0, 0, 0, 0.08)
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
    <h3 className={cn("text-2xl font-bold mb-3", className)} style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      letterSpacing: '0.5px'
    }}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-base mt-2 leading-relaxed', className)} style={{
      color: '#475569',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      fontWeight: '400'
    }}>
      {children}
    </p>
  );
}