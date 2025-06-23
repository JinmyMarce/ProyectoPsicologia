import { apiClient } from './apiClient';
import { Notification } from '../types';

export interface NotificationFilters {
  type?: string;
  read?: boolean;
  page?: number;
  per_page?: number;
}

export interface CreateNotificationData {
  userId: string;
  type: 'appointment' | 'reminder' | 'status' | 'system';
  title: string;
  message: string;
}

export const notificationService = {
  // Obtener todas las notificaciones del usuario actual
  async getNotifications(filters: NotificationFilters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/notifications?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener notificaciones');
    }
  },

  // Obtener una notificación específica
  async getNotification(id: string) {
    try {
      const response = await apiClient.get(`/notifications/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener notificación');
    }
  },

  // Marcar notificación como leída
  async markAsRead(id: string) {
    try {
      const response = await apiClient.post(`/notifications/${id}/read`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al marcar como leída');
    }
  },

  // Marcar todas las notificaciones como leídas
  async markAllAsRead() {
    try {
      const response = await apiClient.post('/notifications/mark-all-read');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al marcar todas como leídas');
    }
  },

  // Eliminar una notificación
  async deleteNotification(id: string) {
    try {
      const response = await apiClient.delete(`/notifications/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar notificación');
    }
  },

  // Eliminar todas las notificaciones
  async deleteAllNotifications() {
    try {
      const response = await apiClient.delete('/notifications');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar todas las notificaciones');
    }
  },

  // Crear una nueva notificación (solo para admins)
  async createNotification(notificationData: CreateNotificationData) {
    try {
      const response = await apiClient.post('/notifications', notificationData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear notificación');
    }
  },

  // Obtener estadísticas de notificaciones
  async getNotificationStats() {
    try {
      const response = await apiClient.get('/notifications/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  // Enviar notificación de recordatorio de cita
  async sendAppointmentReminder(appointmentId: string) {
    try {
      const response = await apiClient.post(`/notifications/appointment-reminder/${appointmentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar recordatorio');
    }
  },

  // Enviar notificación de cambio de estado de cita
  async sendAppointmentStatusChange(appointmentId: string, status: string) {
    try {
      const response = await apiClient.post(`/notifications/appointment-status/${appointmentId}`, {
        status
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar notificación de estado');
    }
  },

  // Configurar preferencias de notificaciones
  async updateNotificationPreferences(preferences: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    appointment_reminders?: boolean;
    status_updates?: boolean;
    system_notifications?: boolean;
  }) {
    try {
      const response = await apiClient.put('/notifications/preferences', preferences);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar preferencias');
    }
  },

  // Obtener preferencias de notificaciones
  async getNotificationPreferences() {
    try {
      const response = await apiClient.get('/notifications/preferences');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener preferencias');
    }
  }
}; 