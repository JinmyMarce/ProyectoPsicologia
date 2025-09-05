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
        <label className="block text-sm font-bold mb-3 tracking-wide text-gray-700">
          {label}
        </label>
      )}
      <div className="relative pl-4 flex justify-center">
        {/* Icono izquierdo */}
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-[8.5%] top-1/2 transform -translate-y-1/2 w-7 h-7 flex items-center justify-center z-10 rounded-l-xl bg-gray-100 border border-gray-200">
            <Icon className="w-5 h-5 text-gray-600" />
          </div>
        )}
        
        {/* Campo de entrada */}
        <input
          className={cn(
            "w-5/6 py-4 border-2 rounded-xl focus:ring-2 bg-white text-gray-900 placeholder:text-gray-500 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md focus:outline-none",
            Icon && iconPosition === 'left' ? "pl-5 pr-5" : "px-5",
            Icon && iconPosition === 'right' ? "pr-16 pl-5" : "px-5",
            hasRightButton ? "pr-12" : "",
            placeholderPosition === 'right' ? "text-right" : "text-left",
            error ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500/20",
            className
          )}
          placeholder={placeholder}
          {...props}
        />
        
        {/* Icono derecho */}
        {Icon && iconPosition === 'right' && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center z-10">
            <Icon className="w-5 h-5 text-[#6b1013]" />
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
        <p className="mt-1 ml-8 text-xs font-medium flex items-center gap-1 text-[#6b1013]">
          <span className="w-1 h-1 bg-[#6b1013] rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
}