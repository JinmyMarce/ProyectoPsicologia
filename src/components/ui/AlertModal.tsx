import React from 'react';
import { createPortal } from 'react-dom';
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
    const iconClass = "w-7 h-7 xs:w-8 xs:h-8";
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-emerald-600 drop-shadow-md`} strokeWidth={2.5} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-amber-600 drop-shadow-md`} strokeWidth={2.5} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-600 drop-shadow-md`} strokeWidth={2.5} />;
      default:
        return <Info className={`${iconClass} text-blue-600 drop-shadow-md`} strokeWidth={2.5} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          iconBg: 'bg-emerald-50',
          iconBorder: 'border-emerald-200',
          iconColor: 'text-emerald-600',
          headerBg: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
          border: 'border-emerald-300',
          title: 'text-emerald-900',
          message: 'text-slate-700',
          button: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/30',
          glow: 'shadow-emerald-500/20'
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-50',
          iconBorder: 'border-amber-200',
          iconColor: 'text-amber-600',
          headerBg: 'bg-gradient-to-r from-amber-50 to-amber-100',
          border: 'border-amber-300',
          title: 'text-amber-900',
          message: 'text-slate-700',
          button: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/30',
          glow: 'shadow-amber-500/20'
        };
      case 'error':
        return {
          iconBg: 'bg-red-50',
          iconBorder: 'border-red-200',
          iconColor: 'text-red-600',
          headerBg: 'bg-gradient-to-r from-red-50 to-red-100',
          border: 'border-red-300',
          title: 'text-red-900',
          message: 'text-slate-700',
          button: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30',
          glow: 'shadow-red-500/20'
        };
      default:
        return {
          iconBg: 'bg-blue-50',
          iconBorder: 'border-blue-200',
          iconColor: 'text-blue-600',
          headerBg: 'bg-gradient-to-r from-blue-50 to-blue-100',
          border: 'border-blue-300',
          title: 'text-blue-900',
          message: 'text-slate-700',
          button: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30',
          glow: 'shadow-blue-500/20'
        };
    }
  };

  const colors = getColors();

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 xs:p-4">
      {/* Backdrop - Fondo negro transparente para toda la pantalla */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Moderno y Elegante */}
      <div className={`relative bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-[320px] xs:max-w-[360px] w-full transform transition-all duration-300 ease-out border-2 ${colors.border} ${colors.glow} animate-in fade-in zoom-in-95 backdrop-blur-sm`}>
        {/* Header Moderno */}
        <div className={`${colors.headerBg} border-b-2 ${colors.border} rounded-t-3xl p-5 xs:p-6`}>
          {/* Patrón decorativo sutil */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-t-3xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-current to-transparent rounded-full blur-2xl -mr-16 -mt-16"></div>
          </div>
          
          <div className="flex flex-col items-center gap-3.5 xs:gap-4 relative z-10">
            {showIcon && (
              <div className={`${colors.iconBg} ${colors.iconBorder} border-2 rounded-2xl p-3 xs:p-3.5 flex-shrink-0 shadow-xl relative transform transition-all duration-300`}>
                {/* Efecto de brillo interno */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/50 to-transparent rounded-2xl"></div>
                <div className="relative z-10">{getIcon()}</div>
              </div>
            )}
            <h3 className={`text-lg xs:text-xl font-black ${colors.title} leading-tight text-center`}>
              {title}
            </h3>
            <div className={`h-1 w-14 rounded-full ${
              type === 'success' ? 'bg-emerald-400' :
              type === 'warning' ? 'bg-amber-400' :
              type === 'error' ? 'bg-red-400' :
              'bg-blue-400'
            }`}></div>
          </div>
        </div>
        
        {/* Content Moderno */}
        <div className="p-5 xs:p-6 bg-gradient-to-br from-white via-slate-50/30 to-white relative">
          {/* Fondo decorativo sutil */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-transparent"></div>
          </div>
          
          <p className={`text-sm xs:text-base leading-relaxed ${colors.message} mb-5 xs:mb-6 text-center font-semibold relative z-10`}>
            {message}
          </p>
          
          {/* Footer Moderno */}
          <div className="flex justify-center relative z-10">
            <button
              onClick={onClose}
              className={`${colors.button} group w-full px-8 xs:px-10 py-3 xs:py-3.5 rounded-xl font-bold text-sm xs:text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white overflow-hidden relative`}
            >
              {/* Efecto de brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative z-10">Entendido</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
