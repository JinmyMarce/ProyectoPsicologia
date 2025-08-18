import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="bg-blanco border-b-4 border-granate-800 py-6 px-8 mb-6 shadow-sm">
      <h1 className="text-3xl font-bold text-granate-800 mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg text-azul-marino-700">
          {subtitle}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
} 