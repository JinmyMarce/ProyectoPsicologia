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
        <label className="block text-sm font-bold mb-3 tracking-wide" style={{
          background: 'linear-gradient(135deg, #8e161a 0%, #a52a2a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        }}>
          {label}
        </label>
      )}
      <div className="relative pl-4 flex justify-center">
        {/* Icono izquierdo */}
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-[8.5%] top-1/2 transform -translate-y-1/2 w-7 h-7 flex items-center justify-center z-10 rounded-l-xl shadow-md border-r" style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderColor: 'rgba(142, 22, 26, 0.3)',
            boxShadow: '0 2px 8px rgba(142, 22, 26, 0.2)'
          }}>
            <Icon className="w-5 h-5 text-[#8e161a]" />
          </div>
        )}
        
        {/* Campo de entrada */}
        <input
          className={cn(
            "w-5/6 py-3 border-2 rounded-xl focus:ring-2 bg-white text-gray-900 placeholder:text-gray-500 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-lg focus:outline-none",
            Icon && iconPosition === 'left' ? "pl-4 pr-4" : "px-4",
            Icon && iconPosition === 'right' ? "pr-16 pl-4" : "px-4",
            hasRightButton ? "pr-12" : "",
            placeholderPosition === 'right' ? "text-right" : "text-left",
            error ? "border-[#8e161a] focus:ring-[#8e161a]/40" : "border-[#8e161a]/30 hover:border-[#8e161a]/50 focus:border-[#8e161a] focus:ring-[#8e161a]/40",
            className
          )}
          style={{
            borderColor: error ? '#8e161a' : 'rgba(142, 22, 26, 0.3)',
            boxShadow: error 
              ? '0 2px 8px rgba(142, 22, 26, 0.3)' 
              : '0 2px 8px rgba(142, 22, 26, 0.1)'
          }}
          placeholder={placeholder}
          {...props}
        />
        
        {/* Icono derecho */}
        {Icon && iconPosition === 'right' && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center z-10">
            <Icon className="w-5 h-5 text-[#8e161a]" />
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
        <p className="mt-1 ml-8 text-xs font-medium flex items-center gap-1 text-[#8e161a]">
          <span className="w-1 h-1 bg-[#8e161a] rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
}