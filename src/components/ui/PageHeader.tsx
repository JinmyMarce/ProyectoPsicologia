import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  // Si el título está vacío, no mostrar el header
  if (!title || title.trim() === '') {
    return null;
  }

  return (
    <div className="py-8 px-2 sm:px-4 lg:px-6 mb-6 shadow-2xl bg-gradient-to-r from-[#ffffff] via-[#f8fafc] to-[#f1f5f9] border-b-2 border-[#6b1013]/30 rounded-b-3xl">
      <h1 className="text-5xl font-bold mb-6 text-[#1e293b]" style={{
        letterSpacing: '1px',
        textShadow: '0 6px 12px rgba(30, 41, 59, 0.2)',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        {title}
      </h1>
      {subtitle && (
        <p className="text-2xl text-[#475569] font-medium" style={{
          textShadow: '0 3px 6px rgba(30, 41, 59, 0.1)',
          letterSpacing: '0.3px'
        }}>
          {subtitle}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
} 