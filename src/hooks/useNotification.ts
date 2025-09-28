import { useState, useCallback } from 'react';
import { NotificationType } from '../components/ui/SyncNotification';

interface NotificationState {
  isVisible: boolean;
  type: NotificationType;
  title: string;
  message: string;
  autoClose: boolean;
  autoCloseDelay: number;
  showProgress: boolean;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    isVisible: false,
    type: 'info',
    title: '',
    message: '',
    autoClose: true,
    autoCloseDelay: 4000,
    showProgress: true
  });

  const showNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      autoClose?: boolean;
      autoCloseDelay?: number;
      showProgress?: boolean;
    }
  ) => {
    setNotification({
      isVisible: true,
      type,
      title,
      message,
      autoClose: options?.autoClose ?? true,
      autoCloseDelay: options?.autoCloseDelay ?? 4000,
      showProgress: options?.showProgress ?? true
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  const showSuccess = useCallback((title: string, message: string, options?: Parameters<typeof showNotification>[3]) => {
    showNotification('success', title, message, options);
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, options?: Parameters<typeof showNotification>[3]) => {
    showNotification('error', title, message, options);
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, options?: Parameters<typeof showNotification>[3]) => {
    showNotification('warning', title, message, options);
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, options?: Parameters<typeof showNotification>[3]) => {
    showNotification('info', title, message, options);
  }, [showNotification]);

  const showLoading = useCallback((title: string, message: string, options?: Parameters<typeof showNotification>[3]) => {
    showNotification('loading', title, message, options);
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading
  };
};


