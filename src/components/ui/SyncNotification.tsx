import React from 'react';
import { CheckCircle, Info, X } from 'lucide-react';

interface SyncNotificationProps {
  isVisible: boolean;
  message: string;
  type: 'success' | 'info';
  onClose: () => void;
}

export const SyncNotification: React.FC<SyncNotificationProps> = ({
  isVisible,
  message,
  type,
  onClose
}) => {
  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-blue-800';
  const iconColor = type === 'success' ? 'text-green-600' : 'text-blue-600';

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className={`${bgColor} border ${textColor} px-4 py-3 rounded-lg shadow-lg`}>
        <div className="flex items-start">
          <div className={`${iconColor} mt-0.5 mr-3`}>
            {type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {type === 'success' ? '¡Sincronización exitosa!' : 'Información'}
            </p>
            <p className="text-sm mt-1">{message}</p>
          </div>
          <button
            onClick={onClose}
            className={`${iconColor} hover:opacity-70 transition-opacity ml-3`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};