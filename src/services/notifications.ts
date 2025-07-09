import { apiClient } from './apiClient';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'appointment' | 'reminder';
  read_at?: string;
  created_at: string;
  updated_at: string;
  data?: Record<string, unknown>;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  appointment_reminders: boolean;
  status_updates: boolean;
  marketing_emails: boolean;
}

// Obtener notificaciones del usuario
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get('/notifications');
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error fetching notifications:', error);
    throw new Error('Error al obtener las notificaciones');
  }
};

// Obtener notificación específica
export const getNotification = async (id: number): Promise<Notification> => {
  try {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error fetching notification:', error);
    throw new Error('Error al obtener la notificación');
  }
};

// Marcar notificación como leída
export const markNotificationAsRead = async (id: number): Promise<void> => {
  try {
    await apiClient.post(`/notifications/${id}/read`);
  } catch (error: unknown) {
    console.error('Error marking notification as read:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al marcar la notificación como leída');
  }
};

// Marcar todas las notificaciones como leídas
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await apiClient.post('/notifications/mark-all-read');
  } catch (error: unknown) {
    console.error('Error marking all notifications as read:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al marcar todas las notificaciones como leídas');
  }
};

// Eliminar notificación
export const deleteNotification = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/notifications/${id}`);
  } catch (error: unknown) {
    console.error('Error deleting notification:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al eliminar la notificación');
  }
};

// Eliminar todas las notificaciones
export const deleteAllNotifications = async (): Promise<void> => {
  try {
    await apiClient.delete('/notifications');
  } catch (error: unknown) {
    console.error('Error deleting all notifications:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al eliminar todas las notificaciones');
  }
};

// Crear notificación
export const createNotification = async (notificationData: {
  title: string;
  message: string;
  type: string;
  user_id?: number;
  data?: Record<string, unknown>;
}): Promise<Notification> => {
  try {
    const response = await apiClient.post('/notifications', notificationData);
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error creating notification:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al crear la notificación');
  }
};

// Obtener estadísticas de notificaciones
export const getNotificationStats = async (): Promise<Record<string, unknown>> => {
  try {
    const response = await apiClient.get('/notifications/stats');
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error fetching notification stats:', error);
    throw new Error('Error al obtener estadísticas de notificaciones');
  }
};

// Enviar recordatorio de cita
export const sendAppointmentReminder = async (appointmentId: number): Promise<void> => {
  try {
    await apiClient.post(`/notifications/appointment-reminder/${appointmentId}`);
  } catch (error: unknown) {
    console.error('Error sending appointment reminder:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al enviar recordatorio de cita');
  }
};

// Enviar notificación de cambio de estado de cita
export const sendAppointmentStatusChange = async (appointmentId: number): Promise<void> => {
  try {
    await apiClient.post(`/notifications/appointment-status/${appointmentId}`);
  } catch (error: unknown) {
    console.error('Error sending appointment status change:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al enviar notificación de cambio de estado');
  }
};

// Obtener preferencias de notificaciones
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  try {
    const response = await apiClient.get('/notifications/preferences');
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error fetching notification preferences:', error);
    throw new Error('Error al obtener preferencias de notificaciones');
  }
};

// Actualizar preferencias de notificaciones
export const updateNotificationPreferences = async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
  try {
    const response = await apiClient.put('/notifications/preferences', preferences);
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error updating notification preferences:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al actualizar preferencias de notificaciones');
  }
}; 