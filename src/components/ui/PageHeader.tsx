import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold text-gray-800 tracking-tight sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          {subtitle}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
} 