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
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide transform hover:scale-105 active:scale-95';

  const variants = {
    primary: 'text-white shadow-lg hover:shadow-xl transition-all duration-200 border-2',
    secondary: 'text-white shadow-lg hover:shadow-xl transition-all duration-200 border-2',
    outline: 'bg-transparent border-2 shadow-md hover:shadow-lg transition-all duration-200',
    ghost: 'bg-transparent border border-transparent transition-all duration-200',
    danger: 'text-white shadow-lg hover:shadow-xl transition-all duration-200 border-2',
  };

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
          borderColor: 'rgba(30, 41, 59, 0.2)',
          color: '#1e293b',
          boxShadow: '0 8px 32px rgba(255, 255, 255, 0.4), 0 4px 16px rgba(30, 41, 59, 0.2)',
          hoverBackground: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
          hoverBoxShadow: '0 12px 40px rgba(255, 255, 255, 0.5), 0 6px 20px rgba(30, 41, 59, 0.3)',
          focusRing: 'rgba(30, 41, 59, 0.4)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        };
      case 'secondary':
        return {
          background: 'linear-gradient(135deg, #6b1013 0%, #8e161a 50%, #b91c1c 100%)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          color: '#ffffff',
          boxShadow: '0 8px 32px rgba(107, 16, 19, 0.4), 0 4px 16px rgba(142, 22, 26, 0.3)',
          hoverBackground: 'linear-gradient(135deg, #8e161a 0%, #b91c1c 50%, #dc2626 100%)',
          hoverBoxShadow: '0 12px 40px rgba(107, 16, 19, 0.5), 0 6px 20px rgba(142, 22, 26, 0.4)',
          focusRing: 'rgba(107, 16, 19, 0.6)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        };
      case 'outline':
        return {
          background: 'rgba(255, 255, 255, 0.9)',
          borderColor: 'rgba(30, 41, 59, 0.3)',
          color: '#1e293b',
          boxShadow: '0 4px 16px rgba(255, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          hoverBackground: 'linear-gradient(135deg, rgba(30, 41, 59, 0.1) 0%, rgba(51, 65, 85, 0.1) 100%)',
          hoverColor: '#1e293b',
          hoverBoxShadow: '0 8px 24px rgba(255, 255, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
          focusRing: 'rgba(30, 41, 59, 0.4)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        };
      case 'ghost':
        return {
          background: 'rgba(255, 255, 255, 0.8)',
          borderColor: 'rgba(30, 41, 59, 0.1)',
          color: '#1e293b',
          boxShadow: '0 2px 8px rgba(255, 255, 255, 0.2)',
          hoverBackground: 'rgba(30, 41, 59, 0.1)',
          hoverBorderColor: 'rgba(30, 41, 59, 0.2)',
          hoverBoxShadow: '0 4px 16px rgba(255, 255, 255, 0.3)',
          focusRing: 'rgba(30, 41, 59, 0.3)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        };
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #dc2626 100%)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(220, 38, 38, 0.4), 0 4px 16px rgba(239, 68, 68, 0.3)',
          hoverBackground: 'linear-gradient(135deg, #ef4444 0%, #f87171 50%, #ef4444 100%)',
          hoverBoxShadow: '0 12px 40px rgba(220, 38, 38, 0.5), 0 6px 20px rgba(239, 68, 68, 0.4)',
          focusRing: 'rgba(220, 38, 38, 0.6)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
          borderColor: 'rgba(30, 41, 59, 0.2)',
          color: '#1e293b',
          boxShadow: '0 8px 32px rgba(255, 255, 255, 0.4), 0 4px 16px rgba(30, 41, 59, 0.2)',
          hoverBackground: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
          hoverBoxShadow: '0 12px 40px rgba(255, 255, 255, 0.5), 0 6px 20px rgba(30, 41, 59, 0.3)',
          focusRing: 'rgba(30, 41, 59, 0.4)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        };
    }
  };

  const styles = getVariantStyles(variant);

  return (
    <button
      className={cn(
        base,
        variants[variant],
        {
          'px-6 py-2.5 text-sm': size === 'sm',
          'px-8 py-3 text-sm': size === 'md',
          'px-10 py-4 text-base': size === 'lg',
        },
        className
      )}
      style={{
        background: styles.background,
        borderColor: styles.borderColor,
        color: styles.color || 'white',
        boxShadow: styles.boxShadow,
        textShadow: styles.textShadow,
        ...(variant === 'outline' && { color: styles.color }),
        ...(variant === 'ghost' && { color: styles.color }),
      }}
      onMouseEnter={(e) => {
        if (variant === 'outline' || variant === 'ghost') {
          e.currentTarget.style.background = styles.hoverBackground;
          e.currentTarget.style.color = styles.hoverColor || 'white';
          e.currentTarget.style.borderColor = styles.hoverBorderColor || styles.borderColor;
          e.currentTarget.style.boxShadow = styles.hoverBoxShadow;
        } else {
          e.currentTarget.style.background = styles.hoverBackground;
          e.currentTarget.style.boxShadow = styles.hoverBoxShadow;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = styles.background;
        e.currentTarget.style.color = styles.color || 'white';
        e.currentTarget.style.borderColor = styles.borderColor;
        e.currentTarget.style.boxShadow = styles.boxShadow;
      }}
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