import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  placeholderPosition?: 'left' | 'right';
  hasRightButton?: boolean;
  rightButton?: React.ReactNode;
}

export function Input({
  className,
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  placeholderPosition = 'left',
  hasRightButton = false,
  rightButton,
  placeholder,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-granate-800 mb-3 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative pl-4 flex justify-center">
        {/* Icono izquierdo */}
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-[8.5%] top-1/2 transform -translate-y-1/2 w-7 h-7 flex items-center justify-center z-10 bg-blanco rounded-l-xl shadow-md border-r border-granate-800/30">
            <Icon className="w-5 h-5 text-granate-800/70" />
          </div>
        )}
        
        {/* Campo de entrada */}
        <input
          className={cn(
            "w-5/6 py-3 border-2 border-granate-800/30 rounded-xl focus:ring-2 focus:ring-granate-500/40 focus:border-granate-700/50 bg-blanco text-negro placeholder:text-gray-500 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-lg hover:border-granate-800/50 focus:outline-none",
            Icon && iconPosition === 'left' ? "pl-4 pr-4" : "px-4",
            Icon && iconPosition === 'right' ? "pr-16 pl-4" : "px-4",
            hasRightButton ? "pr-12" : "",
            placeholderPosition === 'right' ? "text-right" : "text-left",
            error ? "border-granate-800 focus:ring-granate-700 focus:border-granate-900" : "border-granate-800/30 focus:ring-granate-500/40 focus:border-granate-700/50",
            className
          )}
          placeholder={placeholder}
          {...props}
        />
        
        {/* Icono derecho */}
        {Icon && iconPosition === 'right' && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center z-10">
            <Icon className="w-5 h-5 text-granate-800/70" />
          </div>
        )}
        
        {/* Botón derecho (ojo) */}
        {rightButton && (
          <div className="absolute right-[8.5%] top-1/2 transform -translate-y-1/2 z-20">
            {rightButton}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 ml-8 text-xs text-granate-800 font-medium flex items-center gap-1">
          <span className="w-1 h-1 bg-granate-800 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
}