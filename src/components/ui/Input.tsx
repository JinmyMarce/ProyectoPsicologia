import React from 'react';
import { clsx } from 'clsx';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

export function Input({
  className,
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          className={clsx(
            'w-full px-4 py-2 border-2 border-cyan-300/60 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-violet-400 transition-all duration-300 glass animate-fade-in-up animate-gradient-shift bg-white/40 backdrop-blur-lg text-gray-900 placeholder:text-cyan-700/60',
            {
              'pl-10': Icon && iconPosition === 'left',
              'pr-10': Icon && iconPosition === 'right',
              'border-red-300 focus:ring-red-500': error,
            },
            className
          )}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}