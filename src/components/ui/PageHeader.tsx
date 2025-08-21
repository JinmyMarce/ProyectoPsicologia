import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="py-6 px-8 mb-6 shadow-sm" style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
      borderBottom: '2px solid rgba(142, 22, 26, 0.2)',
      boxShadow: '0 2px 8px rgba(142, 22, 26, 0.1)'
    }}>
      <h1 className="text-3xl font-bold mb-2" style={{
        background: 'linear-gradient(135deg, #8e161a 0%, #a52a2a 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg" style={{
          color: '#475569',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
        }}>
          {subtitle}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
} 