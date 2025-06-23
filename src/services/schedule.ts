import { apiClient } from './apiClient';
import { TimeSlot } from '../types';

export interface ScheduleSlot {
  id: string;
  psychologist_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduleData {
  psychologist_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface UpdateScheduleData {
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
  is_blocked?: boolean;
}

export interface ScheduleFilters {
  psychologist_id?: string;
  date_from?: string;
  date_to?: string;
  is_available?: boolean;
  is_blocked?: boolean;
}

export const scheduleService = {
  // Obtener horarios de un psicólogo
  async getPsychologistSchedule(psychologistId: string, filters: ScheduleFilters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/schedule/psychologist/${psychologistId}?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener horarios');
    }
  },

  // Obtener horarios disponibles para agendar
  async getAvailableSlots(psychologistId: string, date: string) {
    try {
      const response = await apiClient.get(`/schedule/available/${psychologistId}`, {
        params: { date }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener horarios disponibles');
    }
  },

  // Crear un nuevo horario
  async createSchedule(scheduleData: CreateScheduleData) {
    try {
      const response = await apiClient.post('/schedule', scheduleData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear horario');
    }
  },

  // Crear múltiples horarios
  async createBulkSchedule(schedules: CreateScheduleData[]) {
    try {
      const response = await apiClient.post('/schedule/bulk', { schedules });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear horarios');
    }
  },

  // Actualizar un horario
  async updateSchedule(id: string, scheduleData: UpdateScheduleData) {
    try {
      const response = await apiClient.put(`/schedule/${id}`, scheduleData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar horario');
    }
  },

  // Eliminar un horario
  async deleteSchedule(id: string) {
    try {
      const response = await apiClient.delete(`/schedule/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar horario');
    }
  },

  // Bloquear un horario
  async blockSchedule(id: string, reason: string) {
    try {
      const response = await apiClient.post(`/schedule/${id}/block`, { reason });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al bloquear horario');
    }
  },

  // Desbloquear un horario
  async unblockSchedule(id: string) {
    try {
      const response = await apiClient.post(`/schedule/${id}/unblock`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al desbloquear horario');
    }
  },

  // Obtener horarios por fecha
  async getScheduleByDate(date: string, psychologistId?: string) {
    try {
      const params: any = { date };
      if (psychologistId) {
        params.psychologist_id = psychologistId;
      }

      const response = await apiClient.get('/schedule/by-date', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener horarios por fecha');
    }
  },

  // Obtener horarios por rango de fechas
  async getScheduleByDateRange(dateFrom: string, dateTo: string, psychologistId?: string) {
    try {
      const params: any = { date_from: dateFrom, date_to: dateTo };
      if (psychologistId) {
        params.psychologist_id = psychologistId;
      }

      const response = await apiClient.get('/schedule/by-range', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener horarios por rango');
    }
  },

  // Obtener horarios conflictivos
  async getConflictingSlots(psychologistId: string, date: string, startTime: string, endTime: string) {
    try {
      const response = await apiClient.get('/schedule/conflicts', {
        params: {
          psychologist_id: psychologistId,
          date,
          start_time: startTime,
          end_time: endTime
        }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al verificar conflictos');
    }
  },

  // Obtener estadísticas de horarios
  async getScheduleStats(psychologistId?: string) {
    try {
      const params: any = {};
      if (psychologistId) {
        params.psychologist_id = psychologistId;
      }

      const response = await apiClient.get('/schedule/stats', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  // Importar horarios desde archivo
  async importSchedule(file: File, psychologistId: string) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('psychologist_id', psychologistId);

      const response = await apiClient.post('/schedule/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al importar horarios');
    }
  },

  // Exportar horarios
  async exportSchedule(filters: ScheduleFilters = {}, format: 'csv' | 'excel' = 'csv') {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      params.append('format', format);

      const response = await apiClient.get(`/schedule/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al exportar horarios');
    }
  }
}; 