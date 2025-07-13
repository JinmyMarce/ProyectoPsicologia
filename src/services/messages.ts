import { apiClient } from './apiClient';

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  subject: string;
  content: string;
  read: boolean;
  read_at: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  type: 'general' | 'appointment' | 'session' | 'system';
  related_id?: number;
  related_type?: string;
  attachments?: any[];
  created_at: string;
  updated_at: string;
  sender?: {
    id: number;
    name: string;
    email: string;
  };
  recipient?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface MessageStats {
  total: number;
  unread: number;
  read: number;
  urgent: number;
  high: number;
  normal: number;
  low: number;
}

export interface Recipient {
  id: number;
  name: string;
  email: string;
  dni: string;
}

export interface CreateMessageData {
  recipient_id: number;
  subject: string;
  content: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  type?: 'general' | 'appointment' | 'session' | 'system';
  related_id?: number;
  related_type?: string;
  attachments?: any[];
}

export interface MessagesResponse {
  success: boolean;
  data: Message[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface MessageResponse {
  success: boolean;
  data: Message;
}

export interface StatsResponse {
  success: boolean;
  data: MessageStats;
}

export interface RecipientsResponse {
  success: boolean;
  data: Recipient[];
}

class MessageService {
  // Obtener mensajes recibidos
  async getMessages(params?: {
    read?: boolean;
    type?: string;
    priority?: string;
    search?: string;
    per_page?: number;
  }): Promise<MessagesResponse> {
    const response = await apiClient.get('/messages', { params });
    return response.data;
  }

  // Obtener mensajes enviados
  async getSentMessages(params?: {
    type?: string;
    priority?: string;
    search?: string;
    per_page?: number;
  }): Promise<MessagesResponse> {
    const response = await apiClient.get('/messages/sent', { params });
    return response.data;
  }

  // Obtener un mensaje específico
  async getMessage(id: number): Promise<MessageResponse> {
    const response = await apiClient.get(`/messages/${id}`);
    return response.data;
  }

  // Enviar un mensaje
  async sendMessage(data: CreateMessageData): Promise<MessageResponse> {
    const response = await apiClient.post('/messages', data);
    return response.data;
  }

  // Marcar mensaje como leído
  async markAsRead(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/messages/${id}/read`);
    return response.data;
  }

  // Marcar todos los mensajes como leídos
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/messages/mark-all-read');
    return response.data;
  }

  // Eliminar un mensaje
  async deleteMessage(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/messages/${id}`);
    return response.data;
  }

  // Obtener conversación con un usuario
  async getConversation(userId: number, params?: {
    per_page?: number;
  }): Promise<MessagesResponse> {
    const response = await apiClient.get(`/messages/conversation/${userId}`, { params });
    return response.data;
  }

  // Obtener estadísticas de mensajes
  async getStats(): Promise<StatsResponse> {
    const response = await apiClient.get('/messages/stats');
    return response.data;
  }

  // Obtener destinatarios (solo para psicólogos)
  async getRecipients(params?: {
    search?: string;
  }): Promise<RecipientsResponse> {
    const response = await apiClient.get('/messages/recipients', { params });
    return response.data;
  }

  // Enviar mensaje de rechazo de cita
  async sendRejectionMessage(recipientId: number, appointmentId: number, reason: string): Promise<MessageResponse> {
    const data: CreateMessageData = {
      recipient_id: recipientId,
      subject: 'Cita rechazada',
      content: `Tu cita ha sido rechazada por el siguiente motivo: ${reason}. Por favor, contacta al psicólogo para reprogramar.`,
      type: 'appointment',
      priority: 'high',
      related_id: appointmentId,
      related_type: 'cita'
    };
    return this.sendMessage(data);
  }

  // Enviar mensaje de confirmación de cita
  async sendConfirmationMessage(recipientId: number, appointmentId: number, date: string, time: string): Promise<MessageResponse> {
    const data: CreateMessageData = {
      recipient_id: recipientId,
      subject: 'Cita confirmada',
      content: `Tu cita ha sido confirmada para el ${date} a las ${time}. Por favor, llega 10 minutos antes.`,
      type: 'appointment',
      priority: 'normal',
      related_id: appointmentId,
      related_type: 'cita'
    };
    return this.sendMessage(data);
  }

  // Enviar mensaje de seguimiento de sesión
  async sendSessionFollowUp(recipientId: number, sessionId: number, content: string): Promise<MessageResponse> {
    const data: CreateMessageData = {
      recipient_id: recipientId,
      subject: 'Seguimiento de sesión',
      content,
      type: 'session',
      priority: 'normal',
      related_id: sessionId,
      related_type: 'sesion'
    };
    return this.sendMessage(data);
  }
}

export const messageService = new MessageService(); 