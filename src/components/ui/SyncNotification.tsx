import React, { useEffect, useState } from 'react';
import { CheckCircle, Info, X, AlertCircle, AlertTriangle, Clock } from 'lucide-react';

export type NotificationType = 'success' | 'info' | 'warning' | 'error' | 'loading';

interface SyncNotificationProps {
  isVisible: boolean;
  message: string;
  type: NotificationType;
  onClose: () => void;
  title?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
  showProgress?: boolean;
}

export const SyncNotification: React.FC<SyncNotificationProps> = ({
  isVisible,
  message,
  type,
  onClose,
  title,
  autoClose = true,
  autoCloseDelay = 4000,
  showProgress = true
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Efecto para manejar la animación de entrada
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setProgress(0);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible]);

  // Efecto para auto-cierre
  useEffect(() => {
    if (isVisible && autoClose) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (autoCloseDelay / 50));
          if (newProgress >= 100) {
            clearInterval(interval);
            handleClose();
            return 100;
          }
          return newProgress;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isVisible, autoClose, autoCloseDelay]);

  // Efecto para cerrar notificación cuando cambia la interfaz (navegación)
  useEffect(() => {
    const handleRouteChange = () => {
      if (isVisible) {
        handleClose();
      }
    };

    // Escuchar cambios en la URL
    const handlePopState = () => {
      handleRouteChange();
    };

    // Escuchar clics en enlaces de navegación
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.closest('a')) {
        handleRouteChange();
      }
    };

    if (isVisible) {
      window.addEventListener('popstate', handlePopState);
      document.addEventListener('click', handleLinkClick);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
        document.removeEventListener('click', handleLinkClick);
      };
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5";
    
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-600`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-600`} />;
      case 'loading':
        return <Clock className={`${iconClass} text-blue-600 animate-spin`} />;
      default:
        return <Info className={`${iconClass} text-blue-600`} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 border-green-200';
      case 'error':
        return 'bg-gradient-to-r from-red-50 via-rose-50 to-red-100 border-red-200';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-100 border-yellow-200';
      case 'loading':
        return 'bg-gradient-to-r from-blue-50 via-sky-50 to-blue-100 border-blue-200';
      default:
        return 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'loading':
        return 'text-blue-800';
      default:
        return 'text-blue-800';
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'loading':
        return 'bg-blue-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'success':
        return '¡Éxito!';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Advertencia';
      case 'loading':
        return 'Procesando...';
      default:
        return 'Información';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div 
        className={`${getBackgroundColor()} border-2 ${getTextColor()} px-4 py-3 rounded-xl shadow-2xl transform transition-all duration-300 ${
          isAnimating ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
        }`}
        style={{
          boxShadow: `
            0 20px 40px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `
        }}
      >
        {/* Barra de progreso para auto-cierre */}
        {autoClose && showProgress && (
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div 
              className={`h-full ${getProgressColor()} transition-all duration-75 ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5 mr-3">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">
              {title || getDefaultTitle()}
            </p>
            <p className="text-sm mt-1 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-white/50 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};