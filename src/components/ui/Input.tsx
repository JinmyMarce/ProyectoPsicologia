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
        <label className="block text-sm font-bold text-[#6d1115] mb-3 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative pl-4">
        {/* Icono izquierdo */}
        {Icon && iconPosition === 'left' && (
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-7 h-7 flex items-center justify-center z-10 bg-white rounded-l-xl shadow-md border-r border-[#8e161a]/30">
            <Icon className="w-5 h-5 text-[#8e161a]" />
          </div>
        )}
        
        {/* Campo de entrada */}
        <input
          className={cn(
            "w-full py-4 border-2 border-[#8e161a]/30 rounded-xl focus:ring-2 focus:ring-[#8e161a]/30 focus:border-[#8e161a] bg-white text-black placeholder:text-gray-500 transition-all duration-300 text-base font-medium shadow-sm hover:shadow-lg hover:border-[#8e161a]/50 focus:outline-none border-[#8e161a]/30",
            Icon && iconPosition === 'left' ? "pl-4 pr-4" : "px-4",
            Icon && iconPosition === 'right' ? "pr-16 pl-4" : "px-4",
            hasRightButton ? "pr-12" : "",
            placeholderPosition === 'right' ? "text-right" : "text-left",
            error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-[#8e161a]/30 focus:ring-[#8e161a]/30 focus:border-[#8e161a]",
            className
          )}
          placeholder={placeholder}
          style={{ borderColor: 'rgba(142, 22, 26, 0.3)' }}
          {...props}
        />
        
        {/* Icono derecho */}
        {Icon && iconPosition === 'right' && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center z-10">
            <Icon className="w-5 h-5 text-gray-500" />
          </div>
        )}
        
        {/* Botón derecho (ojo) */}
        {rightButton && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-20">
            {rightButton}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
}