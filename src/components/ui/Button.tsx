import React from 'react';
import { clsx } from 'clsx';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: typeof LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed glass animate-fade-in-up animate-gradient-shift shadow-lg',
        {
          'bg-gradient-to-r from-[#8e161a] via-cyan-500 to-violet-600 text-white hover:from-cyan-500 hover:to-violet-700 focus:ring-cyan-400 hover:shadow-[0_0_16px_4px_rgba(56,189,248,0.4)] hover:scale-105': variant === 'primary',
          'bg-gradient-to-r from-gray-100 via-white to-gray-200 text-gray-900 hover:from-cyan-100 hover:to-violet-100 focus:ring-violet-300 hover:shadow-[0_0_12px_2px_rgba(139,92,246,0.2)] hover:scale-105': variant === 'secondary',
          'border-2 border-cyan-400 bg-white/60 text-cyan-700 hover:bg-cyan-50 focus:ring-cyan-400 hover:shadow-[0_0_12px_2px_rgba(56,189,248,0.2)] hover:scale-105': variant === 'outline',
          'text-cyan-700 hover:bg-cyan-50 focus:ring-cyan-400 hover:shadow-[0_0_12px_2px_rgba(56,189,248,0.2)] hover:scale-105': variant === 'ghost',
          'bg-gradient-to-r from-red-600 via-pink-500 to-violet-600 text-white hover:from-pink-500 hover:to-violet-700 focus:ring-pink-400 hover:shadow-[0_0_16px_4px_rgba(236,72,153,0.4)] hover:scale-105': variant === 'danger',
        },
        {
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {Icon && iconPosition === 'left' && !loading && <Icon className="w-4 h-4 mr-2" />}
      {children}
      {Icon && iconPosition === 'right' && !loading && <Icon className="w-4 h-4 ml-2" />}
    </button>
  );
}