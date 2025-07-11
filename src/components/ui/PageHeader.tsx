import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="bg-blanco border-b-4 border-granate py-6 px-8 mb-6">
      <h1 className="text-3xl font-bold text-granate mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg text-gris-oscuro">
          {subtitle}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
} 