import React from 'react';
import { cn } from '../../lib/utils';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
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
  const base =
    'inline-flex items-center justify-center rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-granate text-white hover:bg-granate-dark focus:ring-granate border border-granate',
    secondary:
      'bg-azul-marino text-white hover:bg-azul-electrico focus:ring-azul-marino border border-azul-marino',
    outline:
      'bg-white text-granate border border-granate hover:bg-granate hover:text-white',
    neutral:
      'bg-gris-claro text-negro border border-gris-medio hover:bg-gris-medio',
    success:
      'bg-verde-esmeralda text-white',
    warning:
      'bg-mostaza text-negro',
    danger:
      'bg-naranja-quemado text-white',
  };

  return (
    <button
      className={cn(
        base,
        variants[variant],
        {
          'px-3 py-1.5 text-sm': size === 'sm',
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