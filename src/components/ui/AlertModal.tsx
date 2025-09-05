import React from 'react';
import { X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  showIcon?: boolean;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  showIcon = true
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-[#6b1013] to-[#8e161a]',
          border: 'border-[#10b981]',
          title: 'text-white',
          message: 'text-[#e2e8f0]',
          button: 'bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857]'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-[#6b1013] to-[#8e161a]',
          border: 'border-[#f59e0b]',
          title: 'text-white',
          message: 'text-[#e2e8f0]',
          button: 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309]'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-[#6b1013] to-[#8e161a]',
          border: 'border-[#ef4444]',
          title: 'text-white',
          message: 'text-[#e2e8f0]',
          button: 'bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#dc2626] hover:to-[#b91c1c]'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-[#6b1013] to-[#8e161a]',
          border: 'border-[#3b82f6]',
          title: 'text-white',
          message: 'text-[#e2e8f0]',
          button: 'bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8]'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-[#ffffff] to-[#f8fafc] rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-500 ease-out border-2 border-[#6b1013]/30">
        {/* Header con gradiente */}
        <div className={`${colors.bg} ${colors.border} border-b-2 rounded-t-2xl p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showIcon && getIcon()}
              <h3 className={`text-lg font-bold ${colors.title}`}>
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-[#e2e8f0] transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-8 bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
          <p className={`text-base leading-relaxed ${colors.message} mb-8`}>
            {message}
          </p>
          
          {/* Footer */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`${colors.button} text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
