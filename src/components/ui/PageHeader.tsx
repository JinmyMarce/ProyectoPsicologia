import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-lg font-bold text-gray-800 tracking-tight sm:text-xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-xs text-gray-600 sm:text-sm">
          {subtitle}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
} 